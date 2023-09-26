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

import { Config } from '../../interfaces/config'
import yml from 'js-yaml'
import { Probe } from '../../interfaces/probe'
import { DEFAULT_THRESHOLD } from '../../looper'
import { compile } from 'handlebars'
import { AxiosRequestHeaders, Method } from 'axios'

interface InsomniaResource {
  _id: string
  authentication: any
  name: string
  data?: any
  description?: string
  url?: string
  headers?: any
  method?: string
  body?: any
  _type: string
}

let baseUrl = ''
let environmentVariables: any | undefined

export default function parseInsomnia(
  configString: string,
  format: string
): Config {
  const insomniaData =
    format === 'yaml' || format === 'yml'
      ? (yml.load(configString, { json: true }) as InsomniaResource[])
      : JSON.parse(configString)

  validateInsomniaExport(insomniaData)
  const data: InsomniaResource[] = insomniaData.resources
  const env = data
    .reverse()
    .find(
      (d) =>
        d._type === 'environment' &&
        d.data?.scheme &&
        d.data?.host &&
        d.data?.base_path
    )

  environmentVariables = env?.data
  setBaseUrl(environmentVariables)

  return mapInsomniaToConfig(data)
}

function validateInsomniaExport(data: any) {
  if (
    data?.__export_format !== 4 &&
    (data?.__export_source as undefined | string)?.includes('insomnia')
  ) {
    throw new Error(
      'Failed to parse Insomnia collection, please use export format v4.'
    )
  }
}

function setBaseUrl(env?: any) {
  baseUrl = `${env?.scheme?.[0] ?? 'http'}://${env?.host}${env?.base_path}`
}

function mapInsomniaToConfig(data: InsomniaResource[]): Config {
  const insomniaRequests = data.filter(
    ({ _type, url, body }) =>
      _type === 'request' &&
      url &&
      // skip binary upload requests
      body?.mimeType !== 'application/octet-stream'
  )
  const probes = insomniaRequests.map<Probe>((probe) =>
    mapInsomniaRequestToConfig(probe)
  )

  return { probes }
}

function mapInsomniaRequestToConfig(res: InsomniaResource): Probe {
  // eslint-disable-next-line camelcase
  const url = compile(res.url)({ base_url: baseUrl })
  const authorization = getAuthorizationHeader(res)
  let headers: AxiosRequestHeaders | undefined
  if (authorization)
    headers = {
      authorization,
    }
  if (res.headers) {
    if (headers === undefined) headers = {}
    for (const h of res.headers) {
      headers[h.name] = h.value
    }
  }

  return {
    id: res._id,
    name: res.name,
    description: res.description,
    requests: [
      {
        url,
        method: (res?.method ?? 'GET') as Method,
        body: JSON.parse(res.body?.text ?? '{}'),
        timeout: 10_000,
        headers,
      },
    ],
    interval: 30,
    incidentThreshold: DEFAULT_THRESHOLD,
    recoveryThreshold: DEFAULT_THRESHOLD,
    alerts: [],
  }
}

function getAuthorizationHeader(res: InsomniaResource): string | undefined {
  let authorization: string | undefined
  if (
    res.authentication?.type === 'bearer' &&
    (res.authentication?.disabled ?? false) === false
  ) {
    let authTemplate = res.authentication?.token as string | undefined
    authTemplate = authTemplate?.replace('_.', '')
    authorization = `${res.authentication?.prefix ?? 'bearer'} ${compile(
      authTemplate
    )(environmentVariables ?? {})}`
  }

  return authorization
}
