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
import { readFileSync } from 'fs'
import { Probe } from '../../interfaces/probe'

const parseConfigFromPostman = (configString: string): Config => {
  try {
    const parsed = JSON.parse(configString)

    const convertedProbes = parsed.item.map((item: any) => {
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
        incidentThreshold: 2,
        recoveryThreshold: 2,
        alerts: [],
      }
      return probe
    })

    const configMonika: Config = {
      probes: convertedProbes,
    }

    return configMonika
  } catch (error) {
    throw new Error(error.message)
  }
}

export const parseConfig = (configPath: string, type: string): Config => {
  // Read file from configPath
  try {
    // Read file from configPath
    const configString = readFileSync(configPath, 'utf-8')

    // Parse the content
    if (type === 'postman') {
      return parseConfigFromPostman(configString)
    }

    return JSON.parse(configString)
  } catch (error) {
    if (error.code === 'ENOENT' && error.path === configPath) {
      throw new Error(
        'Configuration file not found. By default, Monika looks for monika.json configuration file in the current directory.\n\nOtherwise, you can also specify a configuration file using -c flag as follows:\n\nmonika -c <path_to_configuration_file>\n\nYou can create a configuration file via web interface by opening this web app: https://hyperjumptech.github.io/monika-config-generator/'
      )
    }

    if (error.name === 'SyntaxError') {
      throw new Error('JSON configuration file is in invalid JSON format!')
    }

    throw new Error(error.message)
  }
}
