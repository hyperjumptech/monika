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
import { saveProbeRequestLog, getAllLogs, saveNotificationLog } from './history'
import { log } from '../../utils/pino'

import { Alerts, LogObject } from '../../interfaces/logs'

// declare monika logs and initialize
let mLogs = {
  alert: {
    flag: '',
    message: [],
  } as Alerts,
  notification: {
    flag: '',
    message: [],
  } as Alerts,
} as LogObject

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
 * probeLog prints probe results for the user and to persistent log (through history.ts)
 *
 */
export async function probeLog({
  checkOrder,
  probe,
  totalRequests,
  probeRes,
  alerts,
  error,
}: {
  checkOrder: number
  probe: Probe
  totalRequests: number
  probeRes: AxiosResponseWithExtraData
  alerts?: string[]
  error?: string
}) {
  mLogs.type = 'PROBE'
  mLogs.iteration = checkOrder
  mLogs.id = probe.id
  mLogs.url = probe.requests[totalRequests].url
  mLogs.responseCode = probeRes.status
  mLogs.responseTime = probeRes.config.extraData?.responseTime ?? 0

  if (alerts?.length) {
    mLogs.alert.flag = 'alert'
    mLogs.alert.message = alerts
  }

  if (error?.length) log.error('probe error: ', error)

  for (const rq of probe.requests) {
    if (rq?.saveBody !== true ?? undefined) {
      probeRes.data = '' // if not saved, flush .data
    }
  }

  await saveProbeRequestLog({
    probe,
    totalRequests,
    probeRes,
    alerts,
    error,
  })
}

/**
 * notificationLog just prints notifications for the user and to persistent log (through history.ts)
 *
 */
export async function notificationLog({
  type,
  alertMsg,
  notification,
  probe,
}: {
  probe: Probe
  notification: Notification
  type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
  alertMsg: string
}) {
  let msg: string
  mLogs.notification.flag = type
  switch (type) {
    case 'NOTIFY-INCIDENT':
      msg = 'service probably down'
      break
    case 'NOTIFY-RECOVER':
      msg = 'service is back up'
  }
  mLogs.notification.flag = type
  mLogs.notification.message[0] = msg
  await saveNotificationLog(probe, notification, type, alertMsg)
}

/**
 * setNotification sets notification message
 * flag: type of notif message, ex: disruption
 * message: body of notification message
 */
export function setNotification({
  flag,
  message,
}: {
  flag: string
  message: string[]
}) {
  mLogs.notification.flag = flag
  mLogs.notification.message = message
}

/**
 * setAlert
 *
 */
export function setAlert({
  flag,
  message,
}: {
  flag: string
  message: string[]
}) {
  mLogs.alert.flag = flag
  mLogs.alert.message = message
}

function flushMLog() {
  mLogs = {
    alert: {
      flag: '',
      message: [],
    } as Alerts,
    notification: {
      flag: '',
      message: [],
    } as Alerts,
  } as LogObject
}

/**
 * printLogs prints the monika logs and clear buffers
 */
export async function printProbeLog() {
  if (mLogs.alert.flag.length > 0) {
    log.warn(mLogs)
  } else {
    log.info(mLogs)
  }

  flushMLog()
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
