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

import { ExponentialBackoff, retry, handleAll } from 'cockatiel'
import { differenceInSeconds } from 'date-fns'
import { getContext } from '../../context'
import type { Notification } from '@hyperjumptech/monika-notification'
import type { Probe } from '../../interfaces/probe'
import {
  getProbeContext,
  getProbeState,
  setProbeFinish,
  setProbeRunning,
} from '../../utils/probe-state'
import { createProbers } from './prober/factory'

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

    const probers = createProbers({
      counter: probeCtx.cycle,
      notifications,
      probeConfig: probe,
    })

    const retryPolicy = retry(handleAll, {
      backoff: new ExponentialBackoff({ maxDelay: probe.interval }),
    })

    await retryPolicy.execute(() =>
      Promise.all(
        probers.map(async (prober) => {
          await prober.probe()
        })
      )
    )

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
