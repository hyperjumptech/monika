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
  RequestConfig,
  AxiosResponseWithExtraData,
} from '../../../interfaces/request'
import { Gauge, Histogram } from 'prom-client'
import { snakeCase } from 'snake-case'
import { Probe } from '../../../interfaces/probe'

export type PrometheusRequestMetricCollector = {
  requestIndex: number
  httpStatusCodeGauge: Gauge<string>
  responseTimeHistogram: Histogram<'url' | 'method' | 'statusCode'>
  responseSizeGauge: Gauge<string>
}

type collectPrometheusMetricsParams = {
  request: RequestConfig
  probeResponse: AxiosResponseWithExtraData
  prometheusRequestMetricCollector: PrometheusRequestMetricCollector
}

export function registerCollectorFromProbe(
  probe: Probe
): PrometheusRequestMetricCollector[] {
  const { id, name, requests } = probe
  const prometheusRequestMetricCollectors = requests.map(
    (_: RequestConfig, requestIndex: number) => {
      const metricNamePrefix = `monika_${snakeCase(
        name
      )}_request_${requestIndex}`
      const httpStatusCodeGauge = new Gauge({
        name: `${metricNamePrefix}_status_code_info`,
        help: `${metricNamePrefix}: HTTP status code`,
      })
      const responseTimeHistogram = new Histogram({
        name: `${metricNamePrefix}_response_time_seconds`,
        help: `${metricNamePrefix}: Duration of probe in seconds`,
        labelNames: ['url', 'method', 'statusCode'],
      })
      const responseSizeGauge = new Gauge({
        name: `${metricNamePrefix}_response_size_bytes`,
        help: `${metricNamePrefix}: Size of response size in bytes`,
      })

      return {
        id,
        requestIndex,
        httpStatusCodeGauge,
        responseTimeHistogram,
        responseSizeGauge,
      }
    }
  )

  return prometheusRequestMetricCollectors
}

export function collectProbeRequestPrometheusMetrics({
  request,
  probeResponse,
  prometheusRequestMetricCollector,
}: collectPrometheusMetricsParams) {
  const {
    httpStatusCodeGauge,
    responseTimeHistogram,
    responseSizeGauge,
  } = prometheusRequestMetricCollector
  const responseTimeInSecond =
    (probeResponse.config.extraData?.responseTime ?? 0) / 1000
  const labels = {
    url: request.url,
    method: request?.method ?? 'GET',
    statusCode: probeResponse?.status,
  }

  httpStatusCodeGauge.set(probeResponse?.status)
  responseTimeHistogram.labels(labels).observe(responseTimeInSecond)
  responseSizeGauge.set(
    parseInt(probeResponse.headers['content-length'], 10) ?? 0
  )
}
