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

import {
  Gauge,
  register,
  collectDefaultMetrics,
  Histogram,
  Counter,
} from 'prom-client'
import type { Probe } from '../../../interfaces/probe'
import { probeRequestResult } from '../../../interfaces/request'
import type { ProbeRequestResponse } from '../../../interfaces/request'

type PrometheusCustomCollector = {
  statusCode: Gauge<'id' | 'name' | 'url' | 'method'>
  responseTime: Histogram<
    'id' | 'name' | 'url' | 'method' | 'statusCode' | 'result'
  >
  responseSize: Gauge<
    'id' | 'name' | 'url' | 'method' | 'statusCode' | 'result'
  >
  alertsTriggered: Counter<'id' | 'name' | 'url' | 'method' | 'alertQuery'>
  alertsTriggeredTotal: Counter<string>
  probesStatus: Gauge<'id' | 'name' | 'url' | 'method'>
  probesRunningTotal: Gauge<'id'>
  probesRunning: Gauge<string>
  probesTotal: Gauge<string>
}

type ProbeResult = {
  probe: Probe
  requestIndex: number
  response: ProbeRequestResponse
}

let prometheusCustomCollector: PrometheusCustomCollector

export class PrometheusCollector {
  constructor() {
    // remove all registered metrics
    register.clear()

    // register metric collector
    const alertsTriggered = new Counter({
      name: 'monika_alerts_triggered',
      help: 'Indicates the count of alerts triggered by a probe',
      labelNames: ['id', 'name', 'url', 'method', 'alertQuery'] as const,
    })
    const alertsTriggeredTotal = new Counter({
      name: 'monika_alerts_triggered_total',
      help: 'Indicates the count of total alert triggered of all probes',
    })
    const probesRunning = new Gauge({
      name: 'monika_probes_running',
      help: 'Indicates whether a Monika probe is actively running checks (1 = RUNNING) or idle (0 = IDLE).',
      labelNames: ['id'] as const,
    })
    const probesRunningTotal = new Gauge({
      name: 'monika_probes_running_total',
      help: 'Indicates the total count of probes that are currently running checks',
    })
    const probesStatus = new Gauge({
      name: 'monika_probes_status',
      help: 'Indicates the current status of the probe: 0 = DOWN (unreachable), 1 = UP (reachable).',
      labelNames: ['id', 'name', 'url', 'method'] as const,
    })
    const probesTotal = new Gauge({
      name: 'monika_probes_total',
      help: 'Total count of all probes configured',
    })
    const responseSize = new Gauge({
      name: 'monika_request_response_size_bytes',
      help: "Indicates the size of probe request's response size in bytes",
      labelNames: [
        'id',
        'name',
        'url',
        'method',
        'statusCode',
        'result',
      ] as const,
    })
    const responseTime = new Histogram({
      name: 'monika_request_response_time_seconds',
      help: 'Indicates the duration of the probe request in seconds',
      labelNames: [
        'id',
        'name',
        'url',
        'method',
        'statusCode',
        'result',
      ] as const,
    })
    const statusCode = new Gauge({
      name: 'monika_request_status_code_info',
      help: 'Indicates the HTTP status code of the probe request',
      labelNames: ['id', 'name', 'url', 'method'] as const,
    })

    // register and collect default Node.js metrics
    collectDefaultMetrics({ register })

    prometheusCustomCollector = {
      alertsTriggered,
      alertsTriggeredTotal,
      probesRunningTotal,
      probesRunning,
      probesStatus,
      probesTotal,
      responseSize,
      responseTime,
      statusCode,
    }
  }

  collectProbeRequestMetrics(probeResult: ProbeResult): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    const { probe, requestIndex, response } = probeResult
    const { id, name, requests } = probe

    if (!requests || requests.length === 0) {
      return
    }

    const request = requests[requestIndex]
    const { method, url } = request
    const { headers, responseTime, status } = response
    const result = response.result ?? probeRequestResult.unknown
    const milliSecond = 1000
    const responseTimeInSecond = responseTime / milliSecond || 0
    const responseSizeBytes =
      typeof headers === 'string'
        ? undefined
        : Number(headers['content-length'])
    const labels = {
      id,
      name,
      url,
      result,
      method: method ?? 'GET',
      statusCode: status,
    }
    const {
      statusCode,
      responseTime: resposeTimeCollector,
      responseSize,
    } = prometheusCustomCollector

    // collect metrics
    statusCode
      ?.labels({
        id,
        name,
        url,
        method: method ?? 'GET',
      })
      .set(status)
    resposeTimeCollector?.labels(labels).observe(responseTimeInSecond)
    responseSize?.labels(labels).set(responseSizeBytes || 0)
  }

  collectProbeStatus(
    probeResult: { status: 'up' | 'down' } & Omit<ProbeResult, 'response'>
  ): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    const { probe, requestIndex, status } = probeResult
    const { id, name, requests } = probe

    if (!requests || requests.length === 0) {
      return
    }

    const request = requests[requestIndex]
    const { method, url } = request
    const labels = {
      id,
      name,
      url,
      method: method ?? 'GET',
    }
    const { probesStatus } = prometheusCustomCollector

    // collect metrics
    probesStatus?.labels(labels).set(status === 'up' ? 1 : 0)
  }

  collectProbeTotal(total: number): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    prometheusCustomCollector.probesTotal.set(total)
  }

  collectTriggeredAlert(
    probeResult: { alertQuery: string } & Omit<ProbeResult, 'response'>
  ): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    const { alertQuery, probe, requestIndex } = probeResult
    const { id, name, requests } = probe

    if (!requests || requests.length === 0) {
      return
    }

    const request = requests[requestIndex]
    const { method, url } = request
    const labels = {
      id,
      name,
      url,
      method: method ?? 'GET',
      alertQuery,
    }
    const { alertsTriggered, alertsTriggeredTotal } = prometheusCustomCollector

    // collect metrics
    alertsTriggered?.labels(labels).inc()
    alertsTriggeredTotal?.inc()
  }

  decrementProbeRunningTotal(id: string) {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    prometheusCustomCollector.probesRunning.labels(id).dec()
    prometheusCustomCollector.probesRunningTotal.dec()
  }

  incrementProbeRunningTotal(id: string) {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    prometheusCustomCollector.probesRunning.labels(id).inc()
    prometheusCustomCollector.probesRunningTotal.inc()
  }

  resetProbeRunningTotal() {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    prometheusCustomCollector.probesRunning.reset()
    prometheusCustomCollector.probesRunningTotal.reset()
  }
}
