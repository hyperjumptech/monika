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

import { ValidateResponseStatus, validateResponse } from '../notification/alert'
import { processProbeStatus } from '../notification/process-server-status'
import { probing } from './probing'
import { Probe } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import { notificationLog, probeLog, setAlert } from '../logger'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { sendAlerts } from '../notification'
import { getLogsAndReport } from '../reporter'

import { printProbeLog } from '../logger'
import { getEventEmitter } from '../../utils/events'

const em = getEventEmitter()

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
  let totalRequests = 0 // is the number of requests in  probe.requests[x]

  try {
    const responses: Array<AxiosResponseWithExtraData> = []
    for await (const request of probe.requests) {
      probeRes = await probing(request, responses)
      em.emit('RESPONSE_RECEIVED')

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      validatedResp = validateResponse(probe.alerts, probeRes)

      await probeLog({
        checkOrder,
        probe,
        totalRequests,
        probeRes,
        alerts: validatedResp
          .filter((item) => item.status)
          .map((item) => item.alert),
      })

      // done one request, is there another
      totalRequests += 1

      // Exit the loop if there is any triggers triggered
      if (validatedResp.filter((item) => item.status).length > 0) {
        break
      }

      // done probes, no alerts, no notif.. now print log
      printProbeLog()
    }

    const serverStatuses = processProbeStatus({
      checkOrder,
      probe,
      probeRes,
      totalRequests,
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
        const notificationsLogPromise = Promise.all(
          notifications.map((notification) => {
            return notificationLog({
              probe,
              notification,
              type:
                status.state === 'UP_TRUE_EQUALS_THRESHOLD'
                  ? 'NOTIFY-INCIDENT'
                  : 'NOTIFY-RECOVER',
              alertMsg: probe.alerts[index],
            })
          })
        )

        const sendAlertsPromise = sendAlerts({
          validation: validatedResp[index],
          notifications: notifications,
          url: probe.requests[totalRequests - 1].url ?? '',
          status: status.isDown ? 'DOWN' : 'UP',
          incidentThreshold: probe.incidentThreshold,
          probeName: probe.name,
          probeId: probe.id,
        })

        await notificationsLogPromise
        await sendAlertsPromise

        getLogsAndReport()
      }
    })
  } catch (error) {
    setAlert({ flag: 'error', message: error })
  }
}
