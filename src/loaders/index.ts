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

import type { Config } from '@oclif/core'
import { isSymonModeFrom } from '../components/config/index.js'
import { watchConfigChanges } from '../components/config/watcher.js'
import { openLogfile } from '../components/logger/history.js'
import { getContext } from '../context/index.js'
import events from '../events/index.js'
import type { MonikaFlags } from '../flag.js'
import { tlsChecker } from '../jobs/tls-check.js'
import type { Probe } from '../interfaces/probe.js'
import { loopCheckSTUNServer } from '../looper/index.js'
import {
  PrometheusCollector,
  startPrometheusMetricsServer,
} from '../plugins/metrics/prometheus/index.js'
import { getEventEmitter } from '../utils/events.js'
import { jobsLoader } from './jobs.js'
import { enableAutoUpdate } from '../plugins/updater/index.js'

// import the subscriber file to activate the event emitter subscribers
import '../events/subscribers/application.js'
import '../events/subscribers/probe.js'

export default async function init(
  flags: MonikaFlags,
  cliConfig: Config
): Promise<void> {
  await openLogfile()
  // check if connected to STUN Server and getting the public IP in the same time
  await loopCheckSTUNServer(flags.stun)
  // run auto-updater
  if (flags['auto-update']) {
    await enableAutoUpdate(cliConfig, flags['auto-update'])
  }

  // start Promotheus server
  if (flags.prometheus) {
    initPrometheus(flags.prometheus)
  }

  if (!isSymonModeFrom(flags)) {
    watchConfigChanges()
    // check TLS when Monika starts
    tlsChecker()

    if (!getContext().isTest) {
      // load cron jobs
      jobsLoader()
    }
  }
}

function initPrometheus(prometheusPort: number) {
  const eventEmitter = getEventEmitter()
  const {
    collectProbeTotal,
    collectProbeRequestMetrics,
    collectTriggeredAlert,
    decrementProbeRunningTotal,
    incrementProbeRunningTotal,
    resetProbeRunningTotal,
    collectProbeStatus,
    collectNotificationSentMetrics,
  } = new PrometheusCollector()

  // collect prometheus metrics
  eventEmitter.on(events.config.sanitized, (probes: Probe[]) => {
    collectProbeTotal(probes.length)
  })
  eventEmitter.on(events.probe.response.received, collectProbeRequestMetrics)
  eventEmitter.on(events.probe.alert.triggered, collectTriggeredAlert)
  eventEmitter.on(events.probe.ran, incrementProbeRunningTotal)
  eventEmitter.on(events.probe.finished, decrementProbeRunningTotal)
  eventEmitter.on(events.config.updated, resetProbeRunningTotal)
  eventEmitter.on(events.probe.status.changed, collectProbeStatus)
  eventEmitter.on(events.notifications.sent, collectNotificationSentMetrics)

  startPrometheusMetricsServer(prometheusPort)
}
