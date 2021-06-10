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

import { Config } from './interfaces/config'
import { Probe } from './interfaces/probe'
import { getLogsAndReport } from './components/reporter'
import { doProbe } from './components/probe'
import { log } from './utils/pino'
import { Notification } from './interfaces/notification'

const MILLISECONDS = 1000
const DEFAULT_THRESHOLD = 5
const DEFAULT_REPORT_INTERVAL = 180000 // 3 minutes

function sanitizeProbe(probe: Probe, id: string): Probe {
  const { name, incidentThreshold, recoveryThreshold, alerts } = probe
  probe.id = `${id}`

  if (!name) {
    probe.name = `monika_${probe.id}`
    log.warn(
      `Warning: Probe ${probe.id} has no name defined. Using the default name started by monika`
    )
  }
  if (!incidentThreshold) {
    probe.incidentThreshold = DEFAULT_THRESHOLD
    log.warn(
      `Warning: Probe ${probe.id} has no incidentThreshold configuration defined. Using the default threshold: 5`
    )
  }
  if (!recoveryThreshold) {
    probe.recoveryThreshold = DEFAULT_THRESHOLD
    log.warn(
      `Warning: Probe ${probe.id} has no recoveryThreshold configuration defined. Using the default threshold: 5`
    )
  }
  if ((alerts?.length ?? 0) === 0) {
    probe.alerts = ['status-not-2xx', 'response-time-greater-than-2-s']
    log.warn(
      `Warning: Probe ${probe.id} has no Alerts configuration defined. Using the default status-not-2xx and response-time-greater-than-2-s`
    )
  }

  return probe
}

/**
 * isIDValid checks the user input against existing probe ids in Config
 * @param {object} config is the probe configuration
 * @param {array} ids is array of user input string ids
 * @returns {bool} true if all ids found, false if any id is not found
 */
export function isIDValid(config: Config, ids: string): boolean {
  const idSplit = ids.split(',').map((item) => item.trim())

  for (const id of idSplit) {
    let isFound = false

    for (const probes of config.probes) {
      if (probes.id === id) {
        isFound = true
        break
      }
    }
    if (!isFound) {
      log.info(`Error: id not found: ${id}`)
      return false // ran through the probes and didn't find id
    }
  }

  return true
}

/**
 * loopProbes fires off the probe requests after every x interval, and handles repeats.
 * This function receives the probe id from idFeeder.
 * @param {object} probe is the target to request
 * @param {object} notifications is the array of channels to notify the user if probes does not work
 * @param {number} repeats handle controls test interaction/repetition
 * @returns {function} func with isAborted true if interrupted
 */
function loopProbe(
  probe: Probe,
  notifications: Notification[],
  repeats: number
) {
  let counter = 0

  const probeInterval = setInterval(() => {
    if (counter === repeats) {
      clearInterval(probeInterval)
    } else {
      doProbe(++counter, probe, notifications)
    }
  }, (probe.interval ?? 10) * MILLISECONDS)

  if (process.env.CI || process.env.NODE_ENV === 'test') {
    clearInterval(probeInterval)
  }

  return probeInterval
}

/**
 * idFeeder feeds Prober with actual ids to process
 * @param {object} config is an object that contains all the configs
 * @param {number} repeats number of repeats
 * @param {object} ids of address
 * @returns {function} abort function
 */
export function idFeeder(
  config: Config,
  repeats: number,
  ids: string | undefined
) {
  // default sequence for Each element
  let probesToRun = config.probes
  if (ids) {
    if (!isIDValid(config, ids)) {
      return
    }
    // doing custom sequences if list of ids is declared
    const idSplit = ids.split(',').map((item) => item.trim())
    probesToRun = config.probes.filter((probe) => idSplit.includes(probe.id))
  }

  const intervals: Array<NodeJS.Timeout> = []

  for (const probe of probesToRun) {
    const sanitizedProbe = sanitizeProbe(probe, probe.id)
    const interval = loopProbe(
      sanitizedProbe,
      config.notifications ?? [],
      repeats ?? 0
    )
    intervals.push(interval)
  }

  const abort = () => {
    intervals.forEach((i) => clearInterval(i))
  }

  return abort
}

export function loopReport(getConfig: () => Config) {
  const { symon } = getConfig()

  if (symon) {
    const { interval = DEFAULT_REPORT_INTERVAL } = symon
    setInterval(getLogsAndReport, interval)
  }
}
