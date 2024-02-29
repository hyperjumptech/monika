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

import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import http from 'http'
import https from 'https'
import { Agent } from 'undici'

type HttpRequestParams = Omit<RequestInit, 'headers'> & {
  url: string
  maxRedirects?: number
  headers?: object
  timeout?: number
  allowUnauthorizedSsl?: boolean
  responseType?: 'stream'
}

// Keep the agents alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
export const DEFAULT_TIMEOUT = 10_000

// Create an instance of axios here so it will be reused instead of creating a new one all the time.
const axiosInstance = axios.create()

export async function sendHttpRequest(
  config: HttpRequestParams
): Promise<AxiosResponse> {
  let headers: AxiosRequestHeaders | undefined
  if (config.headers) {
    headers = {}
    for (const [key, value] of Object.entries(config.headers)) {
      headers[key] = value
    }
  }

  const resp = await axiosInstance.request({
    ...config,
    data: config.body,
    headers,
    timeout: config.timeout ?? DEFAULT_TIMEOUT, // Ensure default timeout if not filled.
    httpAgent,
    httpsAgent: config.allowUnauthorizedSsl
      ? new https.Agent({ keepAlive: true, rejectUnauthorized: true })
      : httpsAgent,
  })

  return resp
}

export async function sendHttpRequestFetch(
  config: HttpRequestParams
): Promise<Response> {
  let headers: Record<string, string> | undefined
  if (config.headers) {
    headers = {}
    for (const [key, value] of Object.entries(config.headers)) {
      headers[key] = value
    }
  }

  return fetch(config.url, {
    ...config,
    headers,
    redirect: 'manual',
    keepalive: true,
    dispatcher: new Agent({
      connect: {
        timeout: config.timeout,
        keepAlive: true,
        rejectUnauthorized: !config.allowUnauthorizedSsl,
      },
      maxRedirections: config.maxRedirects,
    }),
  })
}
