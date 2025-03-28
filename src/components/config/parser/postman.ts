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

import Joi from 'joi'
import type { Config } from '../../../interfaces/config.js'

type CollectionVersion = 'v2.0' | 'v2.1'

const getCollectionVersion = (
  config: { info: { schema: string } } | undefined
) => {
  if (config?.info?.schema?.includes('v2.0')) {
    return 'v2.0'
  }

  if (config?.info?.schema?.includes('v2.1')) {
    return 'v2.1'
  }

  throw new Error('UnsupportedVersion')
}

const generateHeaderContentType = (mode: string, rawType?: string) => {
  switch (mode) {
    case 'formdata': {
      return { 'Content-Type': 'multipart/form-data' }
    }

    case 'urlencoded': {
      return { 'Content-Type': 'application/x-www-form-urlencoded' }
    }

    case 'raw': {
      if (rawType === 'json') return { 'Content-Type': 'application/json' }
      return { 'Content-Type': 'text/plain' }
    }

    default: {
      return {}
    }
  }
}

const generateBody = (
  body: Record<string, string>[] | string,
  mode: string | undefined,
  rawType?: string
) => {
  switch (mode) {
    case 'formdata':
    case 'urlencoded': {
      return {
        body: (body as Record<string, string>[])?.reduce(
          (obj, it) => Object.assign(obj, { [it.key]: it.value }),
          {}
        ),
      }
    }

    case 'raw': {
      if (rawType === 'json') return { body: JSON.parse(body as string) }
      return { body }
    }

    default: {
      return {}
    }
  }
}

const generateEachRequest = (
  request:
    | {
        header?: Record<string, string>[]
        body: {
          mode: 'formdata' | 'raw'
          formdata: Record<string, string>[] | undefined
          raw: string | undefined
          options: { raw: { language: string } }
        }
        url: { raw: string }
        method: string
      }
    | undefined,
  version: CollectionVersion
) => {
  const mode = request?.body?.mode
  let body = mode ? request?.body?.[mode] : undefined
  const language = request?.body?.options?.raw?.language
  body = body ? generateBody(body, mode, language).body : {}

  return {
    url: version === 'v2.0' ? request?.url : request?.url.raw,
    method: request?.method,
    headers: {
      ...request?.header?.reduce(
        (obj, it) => Object.assign(obj, { [it.key]: it.value }),
        {}
      ),
      ...generateHeaderContentType(mode || '', language),
    },
    timeout: 10_000,
    body,
  }
}

type ItemExport = {
  name: string
  request:
    | {
        header?: Record<string, string>[]
        body: {
          mode: 'formdata' | 'raw'
          formdata: Record<string, string>[] | undefined
          raw: string | undefined
          options: { raw: { language: string } }
        }
        url: { raw: string }
        method: string
      }
    | undefined
  item: ItemExport[] | undefined
}

const generateRequests = (item: ItemExport, version: CollectionVersion) => {
  const subitems = item?.item

  if ((subitems?.length || 0) > 0) {
    return subitems?.map((subitem) =>
      generateEachRequest(subitem?.request, version)
    )
  }

  return [generateEachRequest(item?.request, version)]
}

const requestValidator = Joi.object({
  header: Joi.array().items(Joi.object()),
  body: Joi.object({
    mode: Joi.string().allow('formdata', 'raw'),
    formdata: Joi.object(),
    raw: Joi.string(),
    options: Joi.object({
      raw: Joi.object({ language: Joi.string() }),
    }),
  }),
  url: Joi.string(),
  method: Joi.string(),
})

const postmanValidator = Joi.object({
  name: Joi.string(),
  request: requestValidator,
  item: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      item: Joi.object({
        request: requestValidator,
      }),
    })
  ),
})

const generateProbesFromConfig = (
  parseResult: unknown,
  version: CollectionVersion
) => {
  const { value: config } = postmanValidator.validate(parseResult, {
    allowUnknown: true,
  })
  const probes = config?.item?.map((item: ItemExport) => ({
    id: item?.name,
    name: item?.name,
    requests: generateRequests(item, version),
    alerts: [],
  }))

  return probes ?? []
}

export const parseConfigFromPostman = (configString: string): Config => {
  try {
    const config = JSON.parse(configString)
    const version = getCollectionVersion(config)
    const probes = generateProbesFromConfig(config, version)

    return { probes }
  } catch (error: unknown) {
    const parsingError =
      error instanceof Error ? error : new Error(`Parsing failed: ${error}`)
    if (parsingError.name === 'SyntaxError') {
      throw new Error('Your Postman file contains an invalid JSON format!')
    }

    if (parsingError.message === 'UnsupportedVersion') {
      throw new Error(
        'Your Postman collection version is not supported. Please use v2.0 or v2.1!'
      )
    }

    throw new Error(parsingError.message)
  }
}
