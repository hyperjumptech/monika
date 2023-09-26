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
import type { Notification } from '@hyperjumptech/monika-notification'
import PouchDB from 'pouchdb'
import { getContext } from '../../context'
import { Probe } from '../../interfaces/probe'
import { ProbeRequestResponse } from '../../interfaces/request'
import { log } from '../../utils/pino'
let localPouchDB: PouchDB.Database

/**
 * openLogPouch will create a pouchDB connection and sets a replication to the CouchDB
 * live = true, means the replication is immediate when there is a put process
 * @returns <void>
 */
/* eslint-disable camelcase */
export async function openLogPouch(): Promise<void> {
  try {
    localPouchDB = new PouchDB('symon', { auto_compaction: true })

    // to symon couchdb replication setting
    const { flags } = getContext()
    const symonCouchDB = new PouchDB(flags.symonCouchDb)
    localPouchDB.replicate
      .to(symonCouchDB, {
        live: true,
        retry: true,
        back_off_function: (delay: number) => (delay === 0 ? 1000 : delay * 3),
        filter: (doc: PouchDB.Core.ExistingDocument<any>) => {
          return doc._deleted !== true
        },
      })
      .on('change', async function (info) {
        const docs = info.docs
        if (docs) {
          await removeDocumentsFromLocalDB(localPouchDB, docs)
        }
      })
  } catch (error: any) {
    log.error("Warning: Can't open logfile. " + error.message)
  }
}

async function removeDocumentsFromLocalDB(
  localDB: PouchDB.Database,
  docs: PouchDB.Core.ExistingDocument<any>[]
) {
  await Promise.all(
    docs.map(async (doc) => {
      await localDB.remove(doc)
      log.info(`Document id: ${doc._id} is removed from pouchdb`)
    })
  )
}

/**
 * It saves the probe request and notification data to the database
 *
 * @param {object} data is the log data containing information about probe request
 * @returns Promise<void>
 */
export async function saveProbeRequestToPouchDB({
  probe,
  requestIndex,
  probeRes,
  alertQueries,
  notifAlert,
  notification,
  type,
  monikaId,
}: {
  probe: Probe
  requestIndex: number
  probeRes: ProbeRequestResponse
  alertQueries?: string[]
  notifAlert?: string
  notification?: Notification
  type?: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER' | 'NOTIFY-TLS'
  monikaId?: string
}): Promise<void> {
  const now = Math.round(Date.now() / 1000)
  const requestConfig = probe.requests?.[requestIndex]

  const probeDataId = Date.now().toString()
  const reqData = {
    alerts: '',
    id: probeDataId,
    probeId: probe.id,
    probeName: probe.name,
    // requestBody: JSON.stringify(requestConfig?.body),
    requestHeader: JSON.stringify(requestConfig?.headers),
    requestMethod: requestConfig?.method,
    requestType: probe.socket ? 'tcp' : 'http',
    requestUrl: requestConfig?.url || 'http://',
    responseHeader: JSON.stringify(probeRes.headers),
    responseSize: probeRes.headers['content-length'],
    responseStatus: probeRes.status,
    responseTime: probeRes?.responseTime ?? 0,
    // socketHost: probe.socket?.host || '',
    // socketPort: probe.socket?.port || '',
    timestamp: now,
  }

  const notifData = {
    alertType: notifAlert,
    channel: notification?.type,
    id: probeDataId,
    notificationId: notification?.id,
    probeId: probe.id,
    probeName: probe.name,
    timestamp: now,
    type: type,
  }

  const reportData = {
    _id: probe.name + '-' + probeDataId,
    monikaId: monikaId,
    data: {
      requests: [reqData],
      notifications: [notifData],
    },
  }

  if (alertQueries && alertQueries.length > 0) {
    reportData.data.requests[0].alerts = alertQueries.toString()
  }

  await localPouchDB.put(reportData)
}
