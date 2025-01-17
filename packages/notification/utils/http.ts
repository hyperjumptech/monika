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

import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from 'http'
import https from 'https'

// Keep the agents alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
export const DEFAULT_TIMEOUT = 10_000

// Create an instance of axios here so it will be reused instead of creating a new one all the time.
const axiosInstance = axios.default.create()

export async function sendHttpRequest(
  config: AxiosRequestConfig
): Promise<AxiosResponse> {
  const resp = await axiosInstance.request({
    ...config,
    timeout: config.timeout ?? DEFAULT_TIMEOUT, // Ensure default timeout if not filled.
    httpAgent: config.httpAgent ?? httpAgent,
    httpsAgent: config.httpsAgent ?? httpsAgent,
  })

  return resp
}
