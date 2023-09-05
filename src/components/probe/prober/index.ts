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
import { getContext, setContext } from '../../../context'
import events from '../../../events'
import type { Probe } from '../../../interfaces/probe'
import type { ProbeRequestResponse } from '../../../interfaces/request'
import type { ValidatedResponse } from '../../../plugins/validate-response'
import { getEventEmitter } from '../../../utils/events'
import { log } from '../../../utils/pino'
import { isSymonModeFrom } from '../../config'
import { RequestLog } from '../../logger'
import type { ServerAlertState } from '../../../interfaces/probe-status'
import {
  serverAlertStateInterpreters,
  serverAlertStateMachine,
} from '../../notification/process-server-status'
import { logResponseTime } from '../../logger/response-time-log'
import { sendAlerts } from '../../notification'
import { saveNotificationLog, saveProbeRequestLog } from '../../logger/history'

export type ProbeResult = {
  isAlertTriggered: boolean
  logMessage: string
  requestResponse: ProbeRequestResponse
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

type SendNotificationParams = {
  requestURL: string
  requestResponse: ProbeRequestResponse
}

export interface Prober {
  probe: () => Promise<void>
  generateVerboseStartupMessage: () => string
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
  processThresholds({
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

  protected processProbeResults(probeResults: ProbeResult[]): void {
    for (const index of probeResults.keys()) {
      this.logMessage(probeResults[index])
    }

    const failedProbeResult = probeResults.find((pr) => pr.isAlertTriggered)

    if (failedProbeResult) {
      const requestIndex = probeResults.findIndex(
        (probeResult) => probeResult.isAlertTriggered
      )
      saveProbeRequestLog({
        probe: this.probeConfig,
        requestIndex,
        probeRes: probeResults[requestIndex].requestResponse,
        error: 'Probe not accessible',
      })

      if (this.hasIncident()) {
        throw new Error('Probe not accessible')
      }

      const newIncident = {
        probeID: this.probeConfig.id,
        probeRequestURL: this.probeConfig?.requests?.[requestIndex].url || '',
        createdAt: new Date(),
      }
      setContext({ incidents: [...getContext().incidents, newIncident] })

      this.sendIncidentNotification({
        requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
        requestResponse: failedProbeResult.requestResponse,
      })

      throw new Error('Probe not accessible')
    }

    if (this.hasIncident()) {
      const recoveredIncident = getContext().incidents.find(
        (incident) => incident.probeID === this.probeConfig.id
      )
      const requestIndex =
        this.probeConfig?.requests?.findIndex(
          ({ url }) => url === recoveredIncident?.probeRequestURL
        ) || 0
      if (recoveredIncident) {
        this.sendRecoveryNotification({
          requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
          requestResponse: probeResults[requestIndex].requestResponse,
        })
      }

      const newIncidents = getContext().incidents.filter(
        (incident) => incident.probeID !== this.probeConfig.id
      )
      setContext({ incidents: newIncidents })
    }

    for (const index of probeResults.keys()) {
      const { requestResponse } = probeResults[index]
      getEventEmitter().emit(events.probe.response.received, {
        probe: this.probeConfig,
        requestIndex: index,
        response: requestResponse,
      })

      if (
        isSymonModeFrom(getContext().flags) ||
        getContext().flags['keep-verbose-logs']
      ) {
        saveProbeRequestLog({
          probe: this.probeConfig,
          requestIndex: index,
          probeRes: requestResponse,
          alertQueries: this.probeConfig?.requests?.[index].alerts?.map(
            ({ assertion }) => assertion
          ),
        })
      }
    }
  }

  private hasNotification() {
    return this.notifications.length > 0
  }

  private hasIncident() {
    return getContext().incidents.find(
      (incident) => incident.probeID === this.probeConfig.id
    )
  }

  private async sendIncidentNotification({
    requestURL,
    requestResponse,
  }: SendNotificationParams) {
    if (!this.hasNotification()) {
      return
    }

    await sendAlerts({
      probeID: this.probeConfig.id,
      // TODO: change url based on the prober type
      url: requestURL,
      probeState: 'DOWN',
      notifications: this.notifications,
      // TODO: make it possible to send alert without validation
      validation: {
        alert: { assertion: '', message: 'Probe not accessible' },
        isAlertTriggered: true,
        response: requestResponse,
      },
    })

    await Promise.all(
      this.notifications.map((notification) =>
        saveNotificationLog(
          this.probeConfig,
          notification,
          // TODO: Make enum for notification type
          'NOTIFY-INCIDENT',
          ''
        )
      )
    )
  }

  private async sendRecoveryNotification({
    requestURL,
    requestResponse,
  }: SendNotificationParams) {
    if (!this.hasNotification()) {
      return
    }

    await sendAlerts({
      probeID: this.probeConfig.id,
      // TODO: change url based on the prober type
      url: requestURL,
      probeState: 'UP',
      notifications: this.notifications,
      // TODO: make it possible to send alert without validation
      validation: {
        alert: { assertion: '', message: 'Probe not accessible' },
        isAlertTriggered: false,
        response: requestResponse,
      },
    })

    await Promise.all(
      this.notifications.map((notification) =>
        saveNotificationLog(
          this.probeConfig,
          notification,
          // TODO: Make enum for notification type
          'NOTIFY-RECOVER',
          ''
        )
      )
    )
  }

  protected logResponseTime(responseTimeInMs: number): void {
    logResponseTime(responseTimeInMs)
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
