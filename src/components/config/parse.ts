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
import { parseConfigFromPostman } from './parse-postman'
import { parseHarFile } from './parse-har'
import path from 'path'
import yml from 'js-yaml'
import parseInsomnia from './parse-insomnia'
import isUrl from 'is-url'
import { fetchConfig } from './fetch'

export const parseConfig = async (
  source: string,
  type: string
): Promise<Partial<Config>> => {
  try {
    const configString = isUrl(source)
      ? await fetchConfig(source)
      : readFileSync(source, 'utf-8')

    if (configString.length === 0)
      throw new Error(`Failed to read ${source}, got empty.`)
    const ext = path.extname(source)

    if (type === 'har') return parseHarFile(configString)
    if (type === 'postman') return parseConfigFromPostman(configString)
    if (type === 'insomnia')
      return parseInsomnia(configString, ext.replace('.', ''))

    if (ext === '.yml' || ext === '.yaml') {
      const cfg = yml.load(configString, { json: true })
      return cfg as unknown as Config
    }

    return JSON.parse(configString)
  } catch (error: any) {
    if (error.code === 'ENOENT' && error.path === source) {
      throw new Error(`Configuration file not found: ${source}.`)
    }

    if (error.name === 'SyntaxError') {
      throw new Error('JSON configuration file is in invalid JSON format!')
    }

    throw new Error(error.message)
  }
}
