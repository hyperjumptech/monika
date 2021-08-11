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

import { RequestConfig } from '../../interfaces/request'
import { request } from './request'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
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
    let errResponseCode
    let errData
    let errHdr
    let errText

    if (error.response) {
      // 400, 500 get here
      // Axios doesn't always return error response
      errResponseCode = error.response.status
      errData = error.response.data
      errHdr = error.response.headers

      // eslint-disable-next-line no-console
      // console.log('test 80: error.response: ', error.response)
    } else if (error.request) {
      // timeout is here, ECONNABORTED, ENOTFOUND

      switch (error.code) {
        case 'ECONNABORTED':
          errText = 'Timed out'
          errResponseCode = 'TIMEOUT'
          break

        case 'ENOTFOUND':
          errResponseCode = 'NOTFOUND'
          errText = 'Url Not Found'
          break

        default:
          errResponseCode = 'unknown'
          errText = 'unknown error'
      }
      errData = ''
      errHdr = ''
      // eslint-disable-next-line no-console
      console.log('test 85: error.code: ', error.code)
    } else {
      // eslint-disable-next-line no-console
      console.log('test 91: unknown error: ', error)

      errResponseCode = error.code
      errText = 'unknown error'
      errData = ''
      errHdr = ''
    }

    return {
      data: errData,
      status: errResponseCode,
      statusText: errText,
      headers: errHdr,
      config: error.config, // get the response from error.config instead of error.response.xxx as -
      extraData: error.config.extraData, // the response data lives in the data.config space
    } as AxiosResponseWithExtraData
  }
}
