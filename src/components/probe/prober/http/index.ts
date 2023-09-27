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

import { isSymonModeFrom } from '../../../config'
import { checkThresholdsAndSendAlert } from '../..'
import { getContext } from '../../../../context'
import events from '../../../../events'
import type { Notification } from '@hyperjumptech/monika-notification'
import type { Probe, ProbeAlert } from '../../../../interfaces/probe'
import type { ProbeRequestResponse } from '../../../../interfaces/request'
import { probeRequestResult } from '../../../../interfaces/request'
import validateResponse from '../../../../plugins/validate-response'
import { getEventEmitter } from '../../../../utils/events'
import { log } from '../../../../utils/pino'
import { RequestLog } from '../../../logger'
import { logResponseTime } from '../../../logger/response-time-log'
import { processThresholds } from '../../../notification/process-server-status'
import { httpRequest } from './request'
import { BaseProber } from '..'

const CONNECTION_RECOVERY_MESSAGE = 'Probe is accessible again'
const CONNECTION_INCIDENT_MESSAGE = 'Probe not accessible'
const isConnectionDown = new Map<string, boolean>()

export class HTTPProber extends BaseProber {
  async probe(): Promise<void> {
    await probeHTTP(this.probeConfig, this.counter, this.notifications)
  }

  generateVerboseStartupMessage(): string {
    const { description, id, interval, name } = this.probeConfig

    let result = `- Probe ID: ${id}
  Name: ${name}
  Description: ${description || '-'}
  Interval: ${interval}
`
    result += '  Requests:\n'
    result += this.generateProbeRequestMessage()
    result += this.generateAlertMessage()

    return result
  }

  private generateProbeRequestMessage(): string {
    let startupMessage = ''

    for (const request of this.probeConfig.requests || []) {
      const { body, headers, method, url } = request

      startupMessage += `  - Request Method: ${method || `GET`}
    Request URL: ${url}
    Request Headers: ${JSON.stringify(headers) || `-`}
    Request Body: ${JSON.stringify(body) || `-`}
`
    }

    return startupMessage
  }

  private generateAlertMessage(): string {
    const hasAlert = this.probeConfig.alerts.length > 0
    const defaultAlertsInString =
      '[{ "assertion": "response.status < 200 or response.status > 299", "message": "HTTP Status is not 200"}, { "assertion": "response.time > 2000", "message": "Response time is more than 2000ms" }]'
    const alertsInString = JSON.stringify(this.probeConfig.alerts)

    return `    Alerts: ${hasAlert ? alertsInString : defaultAlertsInString}\n`
  }
}

// sending multiple http-type requests
async function probeHTTP(
  probe: Probe,
  checkOrder: number,
  notifications: Notification[]
): Promise<void> {
  const eventEmitter = getEventEmitter()
  const { flags } = getContext()
  const isSymonMode = isSymonModeFrom(flags)
  const isVerbose = isSymonMode || flags['keep-verbose-logs']
  const responses = []

  if (!probe.requests) {
    return
  }

  for (
    let requestIndex = 0;
    requestIndex < probe?.requests?.length;
    requestIndex++
  ) {
    const request = probe.requests?.[requestIndex]
    const requestLog = new RequestLog(probe, requestIndex, checkOrder)
    // create id-request
    const id = `${probe?.id}:${request.url}:${requestIndex}:${request?.id} `

    try {
      // intentionally wait for a request to finish before processing next request in loop
      // eslint-disable-next-line no-await-in-loop
      const probeRes: ProbeRequestResponse = await httpRequest({
        requestConfig: request,
        responses,
      })
      // combine global probe alerts with all individual request alerts
      const combinedAlerts = [...probe.alerts, ...(request.alerts || [])]
      // Responses have been processed and validated
      const validatedResponse = validateResponse(combinedAlerts, probeRes)
      // done probing, got some result, process it, check for thresholds and notifications
      const statuses = processThresholds({
        probe,
        requestIndex,
        validatedResponse,
      })

      // Set request result value
      const isDown = statuses.some((item) => item.state === 'DOWN')
      probeRes.result = isDown
        ? probeRequestResult.failed
        : probeRequestResult.success

      eventEmitter.emit(events.probe.response.received, {
        probe,
        requestIndex,
        response: probeRes,
      })

      logResponseTime(probeRes.responseTime)
      // Add to a response array to be accessed by another request for chaining later
      responses.push(probeRes)
      requestLog.setResponse(probeRes)
      requestLog.addAlerts(
        validatedResponse
          .filter((item) => item.isAlertTriggered)
          .map((item) => item.alert)
      )
      // so we've got a status that need to be reported/alerted
      // 1. check first, this connection is up, but was it ever down? if yes then use a specific connection recovery msg
      // 2. if this connection is down, save to map and send specific connection incident msg
      // 3. if event is not for connection failure, send user specified notification msg
      if (statuses[0].shouldSendNotification) {
        const { isProbeResponsive } = probeRes

        if (
          isProbeResponsive && // if connection is successful but
          isConnectionDown.has(id) // if connection WAS down then send a custom recovery alert. Else use user's alert.
        ) {
          validatedResponse[0].alert = {
            assertion: '',
            message: CONNECTION_RECOVERY_MESSAGE,
          } as ProbeAlert
          isConnectionDown.delete(id) // connection is up, so remove from entry
          validatedResponse.splice(1, validatedResponse.length) // truncate and use custom message
        } else if (!isProbeResponsive) {
          // if connection has failed, then lets send out specific notification
          validatedResponse[0].alert = {
            assertion: '',
            message: CONNECTION_INCIDENT_MESSAGE,
          } as ProbeAlert
          isConnectionDown.set(id, true) // connection is down, so add to map
          validatedResponse.splice(1, validatedResponse.length) // truncate and use custom message
        }
      }

      // Done processing results, check if need to send out alerts
      checkThresholdsAndSendAlert(
        {
          probe,
          statuses,
          notifications,
          requestIndex,
          validatedResponseStatuses: validatedResponse,
        },
        requestLog
      )

      // Exit the chaining loop if there is any alert triggered
      if (validatedResponse.some((item) => item.isAlertTriggered)) {
        const triggeredAlertResponse = validatedResponse.find(
          (item) => item.isAlertTriggered
        )

        if (triggeredAlertResponse) {
          eventEmitter.emit(events.probe.alert.triggered, {
            probe,
            requestIndex,
            alertQuery:
              triggeredAlertResponse.alert.assertion ||
              triggeredAlertResponse.alert.query,
          })
        }

        break
      }
    } catch (error) {
      requestLog.addError((error as any).message)
      break
    } finally {
      requestLog.print()
      if (isVerbose || requestLog.hasIncidentOrRecovery) {
        requestLog.saveToDatabase().catch((error) => log.error(error.message))
      }
    }
  }
}
