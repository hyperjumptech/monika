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

import Handlebars from 'handlebars'
import FormData from 'form-data'
import YAML from 'yaml'
import {
  type ProbeRequestResponse,
  type RequestConfig,
  probeRequestResult,
} from '../../../../interfaces/request.js'

// eslint-disable-next-line no-restricted-imports
import * as qs from 'querystring'

import { getContext } from '../../../../context/index.js'
import { icmpRequest } from '../icmp/request.js'
import registerFakes from '../../../../utils/fakes.js'
import {
  sendHttpRequest,
  sendHttpRequestFetch,
} from '../../../../utils/http.js'
import { log } from '../../../../utils/pino.js'
import { AxiosError } from 'axios'
import { MonikaFlags } from '../../../../flag.js'
import { getErrorMessage } from '../../../../utils/catch-error-handler.js'
import { type HeadersInit, errors as undiciErrors } from 'undici'
import Joi from 'joi'

// Register Handlebars helpers
registerFakes(Handlebars)

type probingParams = {
  requestConfig: Omit<RequestConfig, 'saveBody' | 'alert'> // is a config object
  responses: Array<ProbeRequestResponse> // an array of previous responses
}

const UndiciErrorValidator = Joi.object({
  cause: Joi.object({ name: Joi.string(), code: Joi.string() }),
})

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
  const newReq = { method, headers: new Headers(headers), timeout, body, ping }
  const renderURL = Handlebars.compile(url)
  const renderedURL = renderURL({ responses })

  const { flags } = getContext()
  newReq.headers = new Headers(
    compileHeaders(headers, body, responses as never)
  )
  // compile body needs to modify headers if necessary
  const { headers: newHeaders, body: newBody } = compileBody(
    newReq.headers,
    body,
    responses
  )
  newReq.headers = new Headers(newHeaders)
  newReq.body = newBody

  const startTime = Date.now()
  try {
    // is this a request for ping?
    if (newReq.ping === true) {
      return icmpRequest({ host: renderedURL })
    }

    // Do the request using compiled URL and compiled headers (if exists)
    if (flags['native-fetch']) {
      return await probeHttpFetch({
        startTime,
        flags,
        renderedURL,
        requestParams: newReq,
        allowUnauthorized,
      })
    }

    return await probeHttpAxios({
      startTime,
      flags,
      renderedURL,
      requestParams: newReq,
      allowUnauthorized,
    })
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime

    if (error instanceof AxiosError) {
      return handleAxiosError(responseTime, error)
    }

    const { value, error: undiciErrorValidator } =
      UndiciErrorValidator.validate(error, {
        allowUnknown: true,
      })

    if (!undiciErrorValidator) {
      return handleUndiciError(responseTime, value.cause)
    }

    // other errors
    return {
      data: '',
      body: '',
      status: 99,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: getErrorMessage(error),
    }
  }
}

function compileHeaders(
  headers: HeadersInit | undefined,
  body: string | object,
  responses: never
): HeadersInit | undefined {
  // return as-is if falsy
  if (!headers) return headers
  // Compile headers using handlebars to render URLs that uses previous responses data.
  // In some case such as value is not string, it will be returned as is without being compiled.
  // If the request does not have any headers, then it should skip this process.
  let newHeaders = headers
  for (const [key, value] of Object.entries(headers)) {
    const rawHeader = value
    const renderHeader = Handlebars.compile(rawHeader)
    const renderedHeader = renderHeader({ responses })

    newHeaders = {
      ...newHeaders,
      [key]: renderedHeader,
    }

    // evaluate "Content-Type" header in case-insensitive manner
    if (key.toLocaleLowerCase() === 'content-type') {
      const { contentType } = transformContentByType(body, rawHeader)

      if (rawHeader === 'multipart/form-data') {
        // delete the previous content-type header and add a new header with boundary
        // it needs to be deleted because multipart/form data needs to append the boundary data
        // from
        //    "content-type": "multipart/form-data"
        // to
        //    "content-type": "multipart/form-data; boundary=--------------------------012345678900123456789012"
        delete newHeaders[key as never]

        newHeaders = {
          ...newHeaders,
          'content-type': contentType,
        }
      }
    }
  }

  return newHeaders
}

type CompiledBody = {
  headers: HeadersInit | undefined
  body: object | string
}

