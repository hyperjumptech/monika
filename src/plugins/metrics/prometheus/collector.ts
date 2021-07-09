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

import { RequestConfig } from '../../../interfaces/request'
import { Gauge, register } from 'prom-client'
import { snakeCase } from 'snake-case'
import { Probe } from '../../../interfaces/probe'

type requestMetricCollector = {
  probeID: string
  requestIndex: number
  httpStatusCodeGauge: Gauge<string>
  responseTimeGauge: Gauge<'url' | 'method' | 'statusCode'>
  responseSizeGauge: Gauge<'url' | 'method' | 'statusCode'>
}

export class PrometheusCollector {
  private requestMetricCollectors: requestMetricCollector[] = []

  registerCollectorFromProbes(probes: Probe[]) {
    // remove all registered metrics
    register.clear()
    this.requestMetricCollectors = []

    probes.forEach((probe) => {
      const { id, requests } = probe

      requests?.forEach((_: RequestConfig, requestIndex: number) => {
        const metricNamePrefix = `monika_${snakeCase(
          id
        )}_request_${requestIndex}`
        const httpStatusCodeGauge = new Gauge({
          name: `${metricNamePrefix}_status_code_info`,
          help: `${metricNamePrefix}: HTTP status code`,
        })
        const responseTimeGauge = new Gauge({
          name: `${metricNamePrefix}_response_time_seconds`,
          help: `${metricNamePrefix}: Duration of probe in seconds`,
          labelNames: ['url', 'method', 'statusCode'],
        })
        const responseSizeGauge = new Gauge({
          name: `${metricNamePrefix}_response_size_bytes`,
          help: `${metricNamePrefix}: Size of response size in bytes`,
          labelNames: ['url', 'method', 'statusCode'],
        })

        this.requestMetricCollectors.push({
          probeID: id,
          requestIndex,
          httpStatusCodeGauge,
          responseTimeGauge,
          responseSizeGauge,
        })
      })
    })
  }

  collectProbeRequestMetrics(probeResult: any) {
    const { probe, requestIndex, response } = probeResult
    const requestMetricCollector = this.requestMetricCollectors?.find(
      (prmc: any) =>
        prmc.probeID === probe.id && prmc.requestIndex === requestIndex
    )
    const request = probe.requests[requestIndex]

    if (requestMetricCollector) {
      const {
        httpStatusCodeGauge,
        responseTimeGauge,
        responseSizeGauge,
      } = requestMetricCollector
      const responseTimeInSecond =
        (response.config.extraData?.responseTime ?? 0) / 1000
      const responesizeBytes = Number(response.headers['content-length'])
      const labels = {
        url: request.url,
        method: request?.method ?? 'GET',
        statusCode: response?.status,
      }

      httpStatusCodeGauge.set(response?.status)
      responseTimeGauge.labels(labels).set(responseTimeInSecond)
      responseSizeGauge
        .labels(labels)
        .set(isNaN(responesizeBytes) ? 0 : responesizeBytes)
    }
  }
}
