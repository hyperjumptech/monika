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

import Bree from 'bree'
import events from '.'
import { convertToBreeJobs } from '../components/probe/convert-to-bree'
import type { Probe } from '../interfaces/probe'
import { getEventEmitter } from '../utils/events'
import { log } from '../utils/pino'

const eventEmitter = getEventEmitter()

function workerMessageHandler(workerData: any) {
  const { probe, probeResult } = workerData.message
  // TODO:
  // 1. Store data to the database, and alert checker to parent?
  // 2. Rebuild and restart the jobs when Monika config change
  // 3. Reimplement --repeat flag?

  probeResult.forEach((response: any, requestIndex: number) => {
    eventEmitter.emit(events.probe.response.received, {
      probe,
      requestIndex,
      response,
    })
  })

  log.info('parent receives data from worker')
  log.info(JSON.stringify(probeResult, null, 2))
}

eventEmitter.on(events.config.sanitized, (probes: Probe[]) => {
  const root = false
  const jobs = convertToBreeJobs(probes)
  const bree = new Bree({ root, jobs, workerMessageHandler })

  bree.start()
})
