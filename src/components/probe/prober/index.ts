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
import { v4 as uuid } from 'uuid'
import { type Incident, getContext } from '../../../context'
import events from '../../../events'
import type { Probe, ProbeAlert } from '../../../interfaces/probe'
import {
  probeRequestResult,
  type ProbeRequestResponse,
} from '../../../interfaces/request'
import { getEventEmitter } from '../../../utils/events'
import { log } from '../../../utils/pino'
import { isSymonModeFrom } from '../../config'
import { sendAlerts } from '../../notification'
import { saveNotificationLog, saveProbeRequestLog } from '../../logger/history'
import { logResponseTime } from '../../logger/response-time-log'
import type { ValidatedResponse } from '../../../plugins/validate-response'
import {
  startDowntimeCounter,
  stopDowntimeCounter,
} from '../../downtime-counter'

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
}

export interface Prober {
  probe: () => Promise<void>
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

export enum ProbeMessage {
  ProbeNotAccessible = 'Probe not accessible',
  ProbeAccessibleAgain = 'Probe accessible again',
}

export const failedRequestAssertion: ProbeAlert = {
  id: uuid(),
  assertion: '',
  message: ProbeMessage.ProbeNotAccessible,
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

  protected processProbeResults(probeResults: ProbeResult[]): void {
    for (const probeResult of probeResults) {
      logMessage(probeResult)
    }

    if (
      probeResults.some(
        ({ requestResponse }) =>
          requestResponse.result !== probeRequestResult.success
      )
    ) {
      if (this.hasIncident()) {
        throw new Error(ProbeMessage.ProbeNotAccessible)
      }

      this.handleFailedProbe(probeResults)
      throw new Error(ProbeMessage.ProbeNotAccessible)
    }

    if (this.hasIncident()) {
      this.handleRecovery(probeResults)
    }

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

  protected hasIncident(): Incident | undefined {
    return getContext().incidents.find(
      (incident) => incident.probeID === this.probeConfig.id
    )
  }

  protected async sendNotification({
    requestURL,
    notificationType,
    validation,
  }: SendNotificationParams): Promise<void> {
    const isRecoveryNotification = notificationType === NotificationType.Recover
    getEventEmitter().emit(events.probe.notification.willSend, {
      probeID: this.probeConfig.id,
      notifications: this.notifications,
      url: requestURL,
      probeState: isRecoveryNotification ? ProbeState.Up : ProbeState.Down,
      validation,
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

  private handleFailedProbe(probeResults: ProbeResult[]) {
    const hasfailedProbe = probeResults.find(
      ({ requestResponse }) =>
        requestResponse.result !== probeRequestResult.success
    )
    const { requestResponse } = hasfailedProbe!
    const requestIndex = probeResults.findIndex(
      ({ requestResponse }) =>
        requestResponse.result !== probeRequestResult.success
    )

    getEventEmitter().emit(events.probe.alert.triggered, {
      probe: this.probeConfig,
      requestIndex,
      alertQuery: failedRequestAssertion,
    })

    startDowntimeCounter({
      alert: failedRequestAssertion,
      probeID: this.probeConfig.id,
      url: this.probeConfig?.requests?.[requestIndex].url || '',
    })

    saveProbeRequestLog({
      probe: this.probeConfig,
      requestIndex,
      probeRes: requestResponse,
      alertQueries: [failedRequestAssertion.assertion],
      error: requestResponse.errMessage,
    })

    this.sendNotification({
      requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
      notificationType: NotificationType.Incident,
      validation: {
        alert: failedRequestAssertion,
        isAlertTriggered: true,
        response: requestResponse,
      },
    }).catch((error) => log.error(error.mesage))
  }

  private handleRecovery(probeResults: ProbeResult[]) {
    const recoveredIncident = getContext().incidents.find(
      (incident) => incident.probeID === this.probeConfig.id
    )
    const requestIndex =
      this.probeConfig?.requests?.findIndex(
        ({ url }) => url === recoveredIncident?.probeRequestURL
      ) || 0

    if (recoveredIncident) {
      stopDowntimeCounter({
        alert: recoveredIncident.alert,
        probeID: this.probeConfig.id,
        url: this.probeConfig?.requests?.[requestIndex].url || '',
      })

      this.sendNotification({
        requestURL: this.probeConfig?.requests?.[requestIndex].url || '',
        notificationType: NotificationType.Recover,
        validation: {
          alert: failedRequestAssertion,
          isAlertTriggered: false,
          response: probeResults[requestIndex].requestResponse,
        },
      }).catch((error) => log.error(error.mesage))
    }

    saveProbeRequestLog({
      probe: this.probeConfig,
      requestIndex,
      probeRes: probeResults[requestIndex].requestResponse,
      alertQueries: [failedRequestAssertion.assertion],
    })
  }

  private hasNotification() {
    return this.notifications.length > 0
  }
}

function logMessage({ isAlertTriggered, logMessage }: ProbeResult): void {
  if (isAlertTriggered) {
    log.warn(logMessage)
    return
  }

  log.info(logMessage)
}
