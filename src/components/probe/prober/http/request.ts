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

// eslint-disable-next-line no-restricted-imports
import * as qs from 'querystring'

import http from 'http'
import https from 'https'
import { getContext } from '../../../../context'
import { icmpRequest } from '../icmp/request'
import registerFakes from '../../../../utils/fakes'
import { sendHttpRequest } from '../../../../utils/http'
import { AxiosError } from 'axios'

// Register Handlebars helpers
registerFakes(Handlebars)

// Keep the agents alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: getContext().flags.ignoreInvalidTLS,
})

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

  const { flags } = getContext()

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
      const contentTypeKey = Object.keys(headers || {}).find(
        (hk) => hk.toLocaleLowerCase() === 'content-type'
      )

      if (contentTypeKey) {
        const { content, contentType } = transformContentByType(
          newReq?.body,
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
  // allowUnauthorized in a request takes higher priority than the global ignoreInvalidTLS flag
  let optHttpsAgent
  if (allowUnauthorized) {
    // Use the agent with the rejectUnauthorized value from the config
    optHttpsAgent = new https.Agent({
      rejectUnauthorized: !allowUnauthorized,
    })
  } else {
    const ignoringInvalidTLS = getContext().flags.ignoreInvalidTLS
    httpsAgent.options = {
      ...httpsAgent.options,
      rejectUnauthorized: !ignoringInvalidTLS,
    }
    optHttpsAgent = httpsAgent
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
    }
  } catch (error: unknown) {
    const responseTime = Date.now() - requestStartedAt

    if (error instanceof AxiosError) {
      // The request was made and the server responded with a status code
      // 400, 500 get here
      if (error?.response) {
        return {
          data: '',
          body: '',
          status: error?.response?.status,
          headers: error?.response?.headers,
          responseTime,
          result: probeRequestResult.success,
          error: error?.response?.data,
        }
      }

      // The request was made but no response was received
      // timeout is here, ECONNABORTED, ENOTFOUND, ECONNRESET, ECONNREFUSED
      if (error?.request) {
        const { status, description } = getErrorStatusWithExplanation(error)

        return {
          data: '',
          body: '',
          status,
          headers: '',
          responseTime,
          result: probeRequestResult.failed,
          error: description,
        }
      }
    }

    // other errors
    return {
      data: '',
      body: '',
      status: 99,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: (error as Error).message,
    }
  }
}

export function generateRequestChainingBody(
  body: object | string,
  responses: ProbeRequestResponse[]
): JSON | string {
  const isString = typeof body === 'string'
  const template = Handlebars.compile(isString ? body : JSON.stringify(body))
  const renderedBody = template({ responses })

  return isString ? renderedBody : JSON.parse(renderedBody)
}

function transformContentByType(
  content: object | string,
  contentType?: string | number | boolean
) {
  switch (contentType) {
    case 'application/x-www-form-urlencoded': {
      return {
        content: qs.stringify(content as never),
        contentType,
      }
    }

    case 'multipart/form-data': {
      const form = new FormData()

      for (const contentKey of Object.keys(content)) {
        form.append(contentKey, (content as Record<string, never>)[contentKey])
      }

      return { content: form, contentType: form.getHeaders()['content-type'] }
    }

    case 'text/yaml': {
      const yamlDoc = new YAML.Document()
      yamlDoc.contents = content

      return { content: yamlDoc.toString(), contentType }
    }

    default: {
      return { content, contentType }
    }
  }
}

