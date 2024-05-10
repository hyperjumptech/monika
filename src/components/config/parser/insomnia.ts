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

import type { Config } from '../../../interfaces/config'
import yml from 'js-yaml'
import { compile as compileTemplate } from 'handlebars'
import Joi from 'joi'

const envValidator = Joi.object({
  scheme: Joi.array().items(Joi.string()),
  host: Joi.string(),
  // eslint-disable-next-line camelcase
  base_path: Joi.string(),
})

const resourceValidator = Joi.object({
  _id: Joi.string(),
  authentication: Joi.object({
    type: Joi.string(),
    disabled: Joi.boolean(),
    prefix: Joi.string(),
  }),
  name: Joi.string(),
  data: envValidator,
  description: Joi.string().allow(''),
  url: Joi.string(),
  headers: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      value: Joi.string(),
      disabled: Joi.boolean(),
    })
  ),
  method: Joi.string(),
  body: Joi.object({ mimeType: Joi.string(), text: Joi.string() }),
  _type: Joi.string(),
})

const insomniaValidator = Joi.object({
  // eslint-disable-next-line camelcase
  __export_format: Joi.number(),
  // eslint-disable-next-line camelcase
  __export_source: Joi.string(),
  resources: Joi.array().items(resourceValidator),
})

let baseUrl = ''
let environmentVariables: object | undefined

export function parseInsomnia(configString: string, format: string): Config {
  const parseResult =
    format === 'yaml' || format === 'yml'
      ? yml.load(configString, { json: true })
      : JSON.parse(configString)

  const { error, value: insomniaData } = insomniaValidator.validate(
    parseResult,
    { allowUnknown: true }
  )

  if (error) throw new Error(error?.message)

  const data = insomniaData.resources
  if (
    data?.__export_format !== 4 &&
    (data?.__export_source as undefined | string)?.includes('insomnia')
  ) {
    throw new Error(
      'Failed to parse Insomnia collection, please use export format v4.'
    )
  }

  const env = data
    .reverse()
    .find(
      (res: {
        _type: string
        data: { scheme: string; host: string; base_path: string }
      }) =>
        res._type === 'environment' &&
        res.data?.scheme &&
        res.data?.host &&
        res.data?.base_path
    )?.data

  environmentVariables = env
  baseUrl = env
    ? `${env?.scheme?.[0] ?? 'http'}://${env?.host}${env?.base_path}`
    : ''

  return mapInsomniaToConfig(data)
}

function mapInsomniaToConfig(data: unknown): Config {
  const res = Joi.array()
    .items(resourceValidator)
    .validate(data, { allowUnknown: true }).value
  const insomniaRequests = res.filter(
    ({
      _type,
      url,
      body,
    }: {
      _type: string
      url: string
      body: { mimeType: string }
    }) =>
      _type === 'request' &&
      url &&
      // skip binary upload requests
      body?.mimeType !== 'application/octet-stream'
  )

  const probes = insomniaRequests.map((probe: unknown) =>
    mapInsomniaRequestToConfig(probe)
  )

  return { probes }
}

export function mapInsomniaRequestToConfig(req: unknown) {
  const { value: res } = resourceValidator.validate(req, { allowUnknown: true })
  // eslint-disable-next-line camelcase
  const url = compileTemplate(res.url)({ base_url: baseUrl })
  const authorization = getAuthorizationHeader(res)

  let headers: Headers | undefined
  if (authorization) headers = new Headers({ Authorization: authorization })
  if (res.headers) {
    if (headers === undefined) headers = new Headers()
    for (const h of res.headers) {
      headers.append(h.name, h.value)
    }
  }

  return {
    id: res._id,
    name: res.name,
    description: res.description,
    requests: [
      {
        url,
        method: res?.method ?? 'GET',
        body: JSON.parse(res.body?.text ?? '{}'),
        timeout: 10_000,
        headers,
      },
    ],
    interval: 30,
    alerts: [],
  }
}

export function getAuthorizationHeader(data: unknown): string | undefined {
  const { value: res } = resourceValidator.validate(data, {
    allowUnknown: true,
  })
  let authorization: string | undefined
  if (
    res.authentication?.type === 'bearer' &&
    (res.authentication?.disabled ?? false) === false
  ) {
    let authTemplate = res.authentication?.token as string | undefined
    authTemplate = authTemplate?.replace('_.', '')
    authorization = `${
      res.authentication?.prefix ?? 'bearer'
    } ${compileTemplate(authTemplate)(environmentVariables ?? {})}`
  }

  return authorization
}
