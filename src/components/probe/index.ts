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

import { differenceInSeconds } from 'date-fns'
import { getContext } from '../../context'
import events from '../../events'
import type { Notification } from '@hyperjumptech/monika-notification'
import { Probe } from '../../interfaces/probe'
import { ServerAlertState } from '../../interfaces/probe-status'
import type { ValidatedResponse } from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import {
  getProbeContext,
  getProbeState,
  setProbeFinish,
  setProbeRunning,
} from '../../utils/probe-state'
import { RequestLog } from '../logger'
import { sendAlerts } from '../notification'
import { probeHTTP } from './prober'
import { createProbers } from './prober/factory'

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

  console.log('probeSendNotification', JSON.stringify(notifications))
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

  console.log(
    'checkThresholdsAndSendAlert',
    JSON.stringify(probeStatesWithValidAlert)
  )
  for (const [index, probeState] of probeStatesWithValidAlert.entries()) {
    const { alertQuery, state } = probeState

    console.log('checkThresholdsAndSendAlert GOING TO probeSendNotification')
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

type doProbeParams = {
  probe: Probe // probe contains all the probes
  notifications: Notification[] // notifications contains all the notifications
}
/**
 * doProbe sends out the http request
 * @param {object} doProbeParams doProbe parameter
 * @returns {Promise<void>} void
 */
export async function doProbe({
  probe,
  notifications,
}: doProbeParams): Promise<void> {
  if (
    !isTimeToProbe(probe) ||
    isCycleEnd(probe.id) ||
    !setProbeRunning(probe.id)
  ) {
    return
  }

  setTimeout(async () => {
    const probeCtx = getProbeContext(probe.id)
    if (!probeCtx) {
      return
    }

    await probeNonHTTP(probe, probeCtx.cycle, notifications)
    await probeHTTP(probe, probeCtx.cycle, notifications)

    setProbeFinish(probe.id)
  }, getRandomTimeoutMilliseconds())
}

function isTimeToProbe({ id, interval }: Probe) {
  const probeCtx = getProbeContext(id)
  if (!probeCtx) {
    return false
  }

  const isIdle = getProbeState(id) === 'idle'
  const isInTime =
    differenceInSeconds(new Date(), probeCtx.lastFinish) >= interval

  return isIdle && isInTime
}

function isCycleEnd(probeID: string) {
  const probeCtx = getProbeContext(probeID)
  if (!probeCtx) {
    return true
  }

  return (
    getContext().flags.repeat && getContext().flags.repeat === probeCtx.cycle
  )
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
  const probers = createProbers({
    counter: checkOrder,
    notifications,
    probeConfig: probe,
  })

  await Promise.all(
    probers.map(async (prober) => {
      await prober.probe()
    })
  )
}
