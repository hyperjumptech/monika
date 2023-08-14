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

export { probeHTTP } from './http'

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
