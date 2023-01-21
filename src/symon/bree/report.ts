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
import axios, { AxiosRequestConfig } from 'axios'
import Pako from 'pako'
const main = async (data: Record<string, any>) => {
  try {
    const { url, apiKey, requests, notifications, monikaId } = data

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
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        transformRequest: (req: AxiosRequestConfig) =>
          Pako.gzip(JSON.stringify(req)).buffer,
      })

      log.debug(
        `Reported ${requests.length} requests and ${notifications.length} notifications.`
      )
      log.debug(`Last reported ID: ${JSON.stringify(requests.at(-1).id)}`)

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
