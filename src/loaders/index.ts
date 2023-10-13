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

import type { Config as IConfig } from '@oclif/core'
import { isSymonModeFrom, setupConfig } from '../components/config'
import { setContext } from '../context'
import events from '../events'
import type { MonikaFlags } from '../context/monika-flags'
import { tlsChecker } from '../jobs/tls-check'
import type { Probe } from '../interfaces/probe'
import { loopCheckSTUNServer } from '../looper'
import {
  PrometheusCollector,
  startPrometheusMetricsServer,
} from '../plugins/metrics/prometheus'
import { getEventEmitter } from '../utils/events'
import { getPublicNetworkInfo } from '../utils/public-ip'
import { jobsLoader } from './jobs'
import { enableAutoUpdate } from '../plugins/updater'
import { log } from '../utils/pino'

// import the subscriber file to activate the event emitter subscribers
import '../events/subscribers/application'
import '../events/subscribers/probe'

export default async function init(
  flags: MonikaFlags,
  cliConfig: IConfig
): Promise<void> {
  const eventEmitter = getEventEmitter()
  const isTestEnvironment = process.env.CI || process.env.NODE_ENV === 'test'
  const isSymonMode = isSymonModeFrom(flags)

  setContext({ userAgent: cliConfig.userAgent })

  if (flags.verbose || isSymonMode) {
    // cache location & ISP info
    getPublicNetworkInfo()
      .then(({ city, hostname, isp, privateIp, publicIp }) => {
        log.info(
          `Monika is running from: ${city} - ${isp} (${publicIp}) - ${hostname} (${privateIp})`
        )
      })
      .catch((error) =>
        log.warn(`Failed to obtain location/ISP info. Got: ${error}`)
      )
  } else {
    // if note verbose, remove location details
    ;`Monika is running from: City - isp (y.y.y.y) - localhost (x.x.x.x)`
  }

  // check if connected to STUN Server and getting the public IP in the same time
  loopCheckSTUNServer(flags.stun)
  // run auto-updater
  if (flags['auto-update']) {
    await enableAutoUpdate(cliConfig, flags['auto-update'])
  }

  // start Promotheus server
  if (flags.prometheus) {
    const {
      collectProbeTotal,
      collectProbeRequestMetrics,
      collectTriggeredAlert,
    } = new PrometheusCollector()

    // collect prometheus metrics
    eventEmitter.on(events.config.sanitized, (probes: Probe[]) => {
      collectProbeTotal(probes.length)
    })
    eventEmitter.on(events.probe.response.received, collectProbeRequestMetrics)
    eventEmitter.on(events.probe.alert.triggered, collectTriggeredAlert)

    startPrometheusMetricsServer(flags.prometheus)
  }

  if (!isSymonMode) {
    await setupConfig(flags)

    // check TLS when Monika starts
    tlsChecker()

    if (!isTestEnvironment) {
      // load cron jobs
      jobsLoader()
    }
  }
}
