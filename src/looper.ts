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
import { report } from './components/reporter'
import {
  getUnreportedLogs,
  setLogsAsReported,
} from './components/logger/history'
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
  const idSplit = ids.split(',')

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
 * @global {bool} isAborted is used to flag loop completion
 */
let isAborted = false
function loopProbes(
  probe: Probe,
  notifications: Notification[],
  repeats: number
) {
  let counter = 0
  const abort = () => {
    isAborted = true
  }

  const probeInterval = setInterval(() => {
    if (isAborted) {
      clearInterval(probeInterval)
    }

    if (counter === repeats) {
      clearInterval(probeInterval)
      return abort
    }
    return doProbe(++counter, probe, notifications)
  }, (probe.interval ?? 10) * MILLISECONDS)

  if (process.env.CI || process.env.NODE_ENV === 'test') {
    clearInterval(probeInterval)
  }

  return abort
}

/**
 * idFeeder feeds Prober with actual ids to process
 * @param {object} config is an object that contains all the configs
 * @param {number} repeats number of repeats
 * @param {object} ids of address
 * @returns {function} abort flag
 * global {bool} isAborted is cleared at the start and used to check exits from doLooper
 */
export function idFeeder(
  config: Config,
  repeats: number,
  ids: string | undefined
) {
  if (ids) {
    if (!isIDValid(config, ids)) {
      return
    }
  }
  isAborted = false

  const abort = () => {
    isAborted = true
  }

  // doing custom sequences?
  if (ids) {
    const idSplit = ids.split(',')

    for (const id of idSplit) {
      for (const probe of config.probes) {
        if (id === probe.id) {
          const sanitizedProbe = sanitizeProbe(probe, probe.id)
          /* eslint-disable max-depth */
          loopProbes(sanitizedProbe, config.notifications ?? [], repeats ?? 0)
          if (isAborted) {
            return abort
          }
        }
      }
    }
  } else {
    // or default sequence for Each element
    for (const probe of config.probes) {
      const sanitizedProbe = sanitizeProbe(probe, probe.id)
      loopProbes(sanitizedProbe, config.notifications ?? [], repeats ?? 0)
      if (isAborted) {
        return abort
      }
    }
  }
  return abort
}

export function loopReport(getConfig: () => Config) {
  const config = getConfig()

  const { monikaHQ } = config

  if (monikaHQ) {
    const {
      url,
      key,
      id: instanceId,
      interval = DEFAULT_REPORT_INTERVAL,
    } = monikaHQ

    setInterval(async () => {
      const { version } = getConfig()

      try {
        const unreportedLogs = await getUnreportedLogs()
        // convert null value to undefined, so axios won't send it
        const reportData = unreportedLogs.map((row) => ({
          timestamp: new Date(row.created_at).valueOf(),
          probe_id: row.probe_id,
          request_method: row.request_method,
          request_url: row.request_url,
          request_header: row.request_header || undefined,
          request_body: row.request_body || undefined,
          response_status: row.response_status,
          response_header: row.response_header || undefined,
          response_body: row.response_body || undefined,
          response_time: row.response_time,
          response_size: row.response_size || undefined,
        }))

        await report({
          url,
          key,
          instanceId,
          configVersion: version || '',
          data: reportData,
        })

        await setLogsAsReported(unreportedLogs.map((log) => log.id))
      } catch (error) {
        log.warn(
          " ›   Warning: Can't report history to Symon. " + error.message
        )
      }
    }, interval)
  }
}
