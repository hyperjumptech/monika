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
import Joi from 'joi'
// eslint-disable-next-line no-restricted-imports
import * as qs from 'querystring'
import { type BodyInit, errors as undiciErrors } from 'undici'
import YAML from 'yaml'
import {
  type ProbeRequestResponse,
  type RequestConfig,
  probeRequestResult,
} from '../../../../interfaces/request.js'
import { getContext } from '../../../../context/index.js'
import { icmpRequest } from '../icmp/request.js'
import registerFakes from '../../../../utils/fakes.js'
import { sendHttpRequest } from '../../../../utils/http.js'
import { log } from '../../../../utils/pino.js'
import { getErrorMessage } from '../../../../utils/catch-error-handler.js'

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
    return await probeHttpFetch({
      startTime,
      maxRedirects: followRedirects,
      renderedURL,
      requestParams: { ...newReq, headers: requestHeaders },
      allowUnauthorized,
    })
  } catch (error: unknown) {
    const { value, error: undiciErrorValidator } =
      UndiciErrorValidator.validate(error, {
        allowUnknown: true,
      })
    const responseTime = Date.now() - startTime
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

type ProbeHttpFetchParameters = {
  startTime: number
  renderedURL: string
  allowUnauthorized: boolean | undefined
  maxRedirects: number
  requestParams: {
    method: string | undefined
    headers: Headers | undefined
    timeout: number
    body?: BodyInit
  }
}

async function probeHttpFetch({
  startTime,
  renderedURL,
  requestParams,
  allowUnauthorized,
  maxRedirects,
}: ProbeHttpFetchParameters): Promise<ProbeRequestResponse> {
  if (getContext().flags.verbose) {
    log.info(`Probing ${renderedURL}`)
  }

  const { headers, method, timeout, body } = requestParams
  const response = await sendHttpRequest({
    allowUnauthorizedSsl: allowUnauthorized,
    body: body
      ? typeof body === 'string'
        ? body
        : JSON.stringify(body)
      : undefined,
    headers,
    keepalive: true,
    maxRedirects,
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
  // Define a mapping of error types to their corresponding responses
  const errorMap = [
    {
      condition:
        error instanceof undiciErrors.BodyTimeoutError ||
        error instanceof undiciErrors.ConnectTimeoutError ||
        error instanceof undiciErrors.HeadersTimeoutError,
      response: {
        status: 6,
        error: 'ETIMEDOUT: Connection attempt has timed out.',
      },
    },
    {
      condition: error instanceof undiciErrors.RequestAbortedError,
      response: {
        status: 599,
        error:
          'ECONNABORTED: The connection was unexpectedly terminated, often due to server issues, network problems, or timeouts.',
      },
    },
    {
      condition:
        error instanceof undiciErrors.HeadersOverflowError ||
        error instanceof undiciErrors.ResponseExceededMaxSizeError,
      response: {
        status: 18,
        error: 'ECONNOVERFLOW: Header / response max size exceeded.',
      },
    },
    {
      condition: error instanceof undiciErrors.ResponseStatusCodeError,
      response: {
        status: 19,
        error: 'ERESPONSESTATUSCODE: HTTP status code returns >= 400.',
      },
    },
    {
      condition: error instanceof undiciErrors.InvalidArgumentError,
      response: {
        status: 20,
        error: 'EINVALIDARGUMENT: Invalid HTTP arguments.',
      },
    },
    {
      condition: error instanceof undiciErrors.InvalidReturnValueError,
      response: {
        status: 21,
        error: 'EINVALIDRETURN: Unexpected HTTP response to handle.',
      },
    },
    {
      condition:
        error instanceof undiciErrors.ClientClosedError ||
        error instanceof undiciErrors.ClientDestroyedError ||
        error instanceof undiciErrors.SocketError,
      response: {
        status: 22,
        error: 'ECONNCLOSED: HTTP client closed unexpectedly.',
      },
    },
    {
      condition: error instanceof undiciErrors.NotSupportedError,
      response: {
        status: 23,
        error: 'ESUPPORT: Unsupported HTTP functionality.',
      },
    },
    {
      condition:
        error instanceof undiciErrors.RequestContentLengthMismatchError ||
        error instanceof undiciErrors.ResponseContentLengthMismatchError,
      response: {
        status: 24,
        error:
          'ECONTENTLENGTH: Request / response content length mismatch with Content-Length header value.',
      },
    },
    {
      condition: error instanceof undiciErrors.BalancedPoolMissingUpstreamError,
      response: {
        status: 25,
        error: 'EMISSINGPOOL: Missing HTTP client pool.',
      },
    },
    {
      condition: error instanceof undiciErrors.InformationalError,
      response: {
        status: 26,
        error: `EINFORMATIONAL: ${error.message}.`,
      },
    },
    {
      condition: error.code === 'CERT_HAS_EXPIRED',
      response: {
        status: 18,
        error: 'CERT_HAS_EXPIRED: SSL certificate of the website has expired.',
      },
    },
    {
      condition: error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT',
      response: {
        status: 27,
        error:
          'DEPTH_ZERO_SELF_SIGNED_CERT: Website is using a self-signed certificate',
      },
    },
    {
      condition: error.code === 'ERR_TLS_CERT_ALTNAME_INVALID',
      response: {
        status: 28,
        error: `ERR_TLS_CERT_ALTNAME_INVALID: ${
          error.message.split('Error: ')[1]
        }`,
      },
    },
    {
      condition: error.code === 'SELF_SIGNED_CERT_IN_CHAIN',
      response: {
        status: 27,
        error:
          'SELF_SIGNED_CERT_IN_CHAIN: Website is using a self-signed certificate in certificate chain.',
      },
    },
  ]

  // Find the matching error response
  const matchedError = errorMap.find((entry) => entry.condition)

  // Return the matched response or a default response
  if (matchedError) {
    return {
      data: '',
      body: '',
      headers: '',
      responseTime,
      result: probeRequestResult.failed,
      ...matchedError.response,
    }
  }

  // Default response for unmatched errors
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
