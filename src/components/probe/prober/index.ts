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

import type { Notification } from '@hyperjumptech/monika-notification'
import { interpret } from 'xstate'
import { getContext } from '../../../context'
import events from '../../../events'
import type { Probe, ProbeAlert } from '../../../interfaces/probe'
import type { ProbeRequestResponse } from '../../../interfaces/request'
import type { ValidatedResponse } from '../../../plugins/validate-response'
import { getEventEmitter } from '../../../utils/events'
import { log } from '../../../utils/pino'
import { isSymonModeFrom } from '../../config'
import { RequestLog } from '../../logger'
import responseChecker from '../../../plugins/validate-response/checkers'
import type { ServerAlertState } from '../../../interfaces/probe-status'
import {
  serverAlertStateInterpreters,
  serverAlertStateMachine,
} from '../../notification/process-server-status'
import { logResponseTime } from '../../logger/response-time-log'
import { sendAlerts } from '../../notification'

export type ProbeResult = {
  isAlertTriggered: boolean
  logMessage: string
  requestResponse: ProbeRequestResponse
}

type RespProsessingParams = {
  index: number
  probeResult: ProbeResult
}

type ProcessThresholdsParams = {
  requestIndex: number
  validatedResponse: ValidatedResponse[]
}

type ProbeStatusProcessed = {
  probe: Probe
  statuses?: ServerAlertState[]
  notifications: Notification[]
  validatedResponseStatuses: ValidatedResponse[]
  requestIndex: number
}

type ProbeSendNotification = {
  index: number
  probeState?: ServerAlertState
} & Omit<ProbeStatusProcessed, 'statuses'>

export interface Prober {
  probe: () => Promise<void>
  generateVerboseStartupMessage: () => string
  validateResponse: (
    response: ProbeRequestResponse,
    additionalAssertions?: ProbeAlert[]
  ) => ValidatedResponse[]
  processThresholds: ({
    requestIndex,
    validatedResponse,
  }: ProcessThresholdsParams) => ServerAlertState[]
  getProbeStatesWithValidAlert(
    probeStates: ServerAlertState[]
  ): ServerAlertState[]
}

export type ProberMetadata = {
  counter: number
  notifications: Notification[]
  probeConfig: Probe
}

export class BaseProber implements Prober {
  protected readonly counter: number
  protected readonly notifications: Notification[]
  protected readonly probeConfig: Probe

  constructor({ counter, notifications, probeConfig }: ProberMetadata) {
    this.counter = counter
    this.notifications = notifications
    this.probeConfig = probeConfig
  }

  async probe(): Promise<void> {
    this.processProbeResults([])
  }

  generateVerboseStartupMessage(): string {
    return ''
  }

  // TODO: make it protected/private
  validateResponse(
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

  // TODO: make it protected/private
  processThresholds = ({
    requestIndex,
    validatedResponse,
  }: ProcessThresholdsParams): ServerAlertState[] => {
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

  protected processProbeResults(probeResults: ProbeResult[]): void {
    for (const index of probeResults.keys()) {
      this.responseProcessing({ index, probeResult: probeResults[index] })
    }
  }

  protected logResponseTime(responseTimeInMs: number): void {
    logResponseTime(responseTimeInMs)
  }

  private responseProcessing({
    index,
    probeResult,
  }: RespProsessingParams): void {
    const { requestResponse } = probeResult
    getEventEmitter().emit(events.probe.response.received, {
      probe: this.probeConfig,
      requestIndex: index,
      response: requestResponse,
    })
    this.logMessage(probeResult)

    const requestLog = new RequestLog(this.probeConfig, index, 0)
    const validatedResponse = this.validateResponse(requestResponse)
    requestLog.addAlerts(
      validatedResponse
        .filter((item) => item.isAlertTriggered)
        .map((item) => item.alert)
    )
    requestLog.setResponse(requestResponse)
    // Done processing results, check if need to send out alerts
    this.checkThresholdsAndSendAlert(
      {
        probe: this.probeConfig,
        statuses: this.processThresholds({
          requestIndex: index,
          validatedResponse,
        }),
        notifications: this.notifications,
        requestIndex: index,
        validatedResponseStatuses: validatedResponse,
      },
      requestLog
    )

    if (
      isSymonModeFrom(getContext().flags) ||
      getContext().flags['keep-verbose-logs'] ||
      requestLog.hasIncidentOrRecovery
    ) {
      requestLog.saveToDatabase().catch((error) => log.error(error.message))
    }
  }

  private logMessage({ isAlertTriggered, logMessage }: ProbeResult) {
    if (isAlertTriggered) {
      log.warn(logMessage)
      return
    }

    log.info(logMessage)
  }

  // Probes Thresholds processed, Send out notifications/alerts.
  protected checkThresholdsAndSendAlert(
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

  // TODO: make it protected/private
  getProbeStatesWithValidAlert(
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

  private async probeSendNotification(data: ProbeSendNotification) {
    const eventEmitter = getEventEmitter()

    const {
      index,
      probe,
      probeState,
      notifications,
      requestIndex,
      validatedResponseStatuses,
    } = data

    const statusString = probeState?.state ?? 'UP'
    const url = probe.requests?.[requestIndex]?.url ?? ''
    const validation =
      validatedResponseStatuses.find(
        (validateResponse: ValidatedResponse) =>
          validateResponse.alert.assertion === probeState?.alertQuery
      ) || validatedResponseStatuses[index]

    eventEmitter.emit(events.probe.notification.willSend, {
      probeID: probe.id,
      notifications: notifications ?? [],
      url: url,
      probeState: statusString,
      validation,
    })

    if ((notifications?.length ?? 0) > 0) {
      await sendAlerts({
        probeID: probe.id,
        url,
        probeState: statusString,
        notifications: notifications ?? [],
        validation,
      })
    }
  }
}
