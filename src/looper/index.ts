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

import { doProbe } from '../components/probe'
import { getContext } from '../context'
import type { Notification } from '@hyperjumptech/monika-notification'
import type { Probe } from '../interfaces/probe'
import {
  getProbeContext,
  getProbeState,
  initializeProbeStates,
} from '../utils/probe-state'
import { getPublicIp, isConnectedToSTUNServer } from '../utils/public-ip'

export const DEFAULT_THRESHOLD = 5
let checkSTUNinterval: NodeJS.Timeout

const DISABLE_STUN = -1 // -1 is disable stun checking

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

type StartProbingArgs = {
  signal: AbortSignal
  probes: Probe[]
  notifications: Notification[]
}

export function startProbing({
  signal,
  probes,
  notifications,
}: StartProbingArgs): void {
  initializeProbeStates(probes)

  const probeInterval = setInterval(() => {
    if (signal?.aborted) {
      clearInterval(probeInterval)
      return
    }

    if (isEndOfRepeat(probes)) {
      // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
      process.exit(0)
    }

    if (!isStunOK()) {
      return
    }

    for (const probe of probes) {
      doProbe({
        probe,
        notifications,
      })
    }
  }, 1000)
}

function isEndOfRepeat(probes: Probe[]) {
  const isAllProbeFinished = probes.every(({ id }) => {
    return isLastCycleOf(id) && getProbeState(id) !== 'running'
  })

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
