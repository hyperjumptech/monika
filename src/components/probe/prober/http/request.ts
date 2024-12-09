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
import Joi from 'joi'
// eslint-disable-next-line no-restricted-imports
import * as qs from 'querystring'
import { type BodyInit, errors as undiciErrors } from 'undici'
import YAML from 'yaml'
import {
  type ProbeRequestResponse,
  type RequestConfig,
  probeRequestResult,
} from '../../../../interfaces/request'
import { getContext } from '../../../../context'
import { icmpRequest } from '../icmp/request'
import registerFakes from '../../../../utils/fakes'
import { sendHttpRequest, sendHttpRequestFetch } from '../../../../utils/http'
import { log } from '../../../../utils/pino'
import { AxiosError } from 'axios'
import { getErrorMessage } from '../../../../utils/catch-error-handler'

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
  const {
    method,
    url,
    headers,
    timeout,
    body,
    ping,
    allowUnauthorized,
    followRedirects,
    signal,
  } = requestConfig
  const newReq = { method, headers, timeout, body, ping, signal }
  const renderURL = Handlebars.compile(url)
  const renderedURL = renderURL({ responses })

  // compile body needs to modify headers if necessary
  const { headers: newHeaders, body: newBody } = compileBody({
    responses,
    body,
    headers: compileHeaders({ headers, responses, body }),
  })
  newReq.headers = newHeaders
  newReq.body = newBody

  const startTime = Date.now()
  try {
    // is this a request for ping?
    if (newReq.ping === true) {
      log.warn(
        `PING ${renderedURL}: Requests with "ping: true" is deprecated, please migrate to standalone probe https://monika.hyperjump.tech/guides/probes#ping-request`
      )
      return icmpRequest({ host: renderedURL })
    }

    const requestHeaders = new Headers()
    for (const [key, value] of Object.entries(newReq.headers || {})) {
      requestHeaders.set(key, value)
    }

    // Do the request using compiled URL and compiled headers (if exists)
    const response = await (getContext().flags['native-fetch']
      ? probeHttpFetch({
          startTime,
          maxRedirects: followRedirects,
          renderedURL,
          requestParams: { ...newReq, headers: requestHeaders },
          allowUnauthorized,
        })
      : probeHttpAxios({
          startTime,
          maxRedirects: followRedirects,
          renderedURL,
          requestParams: { ...newReq, headers: requestHeaders },
          allowUnauthorized,
        }))

    return response
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

type ChainingRequest = {
  responses: Array<ProbeRequestResponse>
  body?: BodyInit
  headers?: object
}

function compileHeaders({ headers, responses, body }: ChainingRequest) {
  // return as-is if falsy
  if (!headers) return headers
  // Compile headers using handlebars to render URLs that uses previous responses data.
  // In some case such as value is not string, it will be returned as is without being compiled.
  // If the request does not have any headers, then it should skip this process.
  let newHeaders = headers
  for (const [key, rawHeader] of Object.entries(headers)) {
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

function compileBody({
  responses,
  body,
  headers,
}: ChainingRequest): Pick<ChainingRequest, 'body' | 'headers'> {
  // return as-is if falsy
  if (!body) {
    return {
      headers: {
        ...headers,
        'user-agent':
          headers?.['user-agent' as keyof typeof headers] ??
          getContext().flags['user-agent'] ??
          getContext().userAgent.split(' ')[0], // This will get the monika/x.x.x
      },
      body,
    }
  }

  let newHeaders = headers
  let newBody: BodyInit | undefined = generateRequestChainingBody(
    body,
    responses
  )

  if (newHeaders) {
    // handle content-type headers
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

  // handle content-type headers
  const userAgentKey = Object.keys(newHeaders || {}).find(
    (hk) => hk.toLocaleLowerCase() === 'user-agent'
  )

  if (newHeaders && userAgentKey) {
    delete newHeaders[userAgentKey as never]
  }

  newHeaders = {
    ...(newHeaders as object),
    'user-agent':
      newHeaders?.['user-agent' as keyof typeof headers] ??
      getContext().flags['user-agent'] ??
      getContext().userAgent.split(' ')[0], // This will get the monika/x.x.x
  }

  return { headers: newHeaders, body: newBody }
}

async function probeHttpFetch({
  startTime,
  renderedURL,
  requestParams,
  allowUnauthorized,
  maxRedirects,
}: {
  startTime: number
  renderedURL: string
  allowUnauthorized: boolean | undefined
  maxRedirects: number
  requestParams: {
    method: string | undefined
    headers: Headers | undefined
    timeout: number
    body?: BodyInit
    ping: boolean | undefined
  }
}): Promise<ProbeRequestResponse> {
  if (getContext().flags.verbose) {
    log.info(`Probing ${renderedURL} with Node.js fetch`)
  }

  const response = await sendHttpRequestFetch({
    ...requestParams,
    allowUnauthorizedSsl: allowUnauthorized,
    keepalive: true,
    url: renderedURL,
    maxRedirects,
    body:
      typeof requestParams.body === 'string'
        ? requestParams.body
        : JSON.stringify(requestParams.body),
  })

  const responseTime = Date.now() - startTime
  let responseHeaders: Record<string, string> | undefined
  if (response.headers) {
    responseHeaders = {}
    for (const [key, value] of Object.entries(response.headers)) {
      responseHeaders[key] = value
    }
  }

  const responseBody = response.headers
    .get('Content-Type')
    ?.includes('application/json')
    ? await response.json()
    : await response.text()

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

type ProbeHTTPAxiosParams = {
  startTime: number
  renderedURL: string
  allowUnauthorized: boolean | undefined
  maxRedirects: number
  requestParams: {
    method: string | undefined
    headers: Headers | undefined
    timeout: number
    body?: BodyInit
    ping: boolean | undefined
  }
}

async function probeHttpAxios({
  startTime,
  renderedURL,
  requestParams,
  allowUnauthorized,
  maxRedirects,
}: ProbeHTTPAxiosParams): Promise<ProbeRequestResponse> {
  const resp = await sendHttpRequest({
    ...requestParams,
    allowUnauthorizedSsl: allowUnauthorized,
    keepalive: true,
    url: renderedURL,
    maxRedirects,
  })

  const responseTime = Date.now() - startTime
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
}

export function generateRequestChainingBody(
  body: object | string,
  responses: ProbeRequestResponse[]
): BodyInit {
  const isString = typeof body === 'string'
  const template = Handlebars.compile(isString ? body : JSON.stringify(body))
  const renderedBody = template({ responses })

  return isString ? renderedBody : JSON.parse(renderedBody)
}

function transformContentByType(
  content?: BodyInit,
  contentType?: string | number | boolean
) {
  if (!content) {
    return { content, contentType }
  }

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
        form.append(contentKey, (content as never)[contentKey])
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

// suppress switch-case complexity since this is dead-simple mapping to error code
// eslint-disable-next-line complexity
function getErrorStatusWithExplanation(error: unknown): {
  status: number
  description: string
} {
  switch ((error as AxiosError).code) {
    case 'ECONNABORTED': {
      return {
        status: 599,
        description:
          'ECONNABORTED: The connection was unexpectedly terminated, often due to server issues, network problems, or timeouts. Please check the server status or network connectivity and try again.',
      }
    } // https://httpstatuses.com/599

    case 'ENOTFOUND': {
      return {
        status: 0,
        description:
          "ENOTFOUND: The monitored website or server couldn't be found, similar to entering an incorrect web address or encountering a temporary network/server issue. Verify the URL and ensure the server is accessible.",
      }
    }

    case 'ECONNRESET': {
      return {
        status: 1,
        description:
          'ECONNRESET: The connection to a server was unexpectedly reset, often pointing to issues on the server side or network interruptions. Check the server status and network connection, and retry the request.',
      }
    }

    case 'ECONNREFUSED': {
      return {
        status: 2,
        description:
          'ECONNREFUSED: Attempted to connect to a server, but the server declined the connection. Ensure the server is running and accepting connections.',
      }
    }

    case 'ERR_FR_TOO_MANY_REDIRECTS': {
      return {
        status: 3,
        description:
          'ERR_FR_TOO_MANY_REDIRECTS: Webpage is stuck in a loop of continuously redirecting. Review the redirection rules and fix any redirect loops.',
      }
    }

    case 'ERR_BAD_OPTION_VALUE': {
      return {
        status: 4,
        description:
          'ERR_BAD_OPTION_VALUE: Invalid or inappropriate value is provided for an option. Check and correct the option values being passed.',
      }
    }

    case 'ERR_BAD_OPTION': {
      return {
        status: 5,
        description:
          'ERR_BAD_OPTION: Invalid or inappropriate option is used. Verify the options being used and correct them.',
      }
    }

    case 'ETIMEDOUT': {
      return {
        status: 6,
        description:
          'ETIMEDOUT: Connection attempt has timed out. Try increasing the timeout value or check the server response time.',
      }
    }

    case 'ERR_NETWORK': {
      return {
        status: 7,
        description:
          'ERR_NETWORK: Signals a general network-related issue such as poor connectivity, DNS issues, or firewall restrictions. Verify network connectivity and DNS settings, and ensure no firewall is blocking the connection.',
      }
    }

    case 'ERR_DEPRECATED': {
      return {
        status: 8,
        description:
          'ERR_DEPRECATED: Feature, method, or functionality used in the code is outdated or no longer supported. Update the code to use supported features or methods.',
      }
    }

    case 'ERR_BAD_RESPONSE': {
      return {
        status: 9,
        description:
          'ERR_BAD_RESPONSE: Server provides a response that cannot be understood or is considered invalid. Ensure the server is providing a valid response.',
      }
    }

    case 'ERR_BAD_REQUEST': {
      return {
        status: 11,
        description:
          "ERR_BAD_REQUEST: Client's request to the server is malformed or invalid. Review and correct the request parameters being sent to the server.",
      }
    }

    case 'ERR_CANCELED': {
      return {
        status: 12,
        description:
          'ERR_CANCELED: Request or operation is canceled before it completes. Check if the cancellation was intended or adjust the request flow.',
      }
    }

    case 'ERR_NOT_SUPPORT': {
      return {
        status: 13,
        description:
          'ERR_NOT_SUPPORT: Feature or operation is not supported. Use an alternative feature or operation that is supported.',
      }
    }

    case 'ERR_INVALID_URL': {
      return {
        status: 14,
        description:
          'ERR_INVALID_URL: URL is not formatted correctly or is not a valid web address. Verify and correct the URL being used.',
      }
    }

    case 'EAI_AGAIN': {
      return {
        status: 15,
        description:
          'EAI_AGAIN: Temporary failure in resolving a domain name. Retry the request after some time or check DNS settings.',
      }
    }

    case 'EHOSTUNREACH': {
      return {
        status: 16,
        description:
          'EHOSTUNREACH: The host is unreachable. Verify the network connection and ensure the host is accessible.',
      }
    }

    case 'EPROTO': {
      return {
        status: 17,
        description:
          "EPROTO: There are issues with the website's SSL/TLS certificates, incompatible protocols, or other SSL-related problems. Verify the SSL/TLS certificates and ensure compatible protocols are used.",
      }
    }

    case 'CERT_HAS_EXPIRED': {
      return {
        status: 18,
        description:
          "CERT_HAS_EXPIRED: The website's SSL/TLS certificates has expired. Renew the SSL/TLS certificates to resolve the issue.",
      }
    }

    case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE': {
      return {
        status: 27,
        description:
          'ELEAFSIGNATURE: Unable to verify the first/leaf certificate. Check the certificate chain and ensure all certificates are valid.',
      }
    }

    case 'ERR_TLS_CERT_ALTNAME_INVALID': {
      return {
        status: 28,
        description: `ERR_TLS_CERT_ALTNAME_INVALID: Invalid certificate altname. Verify the certificate's subject alternative names and correct any issues.`,
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
        description: `Error code 99: ${(error as AxiosError).stack}`,
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
