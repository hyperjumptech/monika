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

import { ReadableStream } from 'node:stream/web'
import {
  HttpClientHeaderList,
  HttpClientHeaders,
  HttpClientResponseType,
  HttpClientRequestOptions,
} from '../../interfaces/http-client'
import { Agent, type HeadersInit } from 'undici'

export class HttpClientResponse {
  _fetchResponse: Response
  _headers: HttpClientHeaderList | null = null
  _isStreamResponseType: boolean
  _data: unknown

  constructor(
    fetchResponse: Response,
    isStreamResponseType: boolean,
    data?: unknown
  ) {
    this._fetchResponse = fetchResponse
    this._isStreamResponseType = isStreamResponseType
    this._data = data
  }

  get headers(): HttpClientHeaders {
    if (!this._headers) {
      this._headers = new HttpClientHeaderList()

      for (const [k, v] of this._fetchResponse.headers.entries()) {
        this._headers!.set(k, v)
      }
    }

    return this._headers
  }

  get ok(): boolean {
    return this._fetchResponse.ok
  }

  get status(): number {
    return this._fetchResponse.status
  }

  get statusText(): string {
    return this._fetchResponse.statusText
  }

  get type(): HttpClientResponseType {
    return this._fetchResponse.type
  }

  // get url: string
  // readonly redirected: boolean

  // readonly bodyUsed: boolean

  // readonly arrayBuffer: () => Promise<ArrayBuffer>
  // readonly blob: () => Promise<Blob>
  // readonly formData: () => Promise<FormData>

  json(): Promise<unknown> {
    return this._fetchResponse.json()
  }

  text(): Promise<string> {
    return this._fetchResponse.text()
  }

  // static error (): Response;

  get data(): ReadableStream | unknown {
    if (this._isStreamResponseType) {
      const reader = this._fetchResponse.body?.getReader()
      return new ReadableStream({
        start(controller) {
          return pump()

          function pump() {
            if (!reader) return

            return reader
              .read()
              .then(({ done, value }: { done: any; value?: any }): any => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close()
                  return
                }

                // Enqueue the next data chunk into our target stream
                controller.enqueue(value)
                return pump()
              })
          }
        },
      })
    }

    return this._data
  }
}

export const httpClient = async (
  url: string,
  requestOptions: HttpClientRequestOptions,
  isStreamResponseType: boolean = false
): Promise<HttpClientResponse> => {
  const fetchResponse = await fetch(url, {
    body: requestOptions.body === '' ? undefined : requestOptions.body,
    redirect: requestOptions.redirect,
    dispatcher:
      requestOptions.allowUnauthorizedSsl === undefined
        ? undefined
        : new Agent({
            connect: {
              rejectUnauthorized: !requestOptions.allowUnauthorizedSsl,
              keepAlive: requestOptions.keepAlive,
            },
          }),

    headers: requestOptions.headers as HeadersInit,
    keepalive: requestOptions.keepAlive,
    method: requestOptions.method,
    signal: requestOptions.signal,
  })

  let data
  if (!isStreamResponseType) {
    data = await fetchResponse.json()
  }

  return new HttpClientResponse(fetchResponse, isStreamResponseType, data)
}
