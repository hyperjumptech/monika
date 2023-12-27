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
import { AbortSignal } from 'node-abort-controller'
import { getContext, type Incident } from '../../../context'
import events from '../../../events'
import type { Probe, ProbeAlert } from '../../../interfaces/probe'
import {
  probeRequestResult,
  type ProbeRequestResponse,
  type RequestConfig,
} from '../../../interfaces/request'
import { FAILED_REQUEST_ASSERTION } from '../../../looper'
import type { ValidatedResponse } from '../../../plugins/validate-response'
import { getAlertID } from '../../../utils/alert-id'
import { getEventEmitter } from '../../../utils/events'
import { log } from '../../../utils/pino'
import { isSymonModeFrom } from '../../config'
import {
  DEFAULT_INCIDENT_THRESHOLD,
  DEFAULT_RECOVERY_THRESHOLD,
} from '../../config/validation/validator/default-values'
import { addIncident, removeIncident } from '../../downtime-counter'
import { saveNotificationLog, saveProbeRequestLog } from '../../logger/history'
import { logResponseTime } from '../../logger/response-time-log'
import { sendAlerts } from '../../notification'

export type ProbeResult = {
  isAlertTriggered: boolean
  logMessage: string
  requestResponse: ProbeRequestResponse
}

export enum NotificationType {
  Incident = 'NOTIFY-INCIDENT',
  Recover = 'NOTIFY-RECOVER',
}

type SendNotificationParams = {
  requestURL: string
  notificationType: NotificationType
  validation: ValidatedResponse
  alertId: string
}

export type ProbeParams = {
  incidentRetryAttempt: number
  signal: AbortSignal
}

export interface Prober {
  probe: ({ incidentRetryAttempt, signal }: ProbeParams) => Promise<void>
  generateVerboseStartupMessage: () => string
}

export type ProberMetadata = {
  counter: number
  notifications: Notification[]
  probeConfig: Probe
}

enum ProbeState {
  Up = 'UP',
  Down = 'DOWN',
}

export abstract class BaseProber implements Prober {
  protected readonly counter: number
  protected readonly notifications: Notification[]
  protected readonly probeConfig: Probe

  constructor({ counter, notifications, probeConfig }: ProberMetadata) {
    this.counter = counter
    this.notifications = notifications
    this.probeConfig = probeConfig

    this.initializeProbeState()
  }

  abstract probe({ incidentRetryAttempt, signal }: ProbeParams): Promise<void>

  abstract generateVerboseStartupMessage(): string

  protected processProbeResults(
    probeResults: ProbeResult[],
    incidentRetryAttempt: number
  ): void {
    for (const { isAlertTriggered, logMessage } of probeResults) {
      this.logMessage(!isAlertTriggered, logMessage)
    }

    if (
      probeResults.some(
        ({ requestResponse }) =>
          requestResponse.result !== probeRequestResult.success
      )
    ) {
      if (this.hasIncident()) {
        // this probe is still in incident state
        return
      }

      // if the incident threshold is not yet met, this will throw and return the execution to `retry` function in src/components/probe/index.ts
      this.throwIncidentIfNeeded(
        incidentRetryAttempt,
        this.probeConfig.incidentThreshold
      )

      // this probe is definitely in incident state because of fail assertion, so send notification, etc.
      this.handleFailedProbe(probeResults)
      return
    }

    // from here on, the probe is definitely healthy, but if it was incident, we don't want to immediately send notification
    this.sendRecoveryNotificationIfNeeded(incidentRetryAttempt, probeResults)

    // the probe is healthy and not recovery
    for (const index of probeResults.keys()) {
      const { requestResponse } = probeResults[index]
      getEventEmitter().emit(events.probe.response.received, {
        probe: this.probeConfig,
        requestIndex: index,
        response: requestResponse,
      })
      logResponseTime(requestResponse.responseTime)

      if (
        isSymonModeFrom(getContext().flags) ||
        getContext().flags['keep-verbose-logs']
      ) {
        saveProbeRequestLog({
          probe: this.probeConfig,
          requestIndex: index,
          probeRes: requestResponse,
        })
      }
    }
  }

  protected getFailedRequestAssertion(
    requestIndex?: number
  ): ProbeAlert | undefined {
    const getFailedRequestAssertionFromProbe = (): ProbeAlert | undefined =>
      this.probeConfig.alerts.find(
        ({ assertion, message, query }) =>
          (assertion === FAILED_REQUEST_ASSERTION.assertion ||
            query === FAILED_REQUEST_ASSERTION.assertion) &&
          message === FAILED_REQUEST_ASSERTION.message
      )
    const getFailedRequestAssertionFromRequests = (
      requestIndex?: number
    ): ProbeAlert | undefined => {
      if (
        this.probeConfig.requests === undefined ||
        requestIndex === undefined
      ) {
        return undefined
      }

      return (this.probeConfig.requests[requestIndex].alerts || []).find(
        ({ assertion, message, query }) =>
          (assertion === FAILED_REQUEST_ASSERTION.assertion ||
            query === FAILED_REQUEST_ASSERTION.assertion) &&
          message === FAILED_REQUEST_ASSERTION.message
      )
    }

    return (
      getFailedRequestAssertionFromProbe() ||
      getFailedRequestAssertionFromRequests(requestIndex)
    )
  }

