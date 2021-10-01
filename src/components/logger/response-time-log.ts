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

import { differenceInHours } from 'date-fns'
import { ProbeRequestResponse } from '../../interfaces/request'

// global variable
// we can say it is safe to use global variable here since the probe is processed sequentially as mentioned in probe/index.ts line 143: intentionally wait for a request to finish before processing next request in loop
let startTime24HourCycle = new Date()
let responseCount = 0
let totalResponseTime = 0
export let maxResponseTime = 0
export let minResponseTime = 0
export let averageResponseTime = 0

export function getLogLifeTimeInHour() {
  const now = new Date()
  const diff = differenceInHours(now, startTime24HourCycle)
  return diff || 1
}

export function resetlogs() {
  startTime24HourCycle = new Date()
  responseCount = 0
  totalResponseTime = 0
  maxResponseTime = 0
  minResponseTime = 0
  averageResponseTime = 0
}

export function checkIs24HourHasPassed() {
  const now = new Date()
  const diffInHours = differenceInHours(now, startTime24HourCycle)
  if (diffInHours > 24) {
    return true
  }

  return false
}

export function logResponseTime(probeRes: ProbeRequestResponse) {
  responseCount += 1

  if (responseCount === 1) {
    // first time
    maxResponseTime = probeRes.responseTime
    minResponseTime = probeRes.responseTime
  } else if (probeRes.responseTime > maxResponseTime) {
    maxResponseTime = probeRes.responseTime
  } else if (probeRes.responseTime < minResponseTime) {
    minResponseTime = probeRes.responseTime
  }

  totalResponseTime += probeRes.responseTime
  averageResponseTime = Math.floor(totalResponseTime / responseCount)
}
