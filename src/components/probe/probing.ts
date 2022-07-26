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
import FormData from 'form-data'
import YAML from 'yaml'
import { ProbeRequestResponse, RequestConfig } from '../../interfaces/request'
import * as qs from 'querystring'
import { sendPing, PING_TIMEDOUT } from '../../utils/ping'
import http from 'http'
import https from 'https'

// Keep the agenst alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
const axiosInstance = axios.create()

/**
 * probing() is the heart of monika requests generation
 * @param {obj} requestConfig is a config object
 * @param {array} responses an array of previous responses
 * @returns ProbeRequestResponse, response to the probe request
 */
export async function probing(
  requestConfig: Omit<RequestConfig, 'saveBody' | 'alert'>,
  responses: Array<ProbeRequestResponse>
): Promise<ProbeRequestResponse> {
  // Compile URL using handlebars to render URLs that uses previous responses data
  const { method, url, headers, timeout, body, ping } = requestConfig
  const newReq = { method, headers, timeout, body, ping }
  const renderURL = Handlebars.compile(url)
  const renderedURL = renderURL({ responses })

  // Compile headers using handlebars to render URLs that uses previous responses data.
  // In some case such as value is not string, it will be returned as is without being compiled.
  // If the request does not have any headers, then it should skip this process.
  if (headers) {
    for (const header of Object.keys(headers)) {
      const rawHeader = headers[header]
      const renderHeader = Handlebars.compile(rawHeader)
      const renderedHeader = renderHeader({ responses })

      newReq.headers = {
        ...newReq.headers,
        [header]: renderedHeader,
      }

      // evaluate "Content-Type" header in case-insensitive manner
      if (header.toLocaleLowerCase() === 'content-type') {
        const { contentType } = transformContentByType(body, rawHeader)

        if (rawHeader === 'multipart/form-data') {
          // delete the previous content-type header and add a new header with boundary
          // it needs to be deleted because multipart/form data needs to append the boundary data
          // from
          //    "content-type": "multipart/form-data"
          // to
          //    "content-type": "multipart/form-data; boundary=--------------------------012345678900123456789012"
          delete newReq.headers[header]

          newReq.headers = {
            ...newReq.headers,
            'content-type': contentType,
          }
        }
      }
    }
  }

  if (body) {
    if (typeof body === 'string') {
      const renderBody = Handlebars.compile(body)
      const renderedBody = renderBody({ responses })

      newReq.body = renderedBody as any
    } else {
      for (const bk of Object.keys(body)) {
        let rawBody = (body as any)[bk]
        if (typeof rawBody !== 'string') {
          rawBody = JSON.stringify(rawBody)
        }

        const renderBody = Handlebars.compile(rawBody)
        const renderedBody = renderBody({ responses })

        newReq.body = { ...newReq.body, [bk]: renderedBody }
      }
    }

    if (newReq.headers) {
      const contentTypeKey = Object.keys(headers).find((hk) => {
        return hk.toLocaleLowerCase() === 'content-type'
      })

      if (contentTypeKey) {
        const { content, contentType } = transformContentByType(
          newReq.body,
          headers[contentTypeKey]
        )

        delete newReq.headers[contentTypeKey]

        newReq.body = content
        newReq.headers = {
          ...newReq.headers,
          'content-type': contentType,
        }
      }
    }
  }

  const requestStartedAt = Date.now()

  try {
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
        body: data,
        status,
        headers,
        responseTime,
        alive,
        numericHost,
        packetLoss,
      }
    }

    // Do the request using compiled URL and compiled headers (if exists)
    const resp = await axiosInstance.request({
      ...newReq,
      url: renderedURL,
      data: newReq.body,
      maxRedirects: 0,
      httpAgent,
      httpsAgent,
    })

    const responseTime = Date.now() - requestStartedAt
    const { data, headers, status } = resp
    const requestType = 'HTTP'

    return {
      requestType,
      data,
      body: data,
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
        body: error?.response?.data,
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
        body: '',
        status,
        headers: '',
        responseTime,
      }
    }

    // other errors
    return {
      data: '',
      body: '',
      status: error.code || 'Unknown error',
      headers: '',
      responseTime,
    }
  }
}

function transformContentByType(content: any, contentType: string) {
  switch (contentType) {
    case 'application/x-www-form-urlencoded':
      return {
        content: qs.stringify(content),
        contentType,
      }

    case 'multipart/form-data': {
      const form = new FormData()

      for (const contentKey of Object.keys(content)) {
        form.append(contentKey, content[contentKey])
      }

      return { content: form, contentType: form.getHeaders()['content-type'] }
    }

    case 'text/yaml': {
      const yamlDoc = new YAML.Document()
      yamlDoc.contents = content

      return { content: yamlDoc.toString(), contentType }
    }

    default:
      return { content, contentType }
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
