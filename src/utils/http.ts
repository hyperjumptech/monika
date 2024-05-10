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

import { Agent, type HeadersInit } from 'undici'

type HttpRequestParams = {
  url: string
  maxRedirects?: number
  headers?: HeadersInit
  timeout?: number
  allowUnauthorizedSsl?: boolean
  responseType?: 'stream'
} & Omit<RequestInit, 'headers'>

export const DEFAULT_TIMEOUT = 10_000

export async function sendHttpRequestFetch(
  config: HttpRequestParams
): Promise<Response> {
  const { maxRedirects, timeout, url } = config
  const controller = new AbortController()
  const { signal } = controller
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout || DEFAULT_TIMEOUT)
  const fetcher = compileFetch(config, signal)
  return fetchRedirect(url, maxRedirects, fetcher).then((response) => {
    clearTimeout(timeoutId)
    return response
  })
}

function compileFetch(
  config: HttpRequestParams,
  signal: AbortSignal
): (url: string) => Promise<Response> {
  const { allowUnauthorizedSsl, body, headers, method } = config

  return (url) =>
    fetch(url, {
      body: body === '' ? undefined : body,
      redirect: 'manual',
      dispatcher: new Agent({
        connect: {
          rejectUnauthorized: !allowUnauthorizedSsl,
        },
      }),
      headers,
      keepalive: true,
      method,
      signal,
    })
}

// fetchRedirect handles HTTP status code 3xx returned by fetcher
async function fetchRedirect(
  url: string,
  maxRedirects: number | undefined,
  fetcher: (url: string) => Promise<Response>
) {
  let redirected = 0
  let currentResponse: Response
  let nextUrl = url

  // do HTTP fetch request at least once
  // then follow redirect based maxRedirects value and HTTP status code 3xx
  do {
    // eslint-disable-next-line no-await-in-loop
    currentResponse = await fetcher(nextUrl)
    // check for HTTP status code 3xx
    const shouldRedirect =
      currentResponse.status >= 300 && currentResponse.status < 400
    if (!shouldRedirect) break

    // location header could either be full url, relative path, or absolute path
    // e.g. "https://something.tld", "new/path", "/new/path", respectively
    // refer to : RFC-7231 https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.2
    const newLocation = currentResponse.headers.get('location') || ''
    // try-catch to evaluate if redirect location is a url
    try {
      // when it is valid url, immediately set nextUrl from location header
      nextUrl = new URL(
        currentResponse.headers.get('location') || ''
      ).toString()
    } catch {
      // new redirect location is relative / absolute url
      const newEndpoint = newLocation.startsWith('/')
        ? newLocation
        : `/${newLocation}`
      // parse nextUrl to Node.js URL to get protocol and host
      const parsedURL = new URL(nextUrl)
      // compose nextUrl from parsed protocol, host, and newEndpoint
      nextUrl = `${parsedURL.protocol}//${parsedURL.host}${newEndpoint}`
    }

    // increment redirected value for while loop
    redirected++
  } while (redirected <= (maxRedirects || 0))

  return currentResponse
}
