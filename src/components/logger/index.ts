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
import { Probe } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import { getAllLogs } from './history'
import { log } from '../../utils/pino'

import { LogObject } from '../../interfaces/logs'

/**
 * getStatusColor colorizes different statusCode
 * @param {number} statusCode is the httpStatus to colorize
 * @returns {string} color code based on chalk: Chalk & { supportsColor: ColorSupport };
 */
export function getStatusColor(statusCode: number) {
  switch (Math.trunc(statusCode / 100)) {
    case 2:
      return 'cyan'
    case 4:
      return 'orange'
    case 5:
      return 'red'
    default:
      return 'white'
  }
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
  alerts?: string[]
  error?: string
  mLog: LogObject
}): LogObject {
  mLog.type = 'PROBE'
  mLog.iteration = checkOrder
  mLog.id = probe.id
  mLog.url = probe.requests[totalRequests].url
  mLog.responseCode = probeRes.status
  mLog.responseTime = probeRes.config.extraData?.responseTime ?? 0

  if (alerts?.length) {
    mLog.alert.flag = 'alert'
    mLog.alert.message = alerts
  }

  if (error?.length) log.error('probe error: ', error)

  for (const rq of probe.requests) {
    if (rq?.saveBody !== true ?? undefined) {
      probeRes.data = '' // if not saved, flush .data
    }
  }
  return mLog

  // await saveProbeRequestLog({ //// TODO TODO TODO SAVING TO PERSISTENCE LOGS DO ELSEWHERE!!!
  //   // TODO: move saving for last
  //   probe,
  //   totalRequests,
  //   probeRes,
  //   alerts,
  //   error,
  // })
}

/**
 * notificationLog just prints notifications for the user and to persistent log (through history.ts)
 * @param {objct} contain notification fields
 * @param {LogObjec} mLog to update and return
 * @returns {LogObject} mLog is returned once updated
 */
export function setNotificationLog(
  {
    type,
  }: // alertMsg, // no need
  // notification, // no not need
  {
    probe: Probe
    notification: Notification
    type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
    alertMsg: string
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

  console.log('setNotificationLog 131 type: ', mLog.notification.flag) // DEBUGDEBUGDEBUG
  console.log('setNotificationLog 132: goooot here. mLog: ', mLog.alert.message) // DEBUGDEBUGDEBUG

  mLog.notification.flag = type
  mLog.notification.message[0] = msg

  return mLog
  // await saveNotificationLog(probe, notification, type, alertMsg) // TOOODOOO: save to db last!!!
}

/**
 * setNotification sets notification message
 * @param {flag} flag: type of notification message, ex: disruption
 * @param {string} message[]: body of notification message
 * @param {LogObject} mLog is the log to be updated
 * @returns {LogObject} mLog is returned again after updating
 */
export function setNotification({
  flag,
  message,
  mLog,
}: {
  flag: string
  message: string
  mLog: LogObject
}): LogObject {
  console.log('setNotifiction 158')

  mLog.notification.flag = flag
  mLog.notification.message[0] = message

  return mLog
}

/**
 * setAlert
 * @param {flag} flag: type of alert message, ex: not-2xx
 * @param {string} message[]: body of alert message
 * @param {LogObject} mLog is the log object being updated
 * @returns {LogObject} mLog returned again after being updated
 *
 */
export function setAlert({
  flag,
  message,
  mLog,
}: {
  flag: string
  message: string
  mLog: LogObject
}): LogObject {
  mLog.alert.flag = flag
  mLog.alert.message[0] = message

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
      msg: `${row.id} id: ${row.probe_id} status: ${chalk.keyword(
        getStatusColor(row.response_status)
      )(String(row.response_status))} - ${row.request_url}, ${
        row.response_time || '- '
      }ms`,
    })
  })
}
