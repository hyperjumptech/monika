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
import PouchDB from 'pouchdb'
import { Probe } from '../../interfaces/probe'
import { ProbeRequestResponse } from '../../interfaces/request'
import { log } from '../../utils/pino'
import type { Notification } from '../notification/channel'

type NotifData = {
  alertType: string | undefined
  channel: string | undefined
  id: string
  notificationId: string | undefined
  probeId: string
  probeName: string
  timestamp: number
  type: string | undefined
}

let localPouchDB: PouchDB.Database

/**
 * openLogfile will open the file history.db and if it doesn't exist, create it and sets up the table
 * @returns Promise<void>
 */
export function openLogPouch(): void {
  try {
    localPouchDB = new PouchDB('symon')
  } catch (error: any) {
    log.error("Warning: Can't open logfile. " + error.message)
  }
}

export const pouchDBReporting = async (
  pouchToCouchConn: PouchDB.Database,
  symonCouchDB: string | undefined
) => {
  if (!symonCouchDB) {
    return
  }

  await pouchToCouchConn
    .sync(symonCouchDB, {
      live: true,
      retry: true,
    })
    .on('change', function (info) {
      log.info(`Data is changed : ${JSON.stringify(info)}`)
    })
    .on('denied', function (info) {
      log.info(`PouchDB replication denied: ${info}`)
    })
    .on('error', function (err) {
      log.info(`PouchDB replication error happened: ${err}`)
    })
}

/**
 * It saves the probe request and notification data to the database
 *
 * @param {object} data is the log data containing information about probe request
 * @returns Promise<void>
 */
export async function saveProbeRequestAndNotifData({
  probe,
  requestIndex,
  probeRes,
  alertQueries,
  notifAlert,
  notification,
  type,
  monikaId,
  symonCouchDB,
}: {
  probe: Probe
  requestIndex: number
  probeRes: ProbeRequestResponse
  alertQueries?: string[]
  notifAlert?: string
  notification?: Notification
  type?: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER' | 'NOTIFY-TLS'
  monikaId?: string
  symonCouchDB?: string
}): Promise<void> {
  const now = Math.round(Date.now() / 1000)
  const requestConfig = probe.requests?.[requestIndex]

  const notificationsList: NotifData[] = []
  const probeDataId = new Date().toISOString()
  const reqData = {
    alerts: '',
    id: probeDataId,
    probeId: probe.id,
    probeName: probe.name,
    requestBody: JSON.stringify(requestConfig?.body),
    requestHeader: JSON.stringify(requestConfig?.headers),
    requestMethod: requestConfig?.method,
    requestType: probe.socket ? 'tcp' : 'http',
    requestUrl: requestConfig?.url || 'http://', // if TCP, there's no URL so just set to this http://
    responseHeader: JSON.stringify(probeRes.headers),
    responseSize: probeRes.headers['content-length'],
    responseStatus: probeRes.status,
    responseTime: probeRes?.responseTime ?? 0,
    socketHost: probe.socket?.host || '',
    socketPort: probe.socket?.port || '',
    timestamp: now,
  }

  const notifData: NotifData = {
    alertType: notifAlert,
    channel: notification?.type,
    id: probeDataId,
    notificationId: notification?.id,
    probeId: probe.id,
    probeName: probe.name,
    timestamp: now,
    type: type,
  }

  notificationsList.push(notifData)
  const reportData = {
    _id: probeDataId,
    monikaId: monikaId,
    data: {
      requests: [reqData],
      notifications: notificationsList,
    },
  }

  if (alertQueries?.length === 0) {
    localPouchDB.put(reportData)
  }

  Promise.all(
    (alertQueries ?? []).map(async (alert) => {
      reportData.data.requests[0].alerts = alert
      localPouchDB.put(reportData)
    })
  )

  await pouchDBReporting(localPouchDB, symonCouchDB)
}
