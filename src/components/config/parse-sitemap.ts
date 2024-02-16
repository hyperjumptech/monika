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

import type { Config } from '../../interfaces/config.js'
import { XMLParser } from 'fast-xml-parser'
import { monikaFlagsDefaultValue } from '../../flag.js'
import type { MonikaFlags } from '../../flag.js'
import type { Probe, ProbeAlert } from '../../interfaces/probe.js'
import type { RequestConfig } from '../../interfaces/request.js'

const sitemapValidator = Joi.object({
  config: Joi.object({
    urlset: Joi.object({
      url: Joi.array().items(
        Joi.object({
          loc: Joi.string(),
          'xhtml:link': Joi.array().items(
            Joi.object({ '@_href': Joi.string() })
          ),
        })
      ),
    }),
  }),
})

const generateProbesFromXml = (parseResult: unknown) => {
  const { value } = sitemapValidator.validate(parseResult, {
    allowUnknown: true,
  })
  const probes = value?.urlset?.url?.map(
    (item: { loc: string; 'xhtml:link': { '@_href': string }[] }) => {
      const requests = [
        {
          url: item?.loc,
          method: 'GET',
          timeout: 10_000,
        },
      ]
      if (item['xhtml:link']) {
        for (const alt of item['xhtml:link']) {
          requests.push({
            url: alt['@_href'],
            method: 'GET',
            timeout: 10_000,
          })
        }
      }

      return {
        id: item?.loc,
        name: item?.loc,
        requests,
        alerts: [],
      }
    }
  )

  return probes ?? []
}

const generateProbesFromXmlOneProbe = (parseResult: unknown) => {
  let probe: Probe | undefined
  let requests: RequestConfig[] = []
  const config = sitemapValidator.validate(parseResult, {
    allowUnknown: true,
  }).value
  const resources = config?.urlset?.url
  for (const [, item] of resources.entries()) {
    requests = [
      ...requests,
      {
        url: item.loc,
        method: 'GET',
        timeout: 10_000,
        body: '',
      },
    ]
    if (item['xhtml:link']) {
      for (const alt of item['xhtml:link']) {
        requests = [
          ...requests,
          {
            url: alt['@_href'],
            method: 'GET',
            timeout: 10_000,
            body: '',
          },
        ]
      }
    }

    const url = new URL(item.loc)

    probe = {
      id: url.host,
      name: url.host,
      requests,
      interval: monikaFlagsDefaultValue['config-interval'],
      alerts: [
        {
          assertion: 'response.status < 200 or response.status > 299',
          message: 'HTTP Status is not 200',
        },
        {
          assertion: 'response.time > 2000',
          message: 'Response time is more than 2000ms',
        },
      ] as ProbeAlert[],
    }
  }

  return probe ? [probe] : []
}

export const parseConfigFromSitemap = (
  configString: string,
  flags?: MonikaFlags
): Config => {
  try {
    const parser = new XMLParser({ ignoreAttributes: false })
    const xmlObj = parser.parse(configString)
    let probes = generateProbesFromXml(xmlObj)
    if (flags && flags['one-probe.js']) {
      probes = generateProbesFromXmlOneProbe(xmlObj)
    }

    return { probes }
  } catch {
    throw new Error(
      'Your Sitemap file contains an invalid Sitemap XML format !'
    )
  }
}
