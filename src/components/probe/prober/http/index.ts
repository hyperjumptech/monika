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

import { type Incident, getContext, setContext } from '../../../../context'
import events from '../../../../events'
import { getEventEmitter } from '../../../../utils/events'
import { log } from '../../../../utils/pino'
import { httpRequest } from './request'
import {
  BaseProber,
  NotificationType,
  ProbeMessage,
  notConnectedRequestAssertion,
} from '..'
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

type ProbeResultMessageParams = {
  request: RequestConfig
  response: ProbeRequestResponse
}

export class HTTPProber extends BaseProber {
  async probe(): Promise<void> {
    const requests = this.probeConfig.requests!
    // sending multiple http requests for request chaining
    const responses: ProbeRequestResponse[] = []

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
        printLogMessage(
          false,
          getErrorMessage(hasFailedRequest.errMessage || 'Unknown error.')
        )
        throw new Error(ProbeMessage.ProbeNotAccessible)
      }

      this.handleFailedRequest(responses)
      throw new Error(ProbeMessage.ProbeNotAccessible)
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
          printLogMessage(false, getAssertionMessage(alert.assertion))
          throw new Error(alert.message)
        }

        this.handleAssertionFailed(response, requestIndex, alert)
        throw new Error(alert.message)
      }
    }

    const isRecovery = this.hasIncident()
    if (isRecovery) {
      this.handleIncidentRecovery(responses)
    }

    for (const requestIndex of responses.keys()) {
      const response = responses[requestIndex]
      getEventEmitter().emit(events.probe.response.received, {
        probe: this.probeConfig,
        requestIndex,
        response,
      })
      printLogMessage(
        true,
        this.getProbeResultMessage({
          request: requests[requestIndex],
          response,
        }),
        isRecovery ? getNotificationMessage({ isIncident: false }) : ''
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

  private handleFailedRequest(responses: ProbeRequestResponse[]) {
    const hasFailedRequest = responses.find(
      ({ result }) => result !== probeRequestResult.success
    )
    const requestIndex = responses.findIndex(
      ({ result }) => result !== probeRequestResult.success
    )

    getEventEmitter().emit(events.probe.alert.triggered, {
      probe: this.probeConfig,
      requestIndex,
      alertQuery: '',
    })

    saveProbeRequestLog({
      probe: this.probeConfig,
      requestIndex,
      probeRes: hasFailedRequest!,
      alertQueries: [notConnectedRequestAssertion.assertion],
      error: hasFailedRequest!.errMessage,
    })

    const newIncident: Incident = {
      probeID: this.probeConfig.id,
      probeRequestURL: this.probeConfig?.requests?.[requestIndex].url || '',
      alert: notConnectedRequestAssertion,
      createdAt: new Date(),
    }
    setContext({ incidents: [...getContext().incidents, newIncident] })

    this.sendNotification({
      requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
      notificationType: NotificationType.Incident,
      validation: {
        alert: notConnectedRequestAssertion,
        isAlertTriggered: true,
        response: hasFailedRequest!,
      },
    })

    printLogMessage(
      false,
      getErrorMessage(hasFailedRequest!.errMessage || 'Unknown error.'),
      getNotificationMessage({ isIncident: true })
    )
  }

  private handleIncidentRecovery(responses: ProbeRequestResponse[]) {
    const recoveredIncident = getContext().incidents.find(
      (incident) => incident.probeID === this.probeConfig.id
    )
    const requestIndex =
      this.probeConfig?.requests?.findIndex(
        ({ url }) => url === recoveredIncident?.probeRequestURL
      ) || 0
    if (recoveredIncident) {
      this.sendNotification({
        requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
        notificationType: NotificationType.Recover,
        validation: {
          alert: recoveredIncident.alert,
          isAlertTriggered: false,
          response: responses[requestIndex],
        },
      }).catch((error) => log.error(error.mesage))
    }

    saveProbeRequestLog({
      probe: this.probeConfig,
      requestIndex,
      probeRes: responses[requestIndex],
      alertQueries: [recoveredIncident?.alert.assertion || ''],
    })

    const newIncidents = getContext().incidents.filter(
      (incident) => incident.probeID !== this.probeConfig.id
    )
    setContext({ incidents: newIncidents })
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

    const newIncident: Incident = {
      probeID: this.probeConfig.id,
      probeRequestURL: this.probeConfig?.requests?.[requestIndex].url || '',
      alert: triggeredAlert,
      createdAt: new Date(),
    }
    setContext({ incidents: [...getContext().incidents, newIncident] })

    this.sendNotification({
      requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
      notificationType: NotificationType.Incident,
      validation: {
        alert: triggeredAlert,
        isAlertTriggered: true,
        response: response,
      },
    })

    printLogMessage(
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
    const hasAlert = this.probeConfig.alerts.length > 0
    const defaultAlertsInString = JSON.stringify(getDefaultAlerts())
    const alertsInString = JSON.stringify(this.probeConfig.alerts)

    return `    Alerts: ${hasAlert ? alertsInString : defaultAlertsInString}\n`
  }

  private validateResponse(
    response: ProbeRequestResponse,
    additionalAssertions?: ProbeAlert[]
  ): ValidatedResponse[] {
    const assertions: ProbeAlert[] = [
      ...(this.probeConfig.alerts || getDefaultAlerts()),
      ...(additionalAssertions || []),
    ]

    return assertions.map((assertion) => ({
      alert: assertion,
      isAlertTriggered: responseChecker(assertion, response),
      response,
    }))
  }

  private getProbeResultMessage({
    request,
    response,
  }: ProbeResultMessageParams): string {
    const { probeConfig, counter } = this

    // TODO: make this more generic not probe dependent
    if (request?.ping) {
      return `${counter} id:${probeConfig.id} ${response?.body}`
    }

    if (getContext().flags.verbose) {
      return `${counter} id:${probeConfig.id} ${response?.status || '-'} ${
        request?.method
      } ${request?.url} ${response?.responseTime || '-'}ms
      Request Headers: ${JSON.stringify(request?.headers) || '-'}
      Request Body: ${JSON.stringify(request?.body) || '-'}
      Response Body: ${JSON.stringify(response?.body) || '-'}`
    }

    return `${counter} id:${probeConfig.id} ${response?.status || '-'} ${
      request?.method
    } ${request?.url} ${response?.responseTime || '-'}ms`
  }
}

function printLogMessage(isSuccess: boolean, ...message: string[]) {
  if (isSuccess) {
    log.info(
      `${new Date().toISOString()} ${message.filter(Boolean).join(', ')}`
    )
    return
  }

  log.warn(`${new Date().toISOString()} ${message.filter(Boolean).join(', ')}`)
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

function getDefaultAlerts(): ProbeAlert[] {
  return [
    {
      assertion: 'response.status < 200 or response.status > 299',
      message: 'HTTP Status is {{ response.status }}, expecting 200',
    },
    {
      assertion: 'response.time > 2000',
      message:
        'Response time is {{ response.time }}ms, expecting less than 2000ms',
    },
  ]
}
