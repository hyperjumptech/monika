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

import fetch, { RequestInit, Response } from 'node-fetch'
import http, { RequestOptions } from 'http'
import https from 'https'
import { URL } from 'url'

export const DEFAULT_TIMEOUT = 10_000

export const HTTPMethods = new Set([
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'PURGE',
  'LINK',
  'UNLINK',
])

export async function sendHttpRequest(
  config: { url: string } & RequestInit
): Promise<Response> {
  const { url, timeout, agent, body, ...init } = config
  return fetch(url, {
    ...init,
    body: body ? body : undefined,
    timeout: timeout ?? DEFAULT_TIMEOUT,
    agent: agent ?? defaultAgent,
  }).then((res) => {
    if (res.type === 'basic' || res.type === 'cors') {
      return res
    }

    throw new Error(
      `sendHttpRequest: Failed with HTTP status code ${res.status}: "${res.type}".`
    )
  })
}

// Keep the agents alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
function defaultAgent(parsedUrl: URL): RequestOptions['agent'] {
  return parsedUrl.protocol === 'http:'
    ? new http.Agent({ keepAlive: true })
    : new https.Agent({ keepAlive: true })
}
