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
import { Agent, type HeadersInit } from 'undici'

type HttpRequestParams = Omit<RequestInit, 'headers'> & {
  url: string
  maxRedirects?: number
  headers?: HeadersInit
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
const axiosInstance = axios.default.create()

export async function sendHttpRequest(
  config: HttpRequestParams
): Promise<AxiosResponse> {
  const { allowUnauthorizedSsl, body, headers, timeout, ...options } = config

  return axiosInstance.request({
    ...options,
    data: body,
    headers: convertHeadersToAxios(headers),
    timeout: timeout ?? DEFAULT_TIMEOUT, // Ensure default timeout if not filled.
    httpAgent,
    httpsAgent: allowUnauthorizedSsl
      ? new https.Agent({ keepAlive: true, rejectUnauthorized: true })
      : httpsAgent,
  })
}

function convertHeadersToAxios(headersInit: HeadersInit | undefined) {
  const headers: AxiosRequestHeaders = {}

  if (headersInit instanceof Headers) {
    // If headersInit is a Headers object
    for (const [key, value] of headersInit.entries()) {
      headers[key] = value
    }

    return headers
  }

  if (typeof headersInit === 'object') {
    // If headersInit is a plain object
    for (const [key, value] of Object.entries(headersInit)) {
      headers[key] = value as never
    }

    return headers
  }

  return headers
}

export async function sendHttpRequestFetch(
  config: HttpRequestParams
): Promise<Response> {
  const {
    allowUnauthorizedSsl,
    body,
    headers,
    maxRedirects,
    method,
    timeout,
    url,
  } = config
  const controller = new AbortController()
  const { signal } = controller
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout || DEFAULT_TIMEOUT)
  const resp = await fetch(url, {
    body: body === '' ? undefined : body,
    dispatcher: new Agent({
      connect: {
        rejectUnauthorized: !allowUnauthorizedSsl,
      },
      maxRedirections: maxRedirects,
    }),
    headers,
    keepalive: true,
    method,
    signal,
  }).then((response) => {
    clearTimeout(timeoutId)
    return response
  })

  return resp
}
