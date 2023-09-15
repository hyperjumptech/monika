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

import fs from 'fs'
import path from 'path'

export type MonikaFlags = {
  'auto-update'?: string
  config: string[]
  'config-filename': string
  'config-interval': number
  'create-config': boolean
  flush: boolean
  'follow-redirects': number
  force: boolean
  har?: string
  help: boolean
  id?: string
  insomnia?: string
  json?: boolean
  'keep-verbose-logs': boolean
  logs: boolean
  'max-start-delay': number
  'one-probe': boolean
  output?: string
  postman?: string
  prometheus?: number
  repeat: number
  sitemap?: string
  'status-notification'?: string
  stun: number
  summary: boolean
  symonKey?: string
  symonLocationId?: string
  symonMonikaId?: string
  symonReportInterval?: number
  symonReportLimit?: number
  symonUrl?: string
  text?: string
  verbose: boolean
  version: void
  'symon-experimental-probe-splitting'?: boolean
}

const seconds = 1000
const minutes = 60 * seconds
export const monikaFlagsDefaultValue: Pick<
  MonikaFlags,
  | 'config'
  | 'config-filename'
  | 'config-interval'
  | 'follow-redirects'
  | 'max-start-delay'
  | 'stun'
> = {
  config: getDefaultConfig(),
  'config-filename': 'monika.yml',
  'config-interval': 900,
  'follow-redirects': 21, // axios default https://github.com/axios/axios
  'max-start-delay': 1 * Number(minutes),
  // default is 20s interval lookup
  stun: 20,
}

function getDefaultConfig(): Array<string> {
  const filesArray = fs.readdirSync(path.dirname('../'))
  const monikaDotJsonFile = filesArray.find((x) => x === 'monika.json')
  const monikaDotYamlFile = filesArray.find(
    (x) => x === 'monika.yml' || x === 'monika.yaml'
  )
  const defaultConfig = monikaDotYamlFile || monikaDotJsonFile

  return defaultConfig ? [defaultConfig] : []
}
