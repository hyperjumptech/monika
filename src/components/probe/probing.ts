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
import * as Handlebars from 'handlebars'
import { ProbeRequestResponse, RequestConfig } from '../../interfaces/request'
import * as qs from 'querystring'
import { sendPing, PING_TIMEDOUT } from '../../utils/ping'

const headerContentType = 'content-type'
const contentType = {
  'form-urlencoded': 'application/x-www-form-urlencoded',
  json: 'application/json',
}

/**
 * probing() is the heart of monika requests generation
 * @param requestConfig
 * @param responses an array of previous responses
 * @returns ProbeRequestResponse, response to the probe request
 */
export async function probing(
  requestConfig: RequestConfig,
  responses: Array<ProbeRequestResponse>
): Promise<ProbeRequestResponse> {
  const newReq = { ...requestConfig }
  // Compile URL using handlebars to render URLs that uses previous responses data
  const { url } = requestConfig
  const requestURL = url
  const renderURL = Handlebars.compile(requestURL)
  const renderedURL = renderURL({ responses })
  let shouldEncodeFormUrl = false

  // Compile headers using handlebars to render URLs that uses previous responses data.
  // In some case such as value is not string, it will be returned as is without being compiled.
  // If the request does not have any headers, then it should skip this process.
  if (requestConfig.headers) {
    for (const header of Object.keys(requestConfig.headers)) {
      const rawHeader = requestConfig.headers[header]
      const renderHeader = Handlebars.compile(rawHeader)
      const renderedHeader = renderHeader({ responses })

      newReq.headers = {
        ...newReq.headers,
        [header]: renderedHeader,
      }

      // evaluate "Content-Type" header in case-insensitive manner
      if (
        header.toLocaleLowerCase() === headerContentType &&
        rawHeader === contentType['form-urlencoded']
      ) {
        shouldEncodeFormUrl = true
      }
    }
  }

  const axiosInstance = axios.create()
  const requestStartedAt = Date.now()

  let resp: any = {}

  try {
    // Do the request using compiled URL and compiled headers (if exists)
    let requestBody: any = newReq.body
    if (shouldEncodeFormUrl) {
      requestBody = qs.stringify(requestBody)
    }

    // is this a request for ping?
    if (newReq.ping === true) {
      const pingResp = await sendPing(renderedURL)

      const requestType = 'ICMP'

      const responseTime = pingResp.avg // map response time to the average ping time
      const alive = pingResp.alive
      const data = pingResp.output
      const headers = {}
      const packetLoss = pingResp.packetLoss
      const numericHost = pingResp.numericHost

      const status = alive ? 200 : PING_TIMEDOUT

      return {
        requestType,
        data,
        status,
        headers,
        responseTime,
        alive,
        numericHost,
        packetLoss,
      }
    }

    // if this is not a ping, then do regular REST request through axios
    resp = await axiosInstance.request({
      ...newReq,
      url: renderedURL,
      data: requestBody,
    })

    const responseTime = Date.now() - requestStartedAt
    const { data, headers, status } = resp
    const requestType = 'HTTP'

    return {
      requestType,
      data,
      status,
      headers,
      responseTime,
    }
  } catch (error: any) {
    const responseTime = Date.now() - requestStartedAt

    // The request was made and the server responded with a status code
    // 400, 500 get here
    if (error?.response) {
      return {
        data: error?.response?.data,
        status: error?.response?.status,
        headers: error?.response?.headers,
        responseTime,
      }
    }

    // The request was made but no response was received
    // timeout is here, ECONNABORTED, ENOTFOUND, ECONNRESET, ECONNREFUSED
    if (error?.request) {
      const status = errorRequestCodeToNumber(error?.code)

      return {
        data: '',
        status,
        headers: '',
        responseTime,
      }
    }

    // other errors
    return {
      data: '',
      status: error.code || 'Unknown error',
      headers: '',
      responseTime,
    }
  }
}

function errorRequestCodeToNumber(
  errorRequestCode: string | undefined
): number {
  switch (errorRequestCode) {
    case 'ECONNABORTED':
      return 599 // https://httpstatuses.com/599

    case 'ENOTFOUND':
      // not found, the abyss never returned a statusCode
      // assign some unique errResponseCode for decoding later.
      return 0

    case 'ECONNRESET':
      // connection reset from target, assign some unique number responsecCode
      return 1

    case 'ECONNREFUSED':
      // got rejected, again
      return 2

    default:
      return 3
  }
}
