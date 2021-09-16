/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import chalk from 'chalk'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { ProbeAlert, Probe } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import { getAllLogs, saveProbeRequestLog } from './history'
import { log } from '../../utils/pino'

import { LogObject } from '../../interfaces/logs'
import { saveNotificationLog } from '../logger/history'

/**
 * getStatusColor colorizes different statusCode
 * @param {any} responseCode is the httpStatus to colorize
 * @returns {string} color code based on chalk: Chalk & { supportsColor: ColorSupport };
 */
export function getStatusColor(responseCode: number) {
  switch (Math.trunc(responseCode / 100)) {
    case 2:
      return 'cyan'
    case 4:
      return 'orange'
    case 5: // all 5xx errrors
    case 0: // 0 is uri not found
      return 'red'
  }

  return 'white'
}

/**
 * probeBuildLog builds the last probe results for logging (through history.ts)
 * @returns {LogObject} mLog built log
 */
export function probeBuildLog({
  checkOrder,
  probe,
  totalRequests,
  probeRes,
  alerts,
  error,
  mLog,
}: {
  checkOrder: number
  probe: Probe
  totalRequests: number
  probeRes: AxiosResponseWithExtraData
  alerts?: ProbeAlert[]
  error?: string
  mLog: LogObject
}): LogObject {
  mLog.type = 'PROBE'
  mLog.iteration = checkOrder
  mLog.probeId = probe.id
  mLog.method = probe.requests[totalRequests].method
  mLog.url = probe.requests[totalRequests].url
  mLog.responseCode = probeRes.status
  mLog.responseTime = probeRes.config.extraData?.responseTime ?? 0

  // specific alerts/notif for http status codes
  switch (mLog.responseCode) {
    case 0:
      mLog.alert.flag = 'alert'
      mLog.alert.messages.push('URI not found')
      break
    case 1:
      mLog.alert.flag = 'alert'
      mLog.alert.messages = ['Connection reset']
      break
    case 2:
      mLog.alert.flag = 'alert'
      mLog.alert.messages = ['Connection refused']
      break
    case 599:
      mLog.alert.flag = 'alert'
      mLog.alert.messages.push('Request Timed out')
      break
    default:
  }

  if (error?.length) log.error('probe error: ', error)

  saveProbeRequestLog({
    probe,
    totalRequests,
    probeRes,
    alertQueries: (alerts || []).map((alert) => alert.query),
    error,
  })

  return mLog
}

/**
 * notificationLog just prints notifications for the user and to persistent log (through history.ts)
 * @param {object} contain notification fields
 * @param {LogObject} mLog to update and return
 * @returns {LogObject} mLog is returned once updated
 */
export function setNotificationLog(
  {
    type,
    alertQuery,
    notification,
    probe,
  }: {
    probe: Probe
    notification: Notification
    type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
    alertQuery: string
  },
  mLog: LogObject
): LogObject {
  let msg: string

  switch (type) {
    case 'NOTIFY-INCIDENT':
      msg = 'service probably down'
      break
    case 'NOTIFY-RECOVER':
      msg = 'service is back up'
  }

  mLog.notification.flag = type
  mLog.notification.messages[0] = msg
  saveNotificationLog(probe, notification, type, alertQuery)

  return mLog
}

/**
 * setNotification sets notification message
 * @param {object} flag: type of notification message, ex: disruption
 * @param {LogObject} mLog is the log to be updated
 * @returns {LogObject} mLog is returned again after updating
 */
export function setNotification(
  {
    flag,
    message,
  }: {
    flag: string
    message: string
  },
  mLog: LogObject
): LogObject {
  mLog.notification.flag = flag
  mLog.notification.messages.push(message)

  return mLog
}

/**
 * setAlert populates the mLog.alert{} object with flag and message string in the input
 * @param {object} flag: type of alert message, ex: not-2xx
 * @param {LogObject} mLog is the log object being updated
 * @returns {LogObject} mLog returned again after being updated
 */
export function setAlert(
  {
    flag,
    message,
  }: {
    flag: string
    message: string
  },
  mLog: LogObject
): LogObject {
  mLog.alert.flag = flag
  mLog.alert.messages.push(message)

  return mLog
}

/**
 * printLogs prints the monika logs and clear buffers
 * @param {LogObject} mLog that is displayed
 */
export function printProbeLog(mLog: LogObject) {
  if (mLog.alert.flag.length > 0) {
    log.warn(mLog)
  } else {
    log.info(mLog)
  }
}

/**
 * printAllLogs dumps the content of monika-logs.db onto the screen
 */
export async function printAllLogs() {
  const data = await getAllLogs()

  data.forEach((row) => {
    log.info({
      type: 'PLAIN',
      msg: `${row.id} id: ${row.probe_id} responseCode: ${chalk.keyword(
        getStatusColor(row.response_status)
      )(String(row.response_status))} - ${row.request_url}, ${
        row.response_time || '- '
      }ms`,
    })
  })
}
