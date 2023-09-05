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
import { getContext } from '../../../../context'
import events from '../../../../events'
import { getEventEmitter } from '../../../../utils/events'
import { log } from '../../../../utils/pino'
import { RequestLog } from '../../../logger'
import { httpRequest } from './request'
import { BaseProber, ProbeStatusProcessed } from '..'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request'
import type { ProbeAlert } from '../../../../interfaces/probe'
import type { ValidatedResponse } from '../../../../plugins/validate-response'
import responseChecker from '../../../../plugins/validate-response/checkers'
import type { ServerAlertState } from '../../../../interfaces/probe-status'
import {
  serverAlertStateInterpreters,
  serverAlertStateMachine,
} from '../../../notification/process-server-status'
import { interpret } from 'xstate'

const CONNECTION_RECOVERY_MESSAGE = 'Probe is accessible again'
const CONNECTION_INCIDENT_MESSAGE = 'Probe not accessible'
const isConnectionDown = new Map<string, boolean>()

type ProcessThresholdsParams = {
  requestIndex: number
  validatedResponse: ValidatedResponse[]
}

export class HTTPProber extends BaseProber {
  async probe(): Promise<void> {
    if (!this.probeConfig.requests) {
      return
    }

    // sending multiple http requests for request chaining
    const responses = []

    for (
      let requestIndex = 0;
      requestIndex < this.probeConfig?.requests?.length;
      requestIndex++
    ) {
      const requestLog = new RequestLog(
        this.probeConfig,
        requestIndex,
        this.counter
      )
      // create id-request
      const request = this.probeConfig.requests?.[requestIndex]

      try {
        // intentionally wait for a request to finish before processing next request in loop
        // eslint-disable-next-line no-await-in-loop
        const probeRes = await httpRequest({
          requestConfig: request,
          responses,
        })
        // Responses have been processed and validated
        const validatedResponse = this.validateResponse(
          probeRes,
          request.alerts || []
        )
        // done probing, got some result, process it, check for thresholds and notifications
        const statuses = this.processThresholds({
          requestIndex,
          validatedResponse,
        })

        // Set request result value
        const isDown = statuses.some((item) => item.state === 'DOWN')
        probeRes.result = isDown
          ? probeRequestResult.failed
          : probeRequestResult.success
        // Add to a response array to be accessed by another request for chaining later
        responses.push(probeRes)

        getEventEmitter().emit(events.probe.response.received, {
          probe: this.probeConfig,
          requestIndex,
          response: probeRes,
        })

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
          const id = `${this.probeConfig?.id}:${request.url}:${requestIndex}:${request?.id}`

          if (
            isProbeResponsive && // if connection is successful but
            isConnectionDown.has(id) // if connection WAS down then send a custom recovery alert. Else use user's alert.
          ) {
            validatedResponse[0].alert = {
              assertion: '',
              message: CONNECTION_RECOVERY_MESSAGE,
            }
            isConnectionDown.delete(id) // connection is up, so remove from entry
            validatedResponse.splice(1, validatedResponse.length) // truncate and use custom message
          } else if (!isProbeResponsive) {
            // if connection has failed, then lets send out specific notification
            validatedResponse[0].alert = {
              assertion: '',
              message: CONNECTION_INCIDENT_MESSAGE,
            }
            isConnectionDown.set(id, true) // connection is down, so add to map
            validatedResponse.splice(1, validatedResponse.length) // truncate and use custom message
          }
        }

        // Done processing results, check if need to send out alerts
        this.checkThresholdsAndSendAlert(
          {
            probe: this.probeConfig,
            statuses,
            notifications: this.notifications,
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
            getEventEmitter().emit(events.probe.alert.triggered, {
              probe: this.probeConfig,
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
        for (const { responseTime } of responses) {
          this.logResponseTime(responseTime)
        }

        requestLog.print()

        if (
          isSymonModeFrom(getContext().flags) ||
          getContext().flags['keep-verbose-logs'] ||
          requestLog.hasIncidentOrRecovery
        ) {
          requestLog.saveToDatabase().catch((error) => log.error(error.message))
        }
      }
    }
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

  private processThresholds({
    requestIndex,
    validatedResponse,
  }: ProcessThresholdsParams): ServerAlertState[] {
    const { requests, incidentThreshold, recoveryThreshold, socket, name } =
      this.probeConfig
    const request = requests?.[requestIndex]

    const id = `${this.probeConfig?.id}:${name}:${requestIndex}:${
      request?.id || ''
    }-${incidentThreshold}:${recoveryThreshold} ${
      request?.url || (socket ? `${socket.host}:${socket.port}` : '')
    }`

    const results: Array<ServerAlertState> = []

    if (!serverAlertStateInterpreters.has(id!)) {
      const interpreters: Record<string, any> = {}

      for (const alert of validatedResponse.map((r) => r.alert)) {
        const stateMachine = serverAlertStateMachine.withContext({
          incidentThreshold,
          recoveryThreshold,
          consecutiveFailures: 0,
          consecutiveSuccesses: 0,
          isFirstTimeSendEvent: true,
        })

        interpreters[alert.assertion] = interpret(stateMachine).start()
      }

      serverAlertStateInterpreters.set(id!, interpreters)
    }

    // Send event for successes and failures to state interpreter
    // then get latest state for each alert
    for (const validation of validatedResponse) {
      const { alert, isAlertTriggered } = validation
      const interpreter = serverAlertStateInterpreters.get(id!)![
        alert.assertion
      ]

      const prevStateValue = interpreter.state.value

      interpreter.send(isAlertTriggered ? 'FAILURE' : 'SUCCESS')

      const stateValue = interpreter.state.value
      const stateContext = interpreter.state.context

      results.push({
        isFirstTime: stateContext.isFirstTimeSendEvent,
        alertQuery: alert.assertion,
        state: stateValue as 'UP' | 'DOWN',
        shouldSendNotification:
          stateContext.isFirstTimeSendEvent ||
          (stateValue === 'DOWN' && prevStateValue === 'UP') ||
          (stateValue === 'UP' && prevStateValue === 'DOWN'),
      })

      interpreter.send('FIST_TIME_EVENT_SENT')
    }

    return results
  }

  private validateResponse(
    response: ProbeRequestResponse,
    additionalAssertions?: ProbeAlert[]
  ): ValidatedResponse[] {
    const assertions: ProbeAlert[] = [
      ...(this.probeConfig.alerts || [
        {
          assertion: 'response.status < 200 or response.status > 299',
          message: 'Probe cannot be accessed',
        },
      ]),
      ...(additionalAssertions || []),
    ]

    return assertions.map((assertion) => ({
      alert: assertion,
      isAlertTriggered: responseChecker(assertion, response),
      response,
    }))
  }

  // Probes Thresholds processed, Send out notifications/alerts.
  private checkThresholdsAndSendAlert(
    data: ProbeStatusProcessed,
    requestLog: RequestLog
  ): void {
    const {
      probe,
      statuses,
      notifications,
      requestIndex,
      validatedResponseStatuses,
    } = data

    const probeStatesWithValidAlert = this.getProbeStatesWithValidAlert(
      statuses || []
    )

    for (const [index, probeState] of probeStatesWithValidAlert.entries()) {
      const { alertQuery, state } = probeState

      // send only notifications that we have messages for (if it was truncated)
      if (index === validatedResponseStatuses.length) {
        break
      }

      this.probeSendNotification({
        index,
        probe,
        probeState,
        notifications,
        requestIndex,
        validatedResponseStatuses,
      }).catch((error: Error) => log.error(error.message))

      requestLog.addNotifications(
        (notifications ?? []).map((notification) => ({
          notification,
          type: state === 'DOWN' ? 'NOTIFY-INCIDENT' : 'NOTIFY-RECOVER',
          alertQuery: alertQuery || '',
        }))
      )
    }
  }

  private getProbeStatesWithValidAlert(
    probeStates: ServerAlertState[]
  ): ServerAlertState[] {
    return probeStates.filter(
      ({ isFirstTime, shouldSendNotification, state }) => {
        const isFirstUpEvent = isFirstTime && state === 'UP'
        const isFirstUpEventForNonSymonMode = isFirstUpEvent

        return shouldSendNotification && !isFirstUpEventForNonSymonMode
      }
    )
  }
}
