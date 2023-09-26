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

import * as Handlebars from 'handlebars'
import FormData from 'form-data'
import YAML from 'yaml'
import {
  type ProbeRequestResponse,
  type RequestConfig,
  probeRequestResult,
} from '../../../../interfaces/request'
import * as qs from 'querystring'

import http from 'http'
import https from 'https'
import { getContext } from '../../../../context'
import { icmpRequest } from '../icmp/request'
import registerFakes from '../../../../utils/fakes'
import { sendHttpRequest } from '../../../../utils/http'

// Register Handlebars helpers
registerFakes(Handlebars)

// Keep the agents alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })

type probingParams = {
  requestConfig: Omit<RequestConfig, 'saveBody' | 'alert'> // is a config object
  responses: Array<ProbeRequestResponse> // an array of previous responses
}

/**
 * probing() is the heart of monika requests generation
 * @param {obj} parameter as input object
 * @returns ProbeRequestResponse, response to the probe request
 */
export async function httpRequest({
  requestConfig,
  responses,
}: probingParams): Promise<ProbeRequestResponse> {
  // Compile URL using handlebars to render URLs that uses previous responses data
  const { method, url, headers, timeout, body, ping, allowUnauthorized } =
    requestConfig
  const newReq = { method, headers, timeout, body, ping }
  const renderURL = Handlebars.compile(url)
  const renderedURL = renderURL({ responses })

  const flags = getContext().flags

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
    newReq.body = generateRequestChainingBody(body, responses)

    if (newReq.headers) {
      const contentTypeKey = Object.keys(headers || {}).find((hk) => {
        return hk.toLocaleLowerCase() === 'content-type'
      })

      if (contentTypeKey) {
        const { content, contentType } = transformContentByType(
          newReq.body,
          (headers || {})[contentTypeKey]
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

  // check if this request must ignore ssl cert
  // if it is, then create new https agent solely for this request
  let optHttpsAgent = httpsAgent
  if (allowUnauthorized) {
    optHttpsAgent = new https.Agent({ rejectUnauthorized: !allowUnauthorized })
  }

  const requestStartedAt = Date.now()

  try {
    // is this a request for ping?
    if (newReq.ping === true) {
      return icmpRequest({ host: renderedURL })
    }

    // Do the request using compiled URL and compiled headers (if exists)
    const resp = await sendHttpRequest({
      ...newReq,
      url: renderedURL,
      data: newReq.body,
      maxRedirects: flags['follow-redirects'],
      httpAgent,
      httpsAgent: optHttpsAgent,
    })

    const responseTime = Date.now() - requestStartedAt
    const { data, headers, status } = resp

    return {
      requestType: 'HTTP',
      data,
      body: data,
      status,
      headers,
      responseTime,
      result: probeRequestResult.success,
      isProbeResponsive: true,
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
        result: probeRequestResult.success,
        isProbeResponsive: true, // http status received, so connection ok
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
        result: probeRequestResult.failed,
        isProbeResponsive: false,
        errMessage: error?.code,
      }
    }

    // other errors
    return {
      data: '',
      body: '',
      status: error.code || 'Unknown error',
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      isProbeResponsive: false,
      errMessage: error.code || 'Unknown error',
    }
  }
}

export function generateRequestChainingBody(
  body: JSON | string,
  responses: ProbeRequestResponse[]
): JSON | string {
  const isString = typeof body === 'string'
  const template = Handlebars.compile(isString ? body : JSON.stringify(body))
  const renderedBody = template({ responses })

  return isString ? renderedBody : JSON.parse(renderedBody)
}

function transformContentByType(
  content: any,
  contentType?: string | number | boolean
) {
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
    case 'ERR_FR_TOO_MANY_REDIRECTS':
      // redirect higher than set in maxRedirects
      return 3
    // cover all possible axios connection issues
    case 'ERR_BAD_OPTION_VALUE':
      return 4
    case 'ERR_BAD_OPTION':
      return 5
    case 'ETIMEDOUT':
      return 6
    case 'ERR_NETWORK':
      return 7
    case 'ERR_DEPRECATED':
      return 8
    case 'ERR_BAD_RESPONSE':
      return 9
    case 'ERR_BAD_REQUEST':
      return 11
    case 'ERR_CANCELED':
      return 12
    case 'ERR_NOT_SUPPORT':
      return 13
    case 'ERR_INVALID_URL':
      return 14

    default:
      return 99 // in the event an unlikely unknown error, send here
  }
}
