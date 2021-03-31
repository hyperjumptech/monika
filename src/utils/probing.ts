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

import { RequestConfig } from './../interfaces/request'
import { request } from './request'
import { AxiosResponseWithExtraData } from '../interfaces/request'
import * as Handlebars from 'handlebars'

export async function probing(
  requestConfig: RequestConfig,
  responses: Array<AxiosResponseWithExtraData>
) {
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
    return res as AxiosResponseWithExtraData
  } catch (error) {
    let errStatus
    let errData
    let errHdr

    if (error.response) {
      // Axios doesn't always return error response
      errStatus = error.response.status
      errData = error.response.data
      errHdr = error.response.headers
    } else {
      errStatus = 500 // TODO: how to detect timeouts?
      errData = ''
      errHdr = ''
    }

    return {
      data: errData,
      status: errStatus,
      statusText: 'ERROR',
      headers: errHdr,
      config: '',
      extraData: {
        requestStartedAt: 0,
        responseTime: 0,
      },
    } as AxiosResponseWithExtraData
  }
}
