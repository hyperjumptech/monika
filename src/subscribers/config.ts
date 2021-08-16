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

import Bree from 'bree'
import { probeBuildLog } from '../components/logger'
import { convertToBreeJobs } from '../components/probe/convert-to-bree'
import { LogObject } from '../interfaces/logs'
import type { Probe } from '../interfaces/probe'
import validateResponse from '../plugins/validate-response'
import { getEventEmitter } from '../utils/events'
import { log } from '../utils/pino'
import events from '.'

const eventEmitter = getEventEmitter()

function workerMessageHandler(workerData: any) {
  const { probe, probeResult } = workerData.message
  let totalRequests = 0 // is the number of requests in  probe.requests[x]
  let mLog: LogObject = {
    type: 'PROBE',
    iteration: 0,
    id: probe.id,
    responseCode: 0,
    url: '',
    method: 'GET', // GET must be pre-filled here since method '' (empty) is undefined
    responseTime: 0,
    alert: {
      flag: '',
      message: [],
    },
    notification: {
      flag: '',
      message: [],
    },
  } as LogObject
  // TODO:
  // 1. Notify alert
  // 2. Rebuild and restart the jobs when Monika config change
  // 3. Reimplement --repeat flag?

  probeResult.forEach((response: any, requestIndex: number) => {
    const validatedRes = validateResponse(probe.alerts, response)

    eventEmitter.emit(events.probe.response.received, {
      probe,
      requestIndex,
      response,
    })

    mLog.url = response.requestURL
    mLog = probeBuildLog({
      checkOrder: requestIndex,
      probe,
      totalRequests,
      probeRes: response,
      alerts: validatedRes
        .filter((item) => item.status)
        .map((item) => item.alert),
      mLog,
    })

    // done one request, is there another
    totalRequests += 1
  })

  log.info('parent receives data from worker')
  log.info(JSON.stringify(probeResult, null, 2))
}

eventEmitter.on(events.config.sanitized, (probes: Probe[]) => {
  const root = false
  const jobs = convertToBreeJobs(probes)
  const bree = new Bree({ root, jobs, workerMessageHandler })

  bree.start()
})
