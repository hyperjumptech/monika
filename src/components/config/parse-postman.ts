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

import type { Config } from '../../interfaces/config'

type CollectionVersion = 'v2.0' | 'v2.1'

const getCollectionVersion = (config: any) => {
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

const generateBody = (body: any, mode: string, rawType?: string) => {
  switch (mode) {
    case 'formdata':
    case 'urlencoded': {
      return {
        body: body?.reduce(
          (obj: any, it: any) => Object.assign(obj, { [it.key]: it.value }),
          {}
        ),
      }
    }

    case 'raw': {
      if (rawType === 'json') return { body: JSON.parse(body) }
      return { body }
    }

    default: {
      return {}
    }
  }
}

const generateEachRequest = (request: any, version: CollectionVersion) => {
  const mode = request?.body?.mode
  const body = mode ? request?.body[mode] : {}
  const language = request?.body?.options?.raw?.language

  return {
    url: version === 'v2.0' ? request?.url : request?.url.raw,
    method: request?.method,
    headers: {
      ...request?.header?.reduce(
        (obj: any, it: any) => Object.assign(obj, { [it.key]: it.value }),
        {}
      ),
      ...generateHeaderContentType(mode, language),
    },
    timeout: 10_000,
    ...generateBody(body, mode, language),
  }
}

const generateRequests = (item: any, version: CollectionVersion) => {
  const subitems = item?.item

  if (subitems?.length > 0) {
    return subitems?.map((subitem: any) =>
      generateEachRequest(subitem?.request, version)
    )
  }

  return [generateEachRequest(item?.request, version)]
}

const generateProbesFromConfig = (config: any, version: CollectionVersion) => {
  const probes = config?.item?.map((item: any) => ({
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
