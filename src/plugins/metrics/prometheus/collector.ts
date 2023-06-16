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
import type { ProbeRequestResponse } from '../../../interfaces/request'

type PrometheusCustomCollector = {
  statusCode: Gauge<'id' | 'name' | 'url' | 'method'>
  responseTime: Histogram<'id' | 'name' | 'url' | 'method' | 'statusCode'>
  responseSize: Gauge<'id' | 'name' | 'url' | 'method' | 'statusCode'>
  alertTriggeredTotal: Counter<'id' | 'name' | 'url' | 'method' | 'alertQuery'>
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
    const statusCode = new Gauge({
      name: 'monika_request_status_code_info',
      help: 'HTTP status code',
      labelNames: ['id', 'name', 'url', 'method'] as const,
    })
    const responseTime = new Histogram({
      name: 'monika_request_response_time_seconds',
      help: 'Duration of probe request in seconds',
      labelNames: ['id', 'name', 'url', 'method', 'statusCode'] as const,
    })
    const responseSize = new Gauge({
      name: 'monika_request_response_size_bytes',
      help: 'Size of response size in bytes',
      labelNames: ['id', 'name', 'url', 'method', 'statusCode'] as const,
    })
    const alertTriggeredTotal = new Counter({
      name: 'monika_alert_total',
      help: 'Total alert triggered',
      labelNames: ['id', 'name', 'url', 'method', 'alertQuery'] as const,
    })
    const probesTotal = new Gauge({
      name: 'monika_probes_total',
      help: 'Total of all probe',
    })

    // register and collect default Node.js metrics
    collectDefaultMetrics({ register })

    prometheusCustomCollector = {
      statusCode,
      responseTime,
      responseSize,
      alertTriggeredTotal,
      probesTotal,
    }
  }

  collectProbeTotal(total: number): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    prometheusCustomCollector.probesTotal.set(total)
  }

  collectProbeRequestMetrics(probeResult: ProbeResult): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    const { probe, requestIndex, response } = probeResult
    const { id, name, requests } = probe
    const request = requests[requestIndex]
    const { method, url } = request
    const { headers, responseTime, status } = response
    const milliSecond = 1000
    const responseTimeInSecond = responseTime / milliSecond ?? 0
    const responseSizeBytes = Number(headers['content-length'])
    const labels = {
      id,
      name,
      url,
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
    responseSize
      ?.labels(labels)
      .set(Number.isNaN(responseSizeBytes) ? 0 : responseSizeBytes)
  }

  collectTriggeredAlert(
    probeResult: Omit<ProbeResult, 'response'> & { alertQuery: string }
  ): void {
    if (!prometheusCustomCollector) {
      throw new Error('Prometheus collector is not registered')
    }

    const { alertQuery, probe, requestIndex } = probeResult
    const { id, name, requests } = probe
    const request = requests[requestIndex]
    const { method, url } = request
    const labels = {
      id,
      name,
      url,
      method: method ?? 'GET',
      alertQuery,
    }
    const { alertTriggeredTotal } = prometheusCustomCollector

    // collect metrics
    alertTriggeredTotal?.labels(labels).inc()
  }
}
