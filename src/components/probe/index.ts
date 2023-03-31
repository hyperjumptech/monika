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

import { getContext } from '../../context'
import events from '../../events'
import type { Notification } from '../notification/channel'
import { Probe } from '../../interfaces/probe'
import { ServerAlertState } from '../../interfaces/probe-status'
import { ProbeRequestResponse } from '../../interfaces/request'
import validateResponse, {
  ValidatedResponse,
} from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import { setProbeFinish, setProbeRunning } from '../../utils/probe-state'
import { RequestLog } from '../logger'
import { sendAlerts } from '../notification'
import { processThresholds } from '../notification/process-server-status'
import {
  type ProbeResult,
  probeHTTP,
  probeMariaDB,
  probeMongo,
  probePostgres,
  probeRedis,
  probeSocket,
} from './prober'

interface ProbeStatusProcessed {
  probe: Probe
  statuses?: ServerAlertState[]
  notifications: Notification[]
  validatedResponseStatuses: ValidatedResponse[]
  requestIndex: number
}

interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  probeState?: ServerAlertState
}

const probeSendNotification = async (data: ProbeSendNotification) => {
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

// Probes Thresholds processed, Send out notifications/alerts.
export function checkThresholdsAndSendAlert(
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

  const probeStatesWithValidAlert = getProbeStatesWithValidAlert(statuses || [])

  for (const [index, probeState] of probeStatesWithValidAlert.entries()) {
    const { alertQuery, state } = probeState

    probeSendNotification({
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

export function getProbeStatesWithValidAlert(
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

type respProsessingParams = {
  probe: Probe // the actual probe that got this response
  probeResult: ProbeRequestResponse // actual response from the probe
  notifications: Notification[] // notifications contains all the notifications
  logMessage: string // message from the probe to display
  isAlertTriggered: boolean // flag, should alert be triggered?
  index: number
}
/**
 * responseProcessing determines if the last probe response warrants an alert
 * creates the console log
 * @param {object} param is response Processing type
 * @returns void
 */
function responseProcessing({
  probe,
  probeResult,
  notifications,
  logMessage,
  isAlertTriggered,
  index,
}: respProsessingParams): void {
  const { flags } = getContext()
  const isSymonMode = Boolean(flags.symonUrl) && Boolean(flags.symonKey)
  const eventEmitter = getEventEmitter()
  const isVerbose = isSymonMode || flags['keep-verbose-logs']
  const { alerts } = probe
  const validatedResponse = validateResponse(
    alerts || [
      {
        assertion: 'response.status < 200 or response.status > 299',
        message: 'probe cannot be accessed',
      },
    ],
    probeResult
  )
  const requestLog = new RequestLog(probe, index, 0)
  const statuses = processThresholds({
    probe,
    requestIndex: index,
    validatedResponse,
  })

  eventEmitter.emit(events.probe.response.received, {
    probe,
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
      probe,
      statuses,
      notifications,
      requestIndex: index,
      validatedResponseStatuses: validatedResponse,
    },
    requestLog
  )
  requestLog.print()

  if (isVerbose || requestLog.hasIncidentOrRecovery) {
    requestLog.saveToDatabase().catch((error) => log.error(error.message))
  }
}

type doProbeParams = {
  checkOrder: number // the order of probe being processed
  probe: Probe // probe contains all the probes
  notifications: Notification[] // notifications contains all the notifications
}
/**
 * doProbe sends out the http request
 * @param {object} doProbeParams doProbe parameter
 * @returns {Promise<void>} void
 */
export async function doProbe({
  checkOrder,
  probe,
  notifications,
}: doProbeParams): Promise<void> {
  const randomTimeoutMilliseconds = getRandomTimeoutMilliseconds()

  setProbeRunning(probe.id)

  setTimeout(async () => {
    await probeNonHTTP(probe, checkOrder, notifications)
    await probeHTTP(probe, checkOrder, notifications)

    setProbeFinish(probe.id)
  }, randomTimeoutMilliseconds)
}

function processProbeResults(
  probeResults: ProbeResult[],
  probe: Probe,
  notifications: Notification[]
): void {
  for (const index of probeResults.keys()) {
    const { isAlertTriggered, logMessage, requestResponse } =
      probeResults[index]

    responseProcessing({
      probe,
      probeResult: requestResponse,
      notifications,
      logMessage,
      isAlertTriggered,
      index,
    })
  }
}

function getRandomTimeoutMilliseconds(): number {
  return [1000, 2000, 3000].sort(() => {
    return Math.random() - 0.5
  })[0]
}

async function probeNonHTTP(
  probe: Probe,
  checkOrder: number,
  notifications: Notification[]
) {
  if (probe?.mongo) {
    const probeResults = await probeMongo({
      id: probe.id,
      checkOrder,
      mongo: probe.mongo,
    })

    processProbeResults(probeResults, probe, notifications)
  }

  if (probe?.mariadb || probe?.mysql) {
    const probeResults = await probeMariaDB({
      id: probe.id,
      checkOrder,
      mysql: probe?.mysql,
      mariaDB: probe?.mariadb,
    })

    processProbeResults(probeResults, probe, notifications)
  }

  if (probe?.postgres) {
    const probeResults = await probePostgres({
      id: probe.id,
      checkOrder,
      postgres: probe.postgres,
    })

    processProbeResults(probeResults, probe, notifications)
  }

  if (probe?.redis) {
    const probeResults = await probeRedis({
      id: probe.id,
      checkOrder,
      redis: probe.redis,
    })

    processProbeResults(probeResults, probe, notifications)
  }

  if (probe?.socket) {
    const probeResults = await probeSocket({
      id: probe.id,
      checkOrder,
      socket: probe.socket,
    })

    processProbeResults(probeResults, probe, notifications)
  }
}
