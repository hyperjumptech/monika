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
import { log } from '../../utils/pino'
import { AxiosRequestConfig } from 'axios'
import Pako from 'pako'
import {
  deleteNotificationLogs,
  deleteRequestLogs,
  getUnreportedLogs,
} from '../../components/logger/history'
import { Probe } from '../../interfaces/probe'

const main = async (data: Record<string, any>) => {
  try {
    const {
      hasConnectionToSymon,
      probes,
      reportProbesLimit,
      httpClient,
      monikaId,
    } = data

    if (!hasConnectionToSymon) {
      log.warn('Has no connection to symon')
      return
    }

    log.debug('Reporting to symon')

    const probeIds = probes.map((probe: Probe) => probe.id)
    const logs = await getUnreportedLogs(probeIds, reportProbesLimit)
    const requests = logs.requests
    const notifications = logs.notifications.map(({ id: _, ...n }) => n)
    if (requests.length === 0 && notifications.length === 0) {
      log.debug('Nothing to report')
      return
    }

    await httpClient({
      url: '/report',
      method: 'POST',
      data: {
        monikaId: monikaId,
        data: {
          requests,
          notifications,
        },
      },
      headers: {
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
      transformRequest: (req: AxiosRequestConfig) =>
        Pako.gzip(JSON.stringify(req)).buffer,
    })

    log.debug(
      `Reported ${requests.length} requests and ${notifications.length} notifications.`
    )

    await Promise.all([
      deleteRequestLogs(logs.requests.map((log) => log.probeId)),
      deleteNotificationLogs(logs.notifications.map((log) => log.probeId)),
    ])
    log.debug(
      `Deleted reported requests and notifications from local database.`
    )

    parentPort?.postMessage({ success: true })
  } catch (error) {
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
