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
import { BaseProber, DEFAULT_INCIDENT_THRESHOLD, NotificationType } from '..'
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
      getContext().flags.repeat > 0
        ? incidentRetryAttempt === getContext().flags.repeat - 1
        : incidentRetryAttempt ===
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
        this.logMessage(
          false,
          getErrorMessage(hasFailedRequest.errMessage || 'Unknown error.')
        )
        throw new Error('There is an ongoing incident.')
      }

      if (!isIncidentThresholdMet) {
        this.logMessage(
          false,
          `Probe request failed. Attempt (${
            incidentRetryAttempt + 1
          }) with incident threshold (${this.probeConfig.incidentThreshold}).`
        )
        throw new Error(
          'Probe request is failed but incident threshold is not met.'
        )
      }

      this.logMessage(
        false,
        getErrorMessage(hasFailedRequest.errMessage || 'Unknown error.'),
        getNotificationMessage({ isIncident: true })
      )

      this.handleFailedProbe(
        responses.map((requestResponse) => ({ requestResponse }))
      )
      throw new Error('Probe request is failed.')
    }

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
          this.logMessage(false, getAssertionMessage(alert.assertion))
          throw new Error(alert.message)
        }

        if (!isIncidentThresholdMet) {
          this.logMessage(
            false,
            `Probe assertion failed. Attempt (${
              incidentRetryAttempt + 1
            }) with incident threshold (${this.probeConfig.incidentThreshold}).`
          )
          throw new Error(
            'Probe assertion is failed but incident threshold is not met.'
          )
        }

        this.handleAssertionFailed(response, requestIndex, alert)
        throw new Error(alert.message)
      }
    }

    const isRecovery = this.hasIncident()
    if (isRecovery) {
      this.logMessage(true, getNotificationMessage({ isIncident: false }))
      this.handleRecovery(
        responses.map((requestResponse) => ({ requestResponse }))
      )
    }

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
