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
  PROBE_STATUS_PROCESSED,
  PROBE_RESPONSE_RECEIVED,
  PROBE_RESPONSE_VALIDATED,
} from '../../constants/event-emitter'
import { Notification } from '../../interfaces/notification'
import { Probe } from '../../interfaces/probe'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { ValidateResponse } from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { printProbeLog, probeLog, setAlert } from '../logger'
import { processProbeStatus } from '../notification/process-server-status'
import { probing } from './probing'

const em = getEventEmitter()

let validatedRes: ValidateResponse[] = []

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

  try {
    const responses: Array<AxiosResponseWithExtraData> = []

    for await (const request of probe.requests) {
      probeRes = await probing(request, responses)

      em.emit(PROBE_RESPONSE_RECEIVED, {
        alerts: probe.alerts,
        response: probeRes,
      })

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      await probeLog({
        checkOrder,
        probe,
        totalRequests,
        probeRes,
        alerts: validatedRes
          .filter((item) => item.status)
          .map((item) => item.alert),
      })

      // done one request, is there another
      totalRequests += 1

      // Exit the loop if there is any triggers triggered
      if (validatedRes.filter((item) => item.status).length > 0) {
        break
      }

      // done probes, no alerts, no notif.. now print log
      printProbeLog()
    }

    const statuses = processProbeStatus({
      checkOrder,
      probe,
      probeRes,
      totalRequests,
      validatedResp: validatedRes,
      incidentThreshold: probe.incidentThreshold,
      recoveryThreshold: probe.recoveryThreshold,
    })

    em.emit(PROBE_STATUS_PROCESSED, {
      probe,
      statuses,
      notifications,
      totalRequests,
      validatedResponseStatuses: validatedRes,
    })
  } catch (error) {
    setAlert({ flag: 'error', message: error })
  }
}
