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

import {
  PROBE_RESPONSES_READY,
  PROBE_RESPONSE_VALIDATED,
  ALERTS_READY_TO_SEND,
  LOGS_READY_TO_PRINT,
} from '../../constants/event-emitter'
import { LogObject } from '../../interfaces/logs'
import { Notification } from '../../interfaces/notification'
import { Probe } from '../../interfaces/probe'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { ValidateResponse } from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { printProbeLog, probeBuildLog, setAlert } from '../logger'
import { processThresholds } from '../notification/process-server-status'
import { probing } from './probing'

const em = getEventEmitter()

let validatedRes: ValidateResponse[] = []

// 2. Responses have been processed and validated
em.on(PROBE_RESPONSE_VALIDATED, (data: ValidateResponse[]) => {
  validatedRes = data
})

/**
 * doProbe sends out the http request
 * @param {number} checkOrder the order of probe being processed
 * @param {object} probe contains all the probes
 * @param {array} notifications contains all the notifications
 */
export async function doProbe(
  checkOrder: number,
  probe: Probe,
  notifications?: Notification[]
) {
  let probeRes: AxiosResponseWithExtraData = {} as AxiosResponseWithExtraData
  let totalRequests = 0 // is the number of requests in  probe.requests[x]
  let mLog: LogObject = {
    type: 'PROBE',
    iteration: 0,
    id: probe.id,
    responseCode: 0,
    url: '',
    responseTime: 0,
    alert: {
      flag: '',
      message: [],
    },
    notification: {
      flag: 'na',
      message: [],
    },
  } as LogObject

  try {
    const responses: Array<AxiosResponseWithExtraData> = []

    for await (const request of probe.requests) {
      mLog.url = request.url
      probeRes = await probing(request, responses)

      // 1. probing above done, response are ready for processing
      em.emit(PROBE_RESPONSES_READY, {
        alerts: probe.alerts,
        response: probeRes,
      })

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      // done probing, got the results, build logs
      mLog = probeBuildLog({
        checkOrder,
        probe,
        totalRequests,
        probeRes,
        alerts: validatedRes
          .filter((item) => item.status)
          .map((item) => item.alert),
        mLog,
      })

      // done one request, is there another
      totalRequests += 1

      // Exit the loop if there is any triggers triggered
      if (validatedRes.filter((item) => item.status).length > 0) {
        break
      }

      // 4. done probes, no alerts, no notification.. now print log
      em.emit(LOGS_READY_TO_PRINT, mLog)
      printProbeLog(mLog) // TODO TODO MOVE THIS TO LISTENER
    }

    // done probing, got some result, process it, check for thresholds and notifications
    const statuses = processThresholds({
      checkOrder,
      probe,
      probeRes,
      totalRequests,
      validatedResp: validatedRes,
      incidentThreshold: probe.incidentThreshold,
      recoveryThreshold: probe.recoveryThreshold,
      mLog,
    })

    console.log('src/probe 133 notif: ', mLog.notification.message)

    // 3. Done processing results, emit RESULT_READY
    em.emit(ALERTS_READY_TO_SEND, {
      probe,
      statuses,
      notifications,
      totalRequests,
      validatedResponseStatuses: validatedRes,
      mLog,
    })
  } catch (error) {
    mLog = setAlert({ flag: 'error', message: error, mLog })
    printProbeLog(mLog) // TODO TODO MOVE THIS TO LISTENER ==> add an emit here
  }
}
