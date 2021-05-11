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

import { ValidateResponseStatus } from '../notification/alert'
import { processProbeStatus } from '../notification/process-server-status'
import { probing } from './probing'
import { validateResponse } from '../notification/alert'
import { Probe } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import { probeLog } from '../logger'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { log } from '../../utils/pino'
import { sendAlerts } from '../notification'

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
  let validatedResp: ValidateResponseStatus[] = []
  let requestIndex = 0

  try {
    const responses: Array<AxiosResponseWithExtraData> = []
    for await (const request of probe.requests) {
      probeRes = await probing(request, responses)

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      validatedResp = validateResponse(probe.alerts, probeRes)
      await probeLog({ checkOrder, probe, probeRes, requestIndex, err: '' })

      // Exit the loop if there is any triggers triggered
      if (validatedResp.filter((item) => item.status).length > 0) break

      if (probe.requests.length > 1) {
        requestIndex += 1
      }
    }

    const serverStatuses = processProbeStatus({
      checkOrder,
      probe,
      probeRes,
      requestIndex,
      validatedResp,
      incidentThreshold: probe.incidentThreshold,
      recoveryThreshold: probe.recoveryThreshold,
    })

    serverStatuses.forEach(async (status, index) => {
      if (
        status.shouldSendNotification &&
        notifications &&
        notifications?.length > 0
      ) {
        notifications.forEach((notification) => {
          log.info({
            type:
              status.state === 'UP_TRUE_EQUALS_THRESHOLD'
                ? 'NOTIFY-INCIDENT'
                : 'NOTIFY-RECOVER',
            alertType: probe.alerts[index],
            notificationType: notification.type,
            notificationId: notification.id,
            probeId: probe.id,
            url: probe.requests[requestIndex].url,
          })
        })
        await sendAlerts({
          validation: validatedResp[index],
          notifications: notifications,
          url: probe.requests[requestIndex].url ?? '',
          status: status.isDown ? 'DOWN' : 'UP',
          incidentThreshold: probe.incidentThreshold,
          probeName: probe.name,
          probeId: probe.id,
          statusCode: probeRes.status,
          responseTime: probeRes.config.extraData?.responseTime as number,
        })
      }
    })
  } catch (error) {
    probeLog({ checkOrder, probe, probeRes, requestIndex, err: error })
  }
}
