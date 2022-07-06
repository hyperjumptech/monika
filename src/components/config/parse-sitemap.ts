/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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
import { DEFAULT_THRESHOLD } from '../../looper'
import { XMLParser } from 'fast-xml-parser'

const generateProbesFromXml = (config: any) => {
  const probes = config?.urlset?.url?.map((item: any) => {
    return {
      id: item?.loc,
      name: item?.loc,
      requests: [
        {
          url: item?.loc,
          method: 'GET',
          timeout: 10_000,
        },
      ],
      incidentThreshold: DEFAULT_THRESHOLD,
      recoveryThreshold: DEFAULT_THRESHOLD,
      alerts: [],
    }
  })

  return probes ?? []
}

export const parseConfigFromSitemap = (configString: string): Config => {
  try {
    const parser = new XMLParser()
    const xmlObj = parser.parse(configString)
    const probes = generateProbesFromXml(xmlObj)

    return { probes }
  } catch (error: any) {
    throw new Error('Your Sitemap file contains an invalid Sitemap XML format!')
  }
}
