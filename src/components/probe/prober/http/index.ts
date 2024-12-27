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

import { BaseProber, NotificationType, type ProbeParams } from '..'
import { getContext } from '../../../../context'
import events from '../../../../events'
import type { ProbeAlert } from '../../../../interfaces/probe'
import {
  probeRequestResult,
  type ProbeRequestResponse,
  type RequestConfig,
} from '../../../../interfaces/request'
import type { ValidatedResponse } from '../../../../plugins/validate-response'
import responseChecker from '../../../../plugins/validate-response/checkers'
import { getAlertID } from '../../../../utils/alert-id'
import { getEventEmitter } from '../../../../utils/events'
import { isSymonModeFrom } from '../../../config'
import { addIncident } from '../../../incident'
import { saveProbeRequestLog } from '../../../logger/history'
import { logResponseTime } from '../../../logger/response-time-log'
import { httpRequest } from './request'
import { get as getCache, put as putCache } from './response-cache'

type ProbeResultMessageParams = {
  request: RequestConfig
  response: ProbeRequestResponse
}

export class HTTPProber extends BaseProber {
  async probe({ incidentRetryAttempt, signal }: ProbeParams): Promise<void> {
    const requests = this.probeConfig.requests!
    // sending multiple http requests for request chaining
    const responses: ProbeRequestResponse[] = []

    // do http request
    // force fresh request if :
    // - probe has chaining requests, OR
    // - this is a retrying attempt
    if (
      requests.length > 1 ||
      incidentRetryAttempt > 0 ||
      !getContext().flags['ttl-cache']
    ) {
      for (const requestConfig of requests) {
        responses.push(
          // eslint-disable-next-line no-await-in-loop
          await this.doRequest(requestConfig, signal, responses)
        )
      }
    } else {
      // use cached response when possible
      // or fallback to fresh request if cache expired
      const responseCache = getCache(requests[0])
      const response =
        responseCache || (await this.doRequest(requests[0], signal, responses))
      if (!responseCache) putCache(requests[0], response)
      responses.push(response)
    }

    const hasFailedRequest = responses.find(
      ({ result }) => result !== probeRequestResult.success
    )
    if (hasFailedRequest) {
      if (this.hasIncident()) {
        // this probe is currently 'incident' state so no need to continue
        this.logMessage(
          false,
          getErrorMessage(hasFailedRequest.error || 'Unknown error.')
        )
        return
      }

      // if the incident threshold is not yet met, this will throw and return the execution to `retry` function in src/components/probe/index.ts
      this.throwIncidentIfNeeded(
        incidentRetryAttempt,
        this.probeConfig.incidentThreshold
      )

      // the threshold has been met, so let's log the message
      this.logMessage(
        false,
        getErrorMessage(hasFailedRequest.error || 'Unknown error.'),
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

        // if the incident threshold is not yet met, this will throw and return the execution to `retry` function in src/components/probe/index.ts
        this.throwIncidentIfNeeded(
          incidentRetryAttempt,
          this.probeConfig.incidentThreshold,
          'Probe assertion failed'
        )

        // this probe is definitely in incident state because of fail assertion, so send notification, etc.
        this.handleAssertionFailed(response, requestIndex, alert)
        return
      }
    }

    // from here on, the probe is definitely healthy, but if it was incident, we don't want to immediately send notification
    this.sendRecoveryNotificationIfNeeded(
      incidentRetryAttempt,
      responses.map((requestResponse) => ({ requestResponse }))
    )

    // the probe is healthy and not recovery
    for (const requestIndex of responses.keys()) {
      const response = responses[requestIndex]
      getEventEmitter().emit(events.probe.response.received, {
        probe: this.probeConfig,
        requestIndex,
        response,
      })

      getEventEmitter().emit(events.probe.status.changed, {
        probe: this.probeConfig,
        requestIndex,
        status: 'up',
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

  private doRequest(
    config: RequestConfig,
    signal: AbortSignal | undefined,
    responses: ProbeRequestResponse[]
  ) {
    return httpRequest({
      requestConfig: {
        ...config,
        allowUnauthorized:
          config.allowUnauthorized ?? getContext().flags.ignoreInvalidTLS,
        signal,
      },
      responses,
    })
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
    const probeID = this.probeConfig.id
    const url = this.probeConfig?.requests?.[requestIndex].url || ''
    const validation = {
      alert: triggeredAlert,
      isAlertTriggered: true,
      response,
    }
    const alertId = getAlertID(url, validation, probeID)

    getEventEmitter().emit(events.probe.status.changed, {
      probe: this.probeConfig,
      requestIndex,
      status: 'down',
    })

    getEventEmitter().emit(events.probe.alert.triggered, {
      probe: this.probeConfig,
      requestIndex,
      alertQuery: '',
    })

    addIncident({
      alert: triggeredAlert,
      probeID,
      probeRequestURL: url,
    })

    this.sendNotification({
      requestURL: url,
      notificationType: NotificationType.Incident,
      validation,
      alertId,
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
  if (request?.ping) {
    return response?.body as string
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
