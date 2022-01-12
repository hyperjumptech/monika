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
import { Probe } from '../../interfaces/probe'
import { DEFAULT_THRESHOLD } from '../../looper'

let probes: Probe[] = []

const getConvertedProbeFromPostmanItem = (item: any) => {
  const req = item.request
  const probe: Probe = {
    id: item.name,
    name: item.name,
    requests: [
      {
        url: req.url.raw,
        method: req.method,
        headers: req?.header?.reduce(
          (obj: any, it: any) => Object.assign(obj, { [it.key]: it.value }),
          {}
        ),
        body: req?.body?.raw || JSON.parse('{}'),
        timeout: 10000,
      },
    ],
    incidentThreshold: DEFAULT_THRESHOLD,
    recoveryThreshold: DEFAULT_THRESHOLD,
    alerts: [],
  }

  return probe
}

const parsePostmanItem = (item: any) => {
  if (item && item.length > 0) {
    item.forEach((child: any) => {
      if (!child.item) {
        probes.push(getConvertedProbeFromPostmanItem(child))
        return
      }

      parsePostmanItem(child.item)
    })
  }
}

export const parseConfigFromPostman = (configString: string): Config => {
  try {
    const parsed = JSON.parse(configString)
    probes = []

    parsePostmanItem(parsed.item)

    const configMonika: any = {
      probes,
    }

    return configMonika
  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      throw new Error('Postman file is in invalid JSON format!')
    }

    throw new Error(error.message)
  }
}
