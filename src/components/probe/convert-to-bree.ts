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

import type { Probe } from '../../interfaces/probe'
import type {
  AxiosResponseWithExtraData,
  AxiosRequestConfigWithExtraData,
  RequestConfig,
} from '../../interfaces/request'

export type ProbeResult = {
  request: RequestConfig
  response: AxiosResponseWithExtraData
}

async function probeWorker() {
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const { workerData, parentPort } = require('worker_threads')
  const axios = require('axios')
  const Handlebars = require('handlebars')

  const { job } = workerData
  const { probe } = job

  const doProbe = async (probe: Probe): Promise<ProbeResult[]> => {
    const probing = async (
      requestConfig: RequestConfig,
      responses: Array<AxiosResponseWithExtraData>
    ): Promise<AxiosResponseWithExtraData> => {
      const responseInterceptor = (
        axiosResponse: AxiosResponseWithExtraData
      ) => {
        const start = axiosResponse?.config.extraData?.requestStartedAt!
        const responseTime = new Date().getTime() - start

        const data = {
          ...axiosResponse,
          config: {
            ...axiosResponse?.config,
            extraData: {
              ...axiosResponse?.config.extraData,
              responseTime,
            },
          },
        }

        return data
      }
      const request = async (
        config: RequestConfig
      ): Promise<AxiosResponseWithExtraData> => {
        const axiosInstance = axios.create()

        axiosInstance.interceptors.request.use(
          (axiosRequestConfig: AxiosRequestConfigWithExtraData) => {
            const data = {
              ...axiosRequestConfig,
              extraData: {
                ...axiosRequestConfig?.extraData,
                requestStartedAt: new Date().getTime(),
              },
            }

            return data
          }
        )
        axiosInstance.interceptors.response.use(
          (axiosResponse: AxiosResponseWithExtraData) => {
            const data = responseInterceptor(axiosResponse)

            return data
          },
          (axiosResponse: AxiosResponseWithExtraData) => {
            const data = responseInterceptor(axiosResponse)

            throw data
          }
        )

        return axiosInstance.request({
          ...config,
          data: config.body,
        })
      }

      try {
        // Compile URL using handlebars to render URLs that uses previous responses data
        const { url } = requestConfig
        const requestURL = url
        const renderURL = Handlebars.compile(requestURL)
        const renderedURL = renderURL({ responses })

        // Compile headers using handlebars to render URLs that uses previous responses data.
        // In some case such as value is not string, it will be returned as is without being compiled.
        // If the request does not have any headers, then it should skip this process.
        let { headers } = requestConfig
        if (headers) {
          for await (const header of Object.keys(headers)) {
            try {
              const rawHeader = headers[header]
              const renderHeader = Handlebars.compile(rawHeader)
              const renderedHeader = renderHeader({ responses })

              headers = {
                ...headers,
                [header]: renderedHeader,
              }
            } catch (_) {
              headers = { ...headers }
            }
          }
        }

        // Do the request using compiled URL and compiled headers (if exists)
        const res = await request({
          ...requestConfig,
          url: renderedURL,
        })

        return res
      } catch (error) {
        return {
          data: error?.response?.data || '',
          status: error?.response?.status || 500,
          statusText: 'ERROR',
          headers: error?.response?.headers || '',
          // get the response from error.config instead of error.response.xxx as the response data lives in the data.config space
          config: { ...error.config, extraData: error.config.extraData },
        }
      }
    }
    const responses: Array<AxiosResponseWithExtraData> = []
    const probeResult: Array<ProbeResult> = []

    await Promise.all(
      probe.requests.map(async (request) => {
        const response = await probing(request, responses)

        // Add to an array to be accessed by another request
        probeResult.push({ request, response })
      })
    )

    return probeResult
  }

  const probeResult = await doProbe(probe)
  const cleanProbeResult = probeResult.map((probeResult) => {
    const { request, response } = probeResult

    return {
      requestURL: request.url,
      // data: response.data,
      headers: response.headers,
      config: {
        extraData: {
          responseTime: response.config.extraData?.responseTime,
        },
      },
      status: response.status,
    }
  })

  parentPort.postMessage({ probe, probeResult: cleanProbeResult })
}

export function convertToBreeJobs(probes: Probe[]) {
  return probes.map((probe) => ({
    name: probe.id,
    path: probeWorker,
    interval: `${probe?.interval || 30}s`,
    probe,
  }))
}
