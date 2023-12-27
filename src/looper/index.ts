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
import { v4 as uuid } from 'uuid'

import type { Probe, ProbeAlert } from '../interfaces/probe'

import { getProbes } from '../components/config/probe'
import { doProbe } from '../components/probe'
import { getContext } from '../context'
import { log } from '../utils/pino'
import {
  getProbeContext,
  getProbeState,
  initializeProbeStates,
} from '../utils/probe-state'
import { getPublicIp, isConnectedToSTUNServer } from '../utils/public-ip'
import {
  DEFAULT_INCIDENT_THRESHOLD,
  DEFAULT_RECOVERY_THRESHOLD,
} from '../components/config/validation/validator/default-values'

let checkSTUNinterval: NodeJS.Timeout

const DISABLE_STUN = -1 // -1 is disable stun checking

export function sanitizeProbe(isSymonMode: boolean, probe: Probe): Probe {
  const { id, name, requests, incidentThreshold, recoveryThreshold, alerts } =
    probe

  if (!name) {
    log.warn(
      `Warning: Probe ${id} has no name defined. Using the default name started by Monika`
    )
  }

  const isHTTPProbe = Boolean(requests)
  const isAlertsEmpty = alerts === undefined || alerts.length === 0
  if (!isSymonMode && isHTTPProbe && isAlertsEmpty) {
    log.warn(
      `Warning: Probe ${id} has no Alerts configuration defined. Using the default response.status != 200 and response.time > 2000`
    )
  }

  return {
    ...probe,
    incidentThreshold: incidentThreshold || DEFAULT_INCIDENT_THRESHOLD,
    recoveryThreshold: recoveryThreshold || DEFAULT_RECOVERY_THRESHOLD,
    alerts: isSymonMode ? [] : addFailedRequestAssertions(alerts),
  }
}

export const FAILED_REQUEST_ASSERTION = {
  assertion: '',
  message: 'Probe not accessible',
}

function addFailedRequestAssertions(assertions: ProbeAlert[]) {
  return [
    ...assertions,
    {
      id: uuid(),
      ...FAILED_REQUEST_ASSERTION,
    },
  ]
}

export async function loopCheckSTUNServer(interval: number): Promise<unknown> {
  // if stun is disabled, no need to create interval
  if (interval === -1) return

  // if interval = 0 get ip once and exit. No need to setup interval.
  if (interval === 0 || process.env.CI || process.env.NODE_ENV === 'test') {
    await getPublicIp()
    return
  }

  checkSTUNinterval = setInterval(async () => {
    await getPublicIp()
  }, interval * 1000)

  return checkSTUNinterval
}

type StartProbingArgs = {
  notifications: Notification[]
  probes: Probe[]
  signal: AbortSignal
}

export function startProbing({
  notifications,
  probes,
  signal,
}: StartProbingArgs): void {
  initializeProbeStates(probes)

  const probeInterval = setInterval(() => {
    if (signal.aborted) {
      clearInterval(probeInterval)
      return
    }

    if (isEndOfRepeat(getProbes())) {
      // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
      process.exit(0)
    }

    if (!isStunOK()) {
      return
    }

    for (const probe of getProbes()) {
      doProbe({
        notifications,
        probe,
        signal,
      })
    }
  }, 1000)
}

function isEndOfRepeat(probes: Probe[]) {
  const isAllProbeFinished = probes.every(
    ({ id }) => isLastCycleOf(id) && getProbeState(id) !== 'running'
  )

  return getContext().flags.repeat && isAllProbeFinished
}

function isStunOK() {
  return getContext().flags.stun === DISABLE_STUN || isConnectedToSTUNServer
}

function isLastCycleOf(probeID: string) {
  const probeCtx = getProbeContext(probeID)
  if (!probeCtx) {
    return true
  }

  return getContext().flags.repeat === probeCtx.cycle
}
