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
import { sendHttpRequestFetch } from '../../../../utils/http'
import { log } from '../../../../utils/pino'
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

    return await probeHttpFetch({
      startTime,
      maxRedirects: followRedirects,
      renderedURL,
      requestParams: { ...newReq, headers: requestHeaders },
      allowUnauthorized,
    })
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime

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
