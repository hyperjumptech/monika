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

import { getConfig, setupConfig } from '../components/config'
import { openLogfile } from '../components/logger/history'
import events from '../events'
import { loopCheckSTUNServer, loopReport } from '../looper'
import {
  PrometheusCollector,
  startPrometheusMetricsServer,
} from '../plugins/metrics/prometheus'
import { getEventEmitter } from '../utils/events'
import { getPublicNetworkInfo } from '../utils/public-ip'
// import to activate all the application event emitter subscribers
import '../events/subscribers/application'

export default async function init(flags: any) {
  const eventEmitter = getEventEmitter()
  const isTestEnvironment = process.env.CI || process.env.NODE_ENV === 'test'

  await openLogfile()

  // the logs and flush flag only needs to load openLogfile
  if (flags.logs || flags.flush) {
    return
  }

  // cache location & ISP info
  await getPublicNetworkInfo()
  // check if connected to STUN Server and getting the public IP in the same time
  loopCheckSTUNServer(flags.stun)

  // start Promotheus server
  if (flags.prometheus) {
    const {
      registerCollectorFromProbes,
      collectProbeRequestMetrics,
    } = new PrometheusCollector()

    // register prometheus metric collectors
    eventEmitter.on(events.config.sanitized, registerCollectorFromProbes)
    // collect prometheus metrics
    eventEmitter.on(events.probe.response.received, collectProbeRequestMetrics)

    startPrometheusMetricsServer(flags.prometheus)
  }

  await setupConfig(flags)

  // Run report on interval if symon configuration exists
  if (!isTestEnvironment) {
    loopReport(getConfig)
  }
}
