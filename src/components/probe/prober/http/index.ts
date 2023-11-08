/* eslint-disable complexity */
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

import { getContext } from '../../../../context'
import events from '../../../../events'
import { getEventEmitter } from '../../../../utils/events'
import { httpRequest } from './request'
import { BaseProber, NotificationType } from '..'
import {
  type ProbeRequestResponse,
  probeRequestResult,
  type RequestConfig,
} from '../../../../interfaces/request'
import type { ProbeAlert } from '../../../../interfaces/probe'
import responseChecker from '../../../../plugins/validate-response/checkers'
import { logResponseTime } from '../../../logger/response-time-log'
import { saveProbeRequestLog } from '../../../logger/history'
import type { ValidatedResponse } from '../../../../plugins/validate-response'
import { isSymonModeFrom } from '../../../config'
import { startDowntimeCounter } from '../../../downtime-counter'
import {
  DEFAULT_INCIDENT_THRESHOLD,
  DEFAULT_RECOVERY_THRESHOLD,
} from '../../../config/validation/validator/default-values'

type ProbeResultMessageParams = {
  request: RequestConfig
  response: ProbeRequestResponse
}

export class HTTPProber extends BaseProber {
  async probe(incidentRetryAttempt: number): Promise<void> {
    const requests = this.probeConfig.requests!
    // sending multiple http requests for request chaining
    const responses: ProbeRequestResponse[] = []
    const isIncidentThresholdMet =
      incidentRetryAttempt ===
      (this.probeConfig.incidentThreshold || DEFAULT_INCIDENT_THRESHOLD) - 1

    for (const requestConfig of requests) {
      responses.push(
        // eslint-disable-next-line no-await-in-loop
        await httpRequest({
          requestConfig,
          responses,
        })
      )
    }

    const hasFailedRequest = responses.find(
      ({ result }) => result !== probeRequestResult.success
    )
    if (hasFailedRequest) {
      if (this.hasIncident()) {
        // this probe is currently 'incident' state so no need to continue
        this.logMessage(
          false,
          getErrorMessage(hasFailedRequest.errMessage || 'Unknown error.')
        )
        return
      }

      if (!isIncidentThresholdMet) {
        this.logMessage(
          false,
          `Probing failed. Will try again. Attempt (${
            incidentRetryAttempt + 1
          }) with incident threshold (${this.probeConfig.incidentThreshold}).`
        )

        // throw here so that the retry function in src/components/probe/index.ts can retry again
        throw new Error(
          'Probe request failed but incident threshold is not met.'
        )
      }

      this.logMessage(
        false,
        getErrorMessage(hasFailedRequest.errMessage || 'Unknown error.'),
        getNotificationMessage({ isIncident: true })
      )

      // this probe is definitely in incident state, so send notification, etc.
      this.handleFailedProbe(
        responses.map((requestResponse) => ({ requestResponse }))
      )
      return
    }

    // from here on, the probe can be accessed but might still trigger the assertion
    for (const requestIndex of responses.keys()) {
      const response = responses[requestIndex]
      const validatedResponse = this.validateResponse(
        response,
        requests[requestIndex].alerts || []
      )
      const triggeredAlertResponse = validatedResponse.find(
        ({ isAlertTriggered }) => isAlertTriggered
      )

      if (triggeredAlertResponse) {
        const { alert } = triggeredAlertResponse

        if (this.hasIncident()) {
          // this probe is still in incident state
          this.logMessage(false, getAssertionMessage(alert.assertion))
          return
        }

        if (!isIncidentThresholdMet) {
          this.logMessage(
            false,
            `Probe assertion failed. Will retry. Attempt (${
              incidentRetryAttempt + 1
            }) with incident threshold (${this.probeConfig.incidentThreshold}).`
          )
          // throw here so that the retry function in src/components/probe/index.ts can retry again
          throw new Error(
            'Probe assertion failed but incident threshold is not met.'
          )
        }

        // this probe is definitely in incident state because of fail assertion, so send notification, etc.
        this.handleAssertionFailed(response, requestIndex, alert)
        return
      }
    }

    // from here on, the probe is definitely healthy, but if it was incident, we don't want to immediately send notification
    const isRecoveryThresholdMet =
      incidentRetryAttempt ===
      (this.probeConfig.recoveryThreshold || DEFAULT_RECOVERY_THRESHOLD) - 1
    const isRecovery = this.hasIncident()
    if (isRecovery) {
      if (!isRecoveryThresholdMet) {
        this.logMessage(
          false,
          `Probing succeeds but previously incident. Will retry. Attempt (${
            incidentRetryAttempt + 1
          }) with recovery threshold (${
            this.probeConfig.recoveryThreshold || DEFAULT_RECOVERY_THRESHOLD
          }).`
        )
        throw new Error('Probing succeeds but recovery threshold is not met.')
      }

      this.logMessage(true, getNotificationMessage({ isIncident: false }))

      // at this state, the probe has definitely recovered, so send notifications, etc.
      this.handleRecovery(
        responses.map((requestResponse) => ({ requestResponse }))
      )
    }

    // the probe is healthy and not recovery
    for (const requestIndex of responses.keys()) {
      const response = responses[requestIndex]
      getEventEmitter().emit(events.probe.response.received, {
        probe: this.probeConfig,
        requestIndex,
        response,
      })

      this.logMessage(
        true,
        getProbeResultMessage({
          request: requests[requestIndex],
          response,
        })
      )
      logResponseTime(response.responseTime)

      if (
        isSymonModeFrom(getContext().flags) ||
        getContext().flags['keep-verbose-logs']
      ) {
        saveProbeRequestLog({
          probe: this.probeConfig,
          requestIndex,
          probeRes: response,
        })
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

  private handleAssertionFailed(
    response: ProbeRequestResponse,
    requestIndex: number,
    triggeredAlert: ProbeAlert
  ) {
    getEventEmitter().emit(events.probe.alert.triggered, {
      probe: this.probeConfig,
      requestIndex,
      alertQuery: '',
    })

    startDowntimeCounter({
      alert: triggeredAlert,
      probeID: this.probeConfig.id,
      url: this.probeConfig?.requests?.[requestIndex].url || '',
    })

    this.sendNotification({
      requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
      notificationType: NotificationType.Incident,
      validation: {
        alert: triggeredAlert,
        isAlertTriggered: true,
        response,
      },
    })

    this.logMessage(
      false,
      getAssertionMessage(triggeredAlert.assertion),
      getNotificationMessage({ isIncident: true })
    )
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
    const alertsInString = JSON.stringify(this.probeConfig.alerts)

    return `    Alerts: ${alertsInString}\n`
  }

  private validateResponse(
    response: ProbeRequestResponse,
    additionalAssertions: ProbeAlert[]
  ): ValidatedResponse[] {
    const assertions = [...this.probeConfig.alerts, ...additionalAssertions]

    return assertions.map((assertion) => ({
      alert: assertion,
      isAlertTriggered: responseChecker(assertion, response),
      response,
    }))
  }
}

function getProbeResultMessage({
  request,
  response,
}: ProbeResultMessageParams): string {
  // TODO: make this more generic not probe dependent
  if (request?.ping) {
    return response?.body
  }

  if (getContext().flags.verbose) {
    return `${response?.status || '-'} ${request?.method} ${request?.url} ${
      response?.responseTime || '-'
    }ms
    Request Headers: ${JSON.stringify(request?.headers) || '-'}
    Request Body: ${JSON.stringify(request?.body) || '-'}
    Response Body: ${JSON.stringify(response?.body) || '-'}`
  }

  return `${response?.status || '-'} ${request?.method} ${request?.url} ${
    response?.responseTime || '-'
  }ms`
}

function getErrorMessage(message: string): string {
  return `ERROR: ${message}`
}

function getAssertionMessage(message: string): string {
  return `ASSERTION: ${message}`
}

function getNotificationMessage({
  isIncident,
}: {
  isIncident: boolean
}): string {
  return `NOTIF: ${isIncident ? 'Service probably down' : 'Service is back up'}`
}