function compileBody(
  headers: HeadersInit | undefined,
  body: object | string,
  responses: ProbeRequestResponse[]
): CompiledBody {
  // return as-is if falsy
  if (!body) return { headers, body }
  let newHeaders = headers
  let newBody = generateRequestChainingBody(body, responses)

  if (newHeaders) {
    const contentTypeKey = Object.keys(newHeaders || {}).find(
      (hk) => hk.toLocaleLowerCase() === 'content-type'
    )

    if (newHeaders && contentTypeKey) {
      const { content, contentType } = transformContentByType(
        newBody,
        newHeaders[contentTypeKey as never]
      )

      delete newHeaders[contentTypeKey as never]

      newBody = content
      newHeaders = newHeaders
        ? {
            ...(newHeaders as object),
            'content-type': contentType,
          }
        : undefined
    }
  }

  return { headers: newHeaders, body: newBody }
}

async function probeHttpFetch({
  startTime,
  flags,
  renderedURL,
  requestParams,
  allowUnauthorized,
}: {
  startTime: number
  flags: MonikaFlags
  renderedURL: string
  allowUnauthorized: boolean | undefined
  requestParams: {
    method: string | undefined
    headers: Headers | undefined
    timeout: number
    body: string | object
    ping: boolean | undefined
  }
}): Promise<ProbeRequestResponse> {
  if (flags.verbose) log.info(`Probing ${renderedURL} with Node.js fetch`)

  const { body, headers, method, timeout } = requestParams
  const { content } = transformContentByType(body, headers?.get('content-type'))
  const response = await sendHttpRequestFetch({
    allowUnauthorizedSsl: allowUnauthorized,
    body: content,
    headers,
    maxRedirects: flags['follow-redirects'],
    method,
    timeout,
    url: renderedURL,
  })

  const responseTime = Date.now() - startTime
  let responseHeaders: Record<string, string> | undefined
  if (response.headers) {
    responseHeaders = {}
    for (const [key, value] of Object.entries(response.headers)) {
      responseHeaders[key] = value
    }
  }

  const responseBody = await (response.headers
    .get('Content-Type')
    ?.includes('application/json')
    ? response.json()
    : response.text())

  return {
    requestType: 'HTTP',
    data: responseBody,
    body: responseBody,
    status: response.status,
    headers: responseHeaders || '',
    responseTime,
    result: probeRequestResult.success,
  }
}

async function probeHttpAxios({
  startTime,
  flags,
  renderedURL,
  requestParams,
  allowUnauthorized,
}: {
  startTime: number
  flags: MonikaFlags
  renderedURL: string
  allowUnauthorized: boolean | undefined
  requestParams: {
    method: string | undefined
    headers: Headers | undefined
    timeout: number
    body: string | object
    ping: boolean | undefined
  }
}): Promise<ProbeRequestResponse> {
  const { body, headers, method, timeout } = requestParams
  const { content } = transformContentByType(body, headers?.get('content-type'))
  const resp = await sendHttpRequest({
    allowUnauthorizedSsl: allowUnauthorized,
    body: content,
    headers,
    keepalive: true,
    maxRedirects: flags['follow-redirects'],
    method,
    timeout,
    url: renderedURL,
  })

  const responseTime = Date.now() - startTime
  const { data, headers: requestHeaders, status } = resp

  return {
    requestType: 'HTTP',
    data,
    body: data,
    status,
    headers: requestHeaders,
    responseTime,
    result: probeRequestResult.success,
  }
}

export function generateRequestChainingBody(
  body: object | string,
  responses: ProbeRequestResponse[]
): object | string {
  const isString = typeof body === 'string'
  const template = Handlebars.compile(isString ? body : JSON.stringify(body))
  const renderedBody = template({ responses })

  return isString ? renderedBody : JSON.parse(renderedBody)
}

function transformContentByType(
  content: object | string,
  contentType?: string | null | undefined
) {
  switch (contentType) {
    case 'application/json': {
      return { content: JSON.stringify(content), contentType }
    }

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
      return {
        content:
          typeof content === 'object' ? JSON.stringify(content) : content,
        contentType,
      }
    }
  }
}

function handleAxiosError(
  responseTime: number,
  error: AxiosError
): ProbeRequestResponse {
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
      error: error?.response?.data as string,
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

  return {
    data: '',
    body: '',
    status: 99,
    headers: '',
    responseTime,
    result: probeRequestResult.failed,
    error: getErrorMessage(error),
  }
}

