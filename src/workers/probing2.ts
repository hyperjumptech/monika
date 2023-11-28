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
import type { Notification } from '@hyperjumptech/monika-notification'
import type { Probe } from '../interfaces/probe'
import { createProbers } from '../components/probe/prober/factory'
import {
  DEFAULT_INCIDENT_THRESHOLD,
  DEFAULT_RECOVERY_THRESHOLD,
} from '../components/config/validation/validator/default-values'

type DoProbeParams = {
  probe: Probe
  notifications: Notification[]
  cycle: number
  retryInitialDelayMs: number
  retryMaxDelayMs: number
}

const doProbe = async ({
  notifications,
  probe,
  cycle,
  retryInitialDelayMs,
  retryMaxDelayMs,
}: DoProbeParams) => {
  const probers = createProbers({
    counter: cycle,
    notifications,
    probeConfig: probe,
  })

  const maxAttempts = Math.max(
    // since we will retry for both incident and recovery, let's just get the biggest threshold
    probe.incidentThreshold || DEFAULT_INCIDENT_THRESHOLD,
    probe.recoveryThreshold || DEFAULT_RECOVERY_THRESHOLD
  )

  await retry(handleAll, {
    maxAttempts,
    backoff: new ExponentialBackoff({
      initialDelay: retryInitialDelayMs,
      maxDelay: retryMaxDelayMs,
    }),
  }).execute(({ attempt }) =>
    Promise.all(probers.map(async (prober) => prober.probe(attempt)))
  )
}

export default doProbe
