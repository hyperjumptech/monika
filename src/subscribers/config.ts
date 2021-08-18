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
import { processThresholds } from '../components/notification/process-server-status'
import { convertToBreeJobs } from '../components/probe/convert-to-bree'
import { LogObject } from '../interfaces/logs'
import type { Notification } from '../interfaces/notification'
import type { Probe } from '../interfaces/probe'
import validateResponse, {
  ValidateResponse,
} from '../plugins/validate-response'
import { getEventEmitter } from '../utils/events'
import events from '.'

const eventEmitter = getEventEmitter()

function workerMessageHandler(workerData: any) {
  const { probe, probeResult, notifications } = workerData.message
  let validatedResp: Array<ValidateResponse> = []
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
  // 1. Rebuild and restart the jobs when Monika config change
  // 2. Reimplement --repeat flag?

  probeResult.forEach((response: any, requestIndex: number) => {
    validatedResp = validateResponse(probe.alerts, response)

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
      alerts: validatedResp
        .filter((item) => item.status)
        .map((item) => item.alert),
      mLog,
    })

    // done one request, is there another
    totalRequests += 1
  })

  // done probing, got some result, process it, check for thresholds and notifications
  const statuses = processThresholds({
    probe,
    validatedResp,
    mLog,
  })

  // Done processing results, emit RESULT_READY
  eventEmitter.emit(
    events.probe.alerts.ready,
    {
      probe,
      statuses,
      notifications,
      totalRequests,
      validatedResponseStatuses: validatedResp,
    },
    mLog
  )
}

eventEmitter.on(
  events.config.sanitized,
  (probes: Probe[], notifications: Notification[]) => {
    const root = false
    const jobs = convertToBreeJobs(probes, notifications)
    const bree = new Bree({ root, jobs, workerMessageHandler })

    bree.start()
  }
)