// eslint-disable-next-line complexity
function getErrorStatusWithExplanation(error: AxiosError): {
  status: number
  description: string
} {
  const errorCode = error?.code || ''

  switch (errorCode) {
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

    case 'ERR_BAD_request.js': {
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
        log.error(
          `Error code 99: Unhandled error while probing ${error.request.url}, got ${error.code} ${error.stack} `
        )
      } else {
        log.error(
          `Error code 99: Unhandled error, got ${(error as AxiosError).stack}`
        )
      }

      return {
        status: 99,
        description: `Error code 99: ${getErrorMessage(error)}`,
      }
    } // in the event an unlikely unknown error, send here
  }
}

function handleUndiciError(
  responseTime: number,
  error: undiciErrors.UndiciError
): ProbeRequestResponse {
  if (
    error instanceof undiciErrors.BodyTimeoutError ||
    error instanceof undiciErrors.ConnectTimeoutError ||
    error instanceof undiciErrors.HeadersTimeoutError
  ) {
    return {
      data: '',
      body: '',
      status: 6,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'ETIMEDOUT: Connection attempt has timed out.',
    }
  }

  if (error instanceof undiciErrors.RequestAbortedError) {
    // https://httpstatuses.com/599
    return {
      data: '',
      body: '',
      status: 599,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error:
        'ECONNABORTED: The connection was unexpectedly terminated, often due to server issues, network problems, or timeouts.',
    }
  }

  // BEGIN Node.js fetch error status code outside Axios' error handler range (code >= 18)
  // fetch's client maxResponseSize and maxHeaderSize is set, limit exceeded
  if (
    error instanceof undiciErrors.HeadersOverflowError ||
    error instanceof undiciErrors.ResponseExceededMaxSizeError
  ) {
    return {
      data: '',
      body: '',
      status: 18,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'ECONNOVERFLOW: Header / response max size exceeded.',
    }
  }

  // fetch throwOnError is set to true, got HTTP status code >= 400
  if (error instanceof undiciErrors.ResponseStatusCodeError) {
    return {
      data: '',
      body: '',
      status: 19,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'ERESPONSESTATUSCODE: HTTP status code returns >= 400.',
    }
  }

  // invalid fetch argument passed
  if (error instanceof undiciErrors.InvalidArgumentError) {
    return {
      data: '',
      body: '',
      status: 20,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'EINVALIDARGUMENT: Invalid HTTP arguments.',
    }
  }

  // fetch failed to handle return value
  if (error instanceof undiciErrors.InvalidReturnValueError) {
    return {
      data: '',
      body: '',
      status: 21,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'EINVALIDRETURN: Unexpected HTTP response to handle.',
    }
  }

  if (
    error instanceof undiciErrors.ClientClosedError ||
    error instanceof undiciErrors.ClientDestroyedError ||
    error instanceof undiciErrors.SocketError
  ) {
    return {
      data: '',
      body: '',
      status: 22,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'ECONNCLOSED: HTTP client closed unexpectedly.',
    }
  }

  if (error instanceof undiciErrors.NotSupportedError) {
    return {
      data: '',
      body: '',
      status: 23,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: 'ESUPPORT: Unsupported HTTP functionality.',
    }
  }

  if (
    error instanceof undiciErrors.RequestContentLengthMismatchError ||
    error instanceof undiciErrors.ResponseContentLengthMismatchError
  ) {
    return {
      data: '',
      body: '',
      status: 24,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error:
        'ECONTENTLENGTH: Request / response content length mismatch with Content-Length header value.',
    }
  }

  // inline docs in Undici state that this would never happen,
  // but they declare and throw this condition anyway
  if (error instanceof undiciErrors.BalancedPoolMissingUpstreamError) {
    return {
      data: '',
      body: '',
      status: 25,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: `EMISSINGPOOL: Missing HTTP client pool.`,
    }
  }

  // expected error from fetch, but exact reason is in the message string
  // error messages are unpredictable
  // reference https://github.com/search?q=repo:nodejs/undici+new+InformationalError(&type=code
  if (error instanceof undiciErrors.InformationalError) {
    return {
      data: '',
      body: '',
      status: 26,
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      error: `EINFORMATIONAL: ${error.message}.`,
    }
  }

  return {
    data: '',
    body: '',
    status: 99,
    headers: '',
    responseTime,
    result: probeRequestResult.failed,
    error: getErrorMessage(error),
  }
}
