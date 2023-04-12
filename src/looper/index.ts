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

import { doProbe } from '../components/probe'
import { getContext } from '../context'
import type { Notification } from '../../packages/notification'
import { Probe } from '../interfaces/probe'
import { log } from '../utils/pino'
import {
  getProbeContext,
  getProbeState,
  initializeProbeStates,
} from '../utils/probe-state'
import { getPublicIp, isConnectedToSTUNServer } from '../utils/public-ip'

export const DEFAULT_THRESHOLD = 5
let isPaused = false
let checkSTUNinterval: NodeJS.Timeout

const DISABLE_STUN = -1 // -1 is disable stun checking

/**
 * sanitizeProbe sanitize currently mapped probe name, alerts, and threshold
 * @param {boolean} isSymonMode is running in Symon mode
 * @param {object} probe is the probe configuration
 * @returns {object} as probe
 */
export function sanitizeProbe(isSymonMode: boolean, probe: Probe): Probe {
  const { id, name, requests, incidentThreshold, recoveryThreshold, alerts } =
    probe
  probe.alerts = alerts?.map((alert) => {
    if (alert.query) {
      return { ...alert, assertion: alert.query }
    }

    return alert
  })

  probe.requests = requests?.map((request) => {
    if (!request.method) {
      return { ...request, method: 'GET' }
    }

    return {
      ...request,
      alerts: request.alerts?.map((alert) => {
        if (alert.query) {
          return { ...alert, assertion: alert.query }
        }

        return alert
      }),
    }
  })

  if (!name) {
    probe.name = `monika_${id}`
    log.warn(
      `Warning: Probe ${id} has no name defined. Using the default name started by monika`
    )
  }

  if (!incidentThreshold) {
    probe.incidentThreshold = DEFAULT_THRESHOLD
    log.warn(
      `Warning: Probe ${id} has no incidentThreshold configuration defined. Using the default threshold: 5`
    )
  }

  if (!recoveryThreshold) {
    probe.recoveryThreshold = DEFAULT_THRESHOLD
    log.warn(
      `Warning: Probe ${id} has no recoveryThreshold configuration defined. Using the default threshold: 5`
    )
  }

  if (alerts === undefined || alerts.length === 0) {
    probe.alerts = [
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
    log.warn(
      `Warning: Probe ${id} has no Alerts configuration defined. Using the default response.status != 200 and response.time > 20000`
    )
  }

  if (isSymonMode) {
    probe.alerts = []
  }

  return probe
}

export async function loopCheckSTUNServer(interval: number): Promise<any> {
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

/**
 * setPauseProbeInterval pause probing process
 * @param {boolean} pause for pausing probes
 * @returns void
 */
export function setPauseProbeInterval(pause: boolean): void {
  isPaused = pause

  if (pause) log.info('Probing is paused')
}

type StartProbingArgs = {
  probes: Probe[]
  notifications: Notification[]
}

export function startProbing({
  probes,
  notifications,
}: StartProbingArgs): () => void {
  const flags = getContext().flags
  const repeat = flags.repeat

  initializeProbeStates(probes)

  const probeInterval = setInterval(() => {
    if (repeat) {
      const finishedProbe = probes.every((probe) => {
        const context = getProbeContext(probe.id)

        return context.cycle === repeat && getProbeState(probe.id) === 'idle'
      })

      if (finishedProbe) {
        // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
        process.exit(0)
      }
    }

    if ((isConnectedToSTUNServer && !isPaused) || flags.stun === DISABLE_STUN) {
      for (const probe of probes) {
        const probeState = getProbeState(probe.id)
        const context = getProbeContext(probe.id)
        const diff = differenceInSeconds(new Date(), context.lastFinish)

        if (probeState === 'idle' && diff >= probe.interval) {
          if (repeat && context.cycle === repeat) {
            continue
          }

          doProbe({
            checkOrder: context.cycle,
            probe,
            notifications,
          })
        }
      }
    }
  }, 1000)

  return () => clearInterval(probeInterval)
}
