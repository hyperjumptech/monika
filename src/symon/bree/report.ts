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

import { parentPort, workerData } from 'worker_threads'
import axios from 'axios'
import {
  database,
  deleteNotificationLogs,
  deleteRequestLogs,
  getUnreportedLogs,
  openLogfile,
  UnreportedNotificationsLog,
  UnreportedRequestsLog,
} from '../../components/logger/history'
import { log } from '../../utils/pino'

const main = async (data: Record<string, any>) => {
  try {
    const { url, apiKey, probeIds, reportProbesLimit, monikaId } = data

    // Open database
    await openLogfile()
    const db = database()

    // Updating requests and notifications to report
    const logs = await getUnreportedLogs(probeIds, reportProbesLimit, db)
    const requests = logs.requests
    const notifications = logs.notifications

    if (requests.length === 0 && notifications.length === 0) {
      // No requests or notifications to report
      log.debug('Nothing to report')

      parentPort?.postMessage({
        success: true,
        data: {
          requests,
          notifications,
        },
      })
    } else {
      // Hit the Symon API for receiving Monika report
      // With the compressed requests and notifications data
      await axios({
        url: `${url}/api/v1/monika/report`,
        method: 'POST',
        data: {
          monikaId: monikaId,
          data: {
            requests,
            notifications,
          },
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      })

      log.info(
        `Reported ${requests.length} requests and ${notifications.length} notifications.`
      )

      // Delete the reported requests
      await deleteRequestLogs(
        requests.map((log: UnreportedRequestsLog) => log.probeId),
        db
      )
      log.debug(`Deleted ${requests.length} reported request`)

      // Delete the reported notifications
      await deleteNotificationLogs(
        notifications.map((log: UnreportedNotificationsLog) => log.probeId),
        db
      )
      log.debug(`Deleted ${notifications.length} reported request`)

      // Send message to parentPort so that
      // the reported logs and notifications can be deleted
      parentPort?.postMessage({
        success: true,
        data: {
          requests,
          notifications,
        },
      })
    }
  } catch (error) {
    console.error(error)
    log.error(
      "Warning: Can't report history to Symon. " + (error as any).message
    )
    parentPort?.postMessage({ success: false, error: error })
  }
}

;(async () => {
  try {
    const data = JSON.parse(workerData.data)
    await main(data)
  } catch (error) {
    console.error(error)
  }
})()