function getErrorStatusWithExplanation(error: unknown): {
  status: number
  description: string
} {
  switch ((error as AxiosError).code) {
    case 'ECONNABORTED': {
      return {
        status: 599,
        description:
          'ECONNABORTED: The connection was unexpectedly terminated, often due to server issues, network problems, or timeouts.',
      }
    } // https://httpstatuses.com/599

    case 'ENOTFOUND': {
      // not found, the abyss never returned a statusCode
      // assign some unique errResponseCode for decoding later.
      return {
        status: 0,
        description:
          "ENOTFOUND: The monitored website or server couldn't be found, similar to entering an incorrect web address or encountering a temporary network/server issue.",
      }
    }

    case 'ECONNRESET': {
      // connection reset from target, assign some unique number responsecCode
      return {
        status: 1,
        description:
          'ECONNRESET: The connection to a server was unexpectedly reset, often pointing to issues on the server side or network interruptions.',
      }
    }

    case 'ECONNREFUSED': {
      // got rejected, again
      return {
        status: 2,
        description:
          'ECONNREFUSED: Attempted to connect to a server, but the server declined the connection.',
      }
    }

    case 'ERR_FR_TOO_MANY_REDIRECTS': {
      // redirect higher than set in maxRedirects
      return {
        status: 3,
        description:
          'ERR_FR_TOO_MANY_REDIRECTS: Webpage is stuck in a loop of continuously redirecting.',
      }
    }

    // cover all possible axios connection issues
    case 'ERR_BAD_OPTION_VALUE': {
      return {
        status: 4,
        description:
          'ERR_BAD_OPTION_VALUE: Invalid or inappropriate value is provided for an option.',
      }
    }

    case 'ERR_BAD_OPTION': {
      return {
        status: 5,
        description: 'ERR_BAD_OPTION: Invalid or inappropriate option is used.',
      }
    }

    case 'ETIMEDOUT': {
      return {
        status: 6,
        description: 'ETIMEDOUT: Connection attempt has timed out.',
      }
    }

    case 'ERR_NETWORK': {
      return {
        status: 7,
        description:
          'ERR_NETWORK: Signals a general network-related issue such as poor connectivity, DNS issues, or firewall restrictions.',
      }
    }

    case 'ERR_DEPRECATED': {
      return {
        status: 8,
        description:
          'ERR_DEPRECATED: Feature, method, or functionality used in the code is outdated or no longer supported.',
      }
    }

    case 'ERR_BAD_RESPONSE': {
      return {
        status: 9,
        description:
          'ERR_BAD_RESPONSE: Server provides a response that cannot be understood or is considered invalid.',
      }
    }

    case 'ERR_BAD_REQUEST': {
      return {
        status: 11,
        description:
          "ERR_BAD_REQUEST:  Client's request to the server is malformed or invalid.",
      }
    }

    case 'ERR_CANCELED': {
      return {
        status: 12,
        description:
          'ERR_CANCELED: Request or operation is canceled before it completes.',
      }
    }

    case 'ERR_NOT_SUPPORT': {
      return {
        status: 13,
        description: 'ERR_NOT_SUPPORT: Feature or operation is not supported.',
      }
    }

    case 'ERR_INVALID_URL': {
      return {
        status: 14,
        description:
          'ERR_INVALID_URL: URL is not formatted correctly or is not a valid web address.',
      }
    }

    case 'EAI_AGAIN': {
      return {
        status: 15,
        description: 'EAI_AGAIN: Temporary failure in resolving a domain name.',
      }
    }

    case 'EHOSTUNREACH': {
      return {
        status: 16,
        description: 'EHOSTUNREACH: The host is unreachable.',
      }
    }

    case 'EPROTO': {
      return {
        status: 17,
        description:
          "EPROTO: There are issues with the website's SSL/TLS certificates, incompatible protocols, or other SSL-related problems.",
      }
    }

    default: {
      if (error instanceof AxiosError) {
        console.error(
          `Error code 99: Unhandled error while probing ${error.request.url}, got ${error.code} ${error.stack} `
        )
      } else {
        console.error(
          `Error code 99: Unhandled error, got ${(error as AxiosError).stack}`
        )
      }

      return {
        status: 99,
        description: `Error code 99: ${(error as AxiosError).stack}`,
      }
    } // in the event an unlikely unknown error, send here
  }
}
