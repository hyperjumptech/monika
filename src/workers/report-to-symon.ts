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

import path from 'path'
import { open } from 'sqlite'
import pkg from 'sqlite3'

import {
  UnreportedNotificationsLog,
  UnreportedRequestsLog,
  deleteNotificationLogs,
  deleteRequestLogs,
  getUnreportedLogs,
} from '../components/logger/history.js'
import { log } from '../utils/pino.js'
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')
const { verbose } = pkg

export default async (stringifiedData: string) => {
  try {
    const parsedData = JSON.parse(stringifiedData)
    const { apiKey, monikaId, probeIds, reportProbesLimit, url } = parsedData

    // Open database
    const sqlite3 = verbose()
    const db = await open({
      driver: sqlite3.Database,
      filename: dbPath,
      mode: sqlite3.OPEN_READWRITE || sqlite3.OPEN_CREATE,
    })

    // Updating requests and notifications to report
    const logs = await getUnreportedLogs(probeIds, reportProbesLimit, db)
    const { requests } = logs
    const { notifications } = logs

    if (requests.length === 0 && notifications.length === 0) {
      // No requests or notifications to report
      log.info('Nothing to report')
    } else {
      // Hit the Symon API for receiving Monika report
      // With the compressed requests and notifications data
      await fetch(`${url}/api/v1/monika/report`, {
        body: JSON.stringify({
          data: {
            notifications,
            requests,
          },
          monikaId,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        method: 'POST',
      })

      log.info(
        `Reported ${requests.length} requests and ${notifications.length} notifications.`
      )

      // Delete the reported requests
      await deleteRequestLogs(
        requests.map((l: UnreportedRequestsLog) => l.probeId),
        db
      )
      log.info(`Deleted ${requests.length} reported request`)

      // Delete the reported notifications
      await deleteNotificationLogs(
        notifications.map((l: UnreportedNotificationsLog) => l.probeId),
        db
      )
      log.info(`Deleted ${notifications.length} reported request`)
    }
  } catch (error: unknown) {
    log.error(
      "Warning: Can't report history to Symon. " + (error as Error).message
    )
  }
}
