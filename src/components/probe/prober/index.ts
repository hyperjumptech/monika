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
import { checkThresholdsAndSendAlert } from '..'
import { getContext } from '../../../context'
import events from '../../../events'
import type { Probe } from '../../../interfaces/probe'
import type { ProbeRequestResponse } from '../../../interfaces/request'
import validateResponse from '../../../plugins/validate-response'
import { getEventEmitter } from '../../../utils/events'
import { log } from '../../../utils/pino'
import { isSymonModeFrom } from '../../config'
import { RequestLog } from '../../logger'
import { processThresholds } from '../../notification/process-server-status'

export type ProbeResult = {
  isAlertTriggered: boolean
  logMessage: string
  requestResponse: ProbeRequestResponse
}

type RespProsessingParams = {
  index: number
  probeResults: ProbeResult[]
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
    for (const index of probeResults.keys()) {
      this.responseProcessing({
        index,
        probeResults,
      })
    }
  }

  private responseProcessing({
    index,
    probeResults,
  }: RespProsessingParams): void {
    const {
      isAlertTriggered,
      logMessage,
      requestResponse: probeResult,
    } = probeResults[index]
    const { flags } = getContext()
    const isSymonMode = isSymonModeFrom(flags)
    const eventEmitter = getEventEmitter()
    const isVerbose = isSymonMode || flags['keep-verbose-logs']
    const { alerts } = this.probeConfig
    const validatedResponse = validateResponse(
      alerts || [
        {
          assertion: 'response.status < 200 or response.status > 299',
          message: 'probe cannot be accessed',
        },
      ],
      probeResult
    )
    const requestLog = new RequestLog(this.probeConfig, index, 0)
    const statuses = processThresholds({
      probe: this.probeConfig,
      requestIndex: index,
      validatedResponse,
    })

    eventEmitter.emit(events.probe.response.received, {
      probe: this.probeConfig,
      requestIndex: index,
      response: probeResult,
    })
    isAlertTriggered ? log.warn(logMessage) : log.info(logMessage)
    requestLog.addAlerts(
      validatedResponse
        .filter((item) => item.isAlertTriggered)
        .map((item) => item.alert)
    )
    requestLog.setResponse(probeResult)
    // Done processing results, check if need to send out alerts
    checkThresholdsAndSendAlert(
      {
        probe: this.probeConfig,
        statuses,
        notifications: this.notifications,
        requestIndex: index,
        validatedResponseStatuses: validatedResponse,
      },
      requestLog
    )

    if (isVerbose || requestLog.hasIncidentOrRecovery) {
      requestLog.saveToDatabase().catch((error) => log.error(error.message))
    }
  }
}