  protected hasIncident(): Incident | undefined {
    return getContext().incidents.find(
      (incident) => incident.probeID === this.probeConfig.id
    )
  }

  /**
   * If the probe is healthy and previously not (so it's a recovery), this function will call the function to send recovery notification only when the retry attempts equals to the recovery threshold - 1.
   * Otherwise, it will throw and return the execution to the retry function in src/components/probe/index.ts.
   * If the probe is healthy just like before, nothing to do in this function.
   * @param incidentRetryAttempt The number of retry attempts
   * @param probeResults The probe results
   * @returns void
   */
  protected sendRecoveryNotificationIfNeeded(
    incidentRetryAttempt: number,
    probeResults: Pick<ProbeResult, 'requestResponse'>[]
  ) {
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
          }) with recovery threshold (${this.probeConfig.recoveryThreshold}).`
        )
        // throw here so that the retry function in src/components/probe/index.ts can retry again
        throw new Error('Probing succeeds but recovery threshold is not met.')
      }

      // at this state, the probe has definitely recovered, so send notifications, etc.
      this.handleRecovery(probeResults)
    }
  }

  /**
   * If the number of attempts is equal to the incidentThreshold - 1, this function will throw which will return execution to  the retry function in src/components/probe/index.ts.
   * Otherwise, it will not do anything.
   * @param incidentRetryAttempt How many times have monika retry probing
   * @param incidentThreshold The incident threshold of the probe
   * @param message Message to display to stdout
   * @throws
   * @returns void
   */
  protected throwIncidentIfNeeded(
    incidentRetryAttempt: number,
    incidentThreshold: number = DEFAULT_INCIDENT_THRESHOLD,
    message = 'Probing failed'
  ): void {
    const isIncidentThresholdMet =
      incidentRetryAttempt === incidentThreshold - 1

    if (!isIncidentThresholdMet) {
      this.logMessage(
        false,
        `${message}. Will try again. Attempt (${
          incidentRetryAttempt + 1
        }) with incident threshold (${incidentThreshold}).`
      )

      // throw here so that the retry function in src/components/probe/index.ts can retry again
      throw new Error(`${message} but incident threshold is not met.`)
    }
  }

  protected async sendNotification({
    requestURL,
    notificationType,
    validation,
    alertId,
  }: SendNotificationParams): Promise<void> {
    const isRecoveryNotification = notificationType === NotificationType.Recover
    getEventEmitter().emit(events.probe.notification.willSend, {
      probeID: this.probeConfig.id,
      notifications: this.notifications,
      url: requestURL,
      probeState: isRecoveryNotification ? ProbeState.Up : ProbeState.Down,
      validation,
      alertId,
    })

    if (!this.hasNotification()) {
      return
    }

    await sendAlerts({
      probeID: this.probeConfig.id,
      url: requestURL,
      probeState: isRecoveryNotification ? ProbeState.Up : ProbeState.Down,
      notifications: this.notifications,
      validation,
    })

    await Promise.all(
      this.notifications.map((notification) =>
        saveNotificationLog(
          this.probeConfig,
          notification,
          isRecoveryNotification
            ? NotificationType.Recover
            : NotificationType.Incident,
          ''
        )
      )
    )
  }

  protected handleFailedProbe(
    probeResults: Pick<ProbeResult, 'requestResponse'>[]
  ): void {
    const hasfailedProbe = probeResults.find(
      ({ requestResponse }) =>
        requestResponse.result !== probeRequestResult.success
    )
    const { requestResponse } = hasfailedProbe!
    const requestIndex = probeResults.findIndex(
      ({ requestResponse }) =>
        requestResponse.result !== probeRequestResult.success
    )
    const failedRequestAssertion = this.getFailedRequestAssertion(requestIndex)

    if (!failedRequestAssertion) {
      log.error('Failed request assertion is not found')
      return
    }

    getEventEmitter().emit(events.probe.alert.triggered, {
      probe: this.probeConfig,
      requestIndex,
      alertQuery: failedRequestAssertion,
    })

    addIncident({
      alert: failedRequestAssertion,
      probeID: this.probeConfig.id,
      url: this.probeConfig?.requests?.[requestIndex].url || '',
    })

    saveProbeRequestLog({
      probe: this.probeConfig,
      requestIndex,
      probeRes: requestResponse,
      alertQueries: [failedRequestAssertion.assertion],
      error: requestResponse.error,
    })

    const url = this.probeConfig?.requests?.[requestIndex].url || ''
    const validation = {
      alert: failedRequestAssertion,
      isAlertTriggered: true,
      response: requestResponse,
    }
    const probeID = this.probeConfig.id

    const alertId = getAlertID(url, validation, probeID)

    this.sendNotification({
      requestURL: url,
      notificationType: NotificationType.Incident,
      validation,
      alertId,
    }).catch((error) => log.error(error.mesage))
  }

  protected handleRecovery(
    probeResults: Pick<ProbeResult, 'requestResponse'>[]
  ): void {
    const recoveredIncident = getContext().incidents.find(
      (incident) => incident.probeID === this.probeConfig.id
    )
    const requestIndex =
      this.probeConfig?.requests?.findIndex(
        ({ url }) => url === recoveredIncident?.probeRequestURL
      ) || 0

    if (recoveredIncident) {
      removeIncident({
        alert: recoveredIncident.alert,
        probeID: this.probeConfig.id,
        url: this.probeConfig?.requests?.[requestIndex].url || '',
      })

      const url = this.probeConfig?.requests?.[requestIndex].url || ''
      const validation = {
        alert: recoveredIncident.alert,
        isAlertTriggered: false,
        response: probeResults[requestIndex].requestResponse,
      }
      const probeID = this.probeConfig.id

      const alertId = getAlertID(url, validation, probeID)

      this.sendNotification({
        requestURL: url,
        notificationType: NotificationType.Recover,
        validation,
        alertId,
      }).catch((error) => log.error(error.mesage))
    }

    saveProbeRequestLog({
      probe: this.probeConfig,
      requestIndex,
      probeRes: probeResults[requestIndex].requestResponse,
      alertQueries: [recoveredIncident?.alert.assertion || ''],
    })
  }

  protected logMessage(isSuccess: boolean, ...message: string[]): void {
    if (isSuccess) {
      log.info(
        `${this.getMessagePrefix()} ${message.filter(Boolean).join(', ')}`
      )
      return
    }

    log.warn(`${this.getMessagePrefix()} ${message.filter(Boolean).join(', ')}`)
  }

  private initializeProbeState() {
    if (
      !this.probeConfig?.lastEvent ||
      this.probeConfig.lastEvent?.recoveredAt !== null
    ) {
      return
    }

    if (!this.probeConfig.lastEvent?.alertId) {
      log.error(`Last event ID in probe ${this.probeConfig.id} is required`)
      return
    }

    const { alertId, createdAt } = this.probeConfig.lastEvent
    const alert = this.getAlerts().find(({ id }) => id === alertId)

    if (!alert) {
      log.error(
        `Alert ID: ${alertId} is not found in probe ${this.probeConfig.id}`
      )
      return
    }

    const request = this.getRequestByAlertId(alertId)
    if (!request) {
      log.error(
        `Request for alert ID: ${alertId} is not found in probe ${this.probeConfig.id}`
      )
      return
    }

    addIncident({
      alert,
      probeID: this.probeConfig.id,
      url: request.url,
      createdAt,
    })
  }

  private getAlerts() {
    const httpAlerts =
      this.probeConfig?.requests?.map(({ alerts }) => alerts).find(Boolean) ||
      []
    const mariadbAlerts =
      this.probeConfig?.mariadb?.map(({ alerts }) => alerts).find(Boolean) || []
    const mongoAlerts =
      this.probeConfig?.mongo?.map(({ alerts }) => alerts).find(Boolean) || []
    const mysqlAlerts =
      this.probeConfig?.mysql?.map(({ alerts }) => alerts).find(Boolean) || []
    const pingAlerts =
      this.probeConfig?.ping?.map(({ alerts }) => alerts).find(Boolean) || []
    const postgresAlerts =
      this.probeConfig?.postgres?.map(({ alerts }) => alerts).find(Boolean) ||
      []
    const redisAlerts =
      this.probeConfig?.redis?.map(({ alerts }) => alerts).find(Boolean) || []
    const socketAlerts = this.probeConfig?.socket?.alerts || []

    return [
      ...(this.probeConfig?.alerts || []),
      ...httpAlerts,
      ...mariadbAlerts,
      ...mongoAlerts,
      ...mysqlAlerts,
      ...pingAlerts,
      ...postgresAlerts,
      ...redisAlerts,
      ...socketAlerts,
    ]
  }

  private getRequestByAlertId(alertId: string): RequestConfig | null {
    if (!this.probeConfig.requests) {
      return null
    }

    for (const request of this.probeConfig.requests) {
      if (!request?.alerts) {
        continue
      }

      if (request.alerts.some(({ id }) => id === alertId)) {
        return request
      }
    }

    return null
  }

  private hasNotification() {
    return this.notifications.length > 0
  }

  private getMessagePrefix() {
    return `${new Date().toISOString()} ${this.counter} id:${
      this.probeConfig.id
    }`
  }
}
