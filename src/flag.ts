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

import fs from 'node:fs'
import path from 'node:path'

import { Flags } from '@oclif/core'

export enum SYMON_API_VERSION {
  'v1' = 'v1',
  'v2' = 'v2',
}

export type MonikaFlags = {
  'auto-update'?: string
  config: string[]
  'config-filename': string
  'config-interval': number
  'create-config': boolean
  'native-fetch': boolean
  flush: boolean
  'follow-redirects': number
  force: boolean
  har?: string
  id?: string
  insomnia?: string
  json?: boolean
  'keep-verbose-logs': boolean
  logs: boolean
  'one-probe': boolean
  output: string
  postman?: string
  prometheus?: number
  repeat: number
  retryInitialDelayMs: number
  retryMaxDelayMs: number
  sitemap?: string
  'status-notification'?: string
  stun: number
  summary: boolean
  'symon-api-version': SYMON_API_VERSION
  symonKey?: string
  symonLocationId?: string
  symonMonikaId?: string
  symonReportInterval: number
  symonReportLimit: number
  symonGetProbesIntervalMs: number
  symonUrl?: string
  text?: string
  ignoreInvalidTLS: boolean
  verbose: boolean
  version: void
}

export const monikaFlagsDefaultValue: MonikaFlags = {
  config: getDefaultConfig(),
  'config-filename': 'monika.yml',
  'config-interval': 900,
  'create-config': false,
  'native-fetch': false,
  flush: false,
  'follow-redirects': 21,
  force: false,
  ignoreInvalidTLS: false,
  'keep-verbose-logs': false,
  logs: false,
  'one-probe': false,
  output: 'monika.yml',
  repeat: 0,
  retryInitialDelayMs: 2000,
  retryMaxDelayMs: 30_000,
  // default is 20s interval lookup
  stun: 20,
  summary: false,
  'symon-api-version': SYMON_API_VERSION.v1,
  symonGetProbesIntervalMs: Number.parseInt(
    process.env.FETCH_PROBES_INTERVAL ?? '60000',
    10
  ),
  symonReportInterval: 10_000,
  symonReportLimit: 100,
  verbose: false,
  version: undefined,
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

export const flags = {
  'auto-update': Flags.string({
    description:
      'Enable auto-update for Monika. Available options: major, minor, patch. This will make Monika terminate itself on successful update but does not restart',
  }),
  config: Flags.string({
    char: 'c',
    default: monikaFlagsDefaultValue.config,
    description:
      'JSON configuration filename or URL. If none is supplied, will look for monika.yml in the current directory',
    env: 'MONIKA_JSON_CONFIG',
    multiple: true,
  }),

  'config-filename': Flags.string({
    default: monikaFlagsDefaultValue['config-filename'],
    dependsOn: ['config'],
    description:
      'The configuration filename for config file created if there is no config file found ',
  }),

  'config-interval': Flags.integer({
    default: monikaFlagsDefaultValue['config-interval'],
    dependsOn: ['config'],
    description:
      'The interval (in seconds) for periodic config checking if url is used as config source',
  }),

  'create-config': Flags.boolean({
    description:
      'Create config from HAR (-H), postman (-p), insomnia (-I), sitemap (--sitemap), textfile (--text) export file, or open Monika Configuration Generator using default browser',
  }),

  'native-fetch': Flags.boolean({
    default: monikaFlagsDefaultValue['native-fetch'],
    description:
      'Use native fetch Node.js API instead of Axios for HTTP client',
  }),

  flush: Flags.boolean({
    description: 'Flush logs',
  }),

  'follow-redirects': Flags.integer({
    default: monikaFlagsDefaultValue['follow-redirects'],
    description:
      'Monika will follow redirects as many times as the specified value here. By default, Monika will follow redirects once. To disable redirects following, set the value to zero.',
  }),

  force: Flags.boolean({
    default: false,
    description: 'Force commands with a yes whenever Y/n is prompted.',
  }),

  har: Flags.string({
    char: 'H', // (H)ar file to
    description: 'Run Monika using a HAR file',
    exclusive: ['postman', 'insomnia', 'sitemap', 'text'],
    multiple: false,
  }),

  help: Flags.help({ char: 'h' }),

  id: Flags.string({
    char: 'i', // (i)ds to run
    description: 'Define specific probe ids to run',
    multiple: false,
  }),

  ignoreInvalidTLS: Flags.boolean({
    description:
      'Configures whether HTTPS requests should ignore invalid certificates',
    default: false,
  }),

  insomnia: Flags.string({
    char: 'I', // (I)nsomnia file to
    description: 'Run Monika using an Insomnia json/yaml file',
    exclusive: ['har', 'postman', 'sitemap', 'text'],
    multiple: false,
  }),

  'keep-verbose-logs': Flags.boolean({
    default: false,
    description: 'Store all requests logs to database',
  }),

  logs: Flags.boolean({
    char: 'l', // prints the (l)ogs
    description: 'Print all logs.',
  }),

  'one-probe': Flags.boolean({
    dependsOn: ['sitemap'],
    description: 'One Probe',
  }),

  output: Flags.string({
    char: 'o', // (o)utput file to write config to
    description: 'Write monika config file to this file',
    multiple: false,
  }),

  postman: Flags.string({
    char: 'p', // (p)ostman
    description: 'Run Monika using a Postman json file.',
    exclusive: ['har', 'insomnia', 'sitemap', 'text'],
    multiple: false,
  }),

  prometheus: Flags.integer({
    description:
      'Specifies the port the Prometheus metric server is listening on. e.g., 3001. (EXPERIMENTAL)',
    exclusive: ['r'],
  }),

  repeat: Flags.integer({
    char: 'r', // (r)epeat
    default: 0,
    description: 'Repeats the test run n times',
    multiple: false,
  }),

  retryInitialDelayMs: Flags.integer({
    default: monikaFlagsDefaultValue.retryInitialDelayMs,
    description: `The initial, first delay of the backoff retry when probe request is failed, in milliseconds. Defaults to ${monikaFlagsDefaultValue.retryInitialDelayMs}ms`,
  }),

  retryMaxDelayMs: Flags.integer({
    default: monikaFlagsDefaultValue.retryMaxDelayMs,
    description: `Maximum backoff retry delay, in milliseconds. Defaults to ${monikaFlagsDefaultValue.retryMaxDelayMs}ms.`,
  }),

  sitemap: Flags.string({
    description: 'Run Monika using a Sitemap xml file.',
    exclusive: ['har', 'insomnia', 'postman', 'text'],
    multiple: false,
  }),

  'status-notification': Flags.string({
    description: 'Cron syntax for status notification schedule',
  }),

  stun: Flags.integer({
    char: 's', // (s)stun
    default: monikaFlagsDefaultValue.stun,
    description: 'Interval in seconds to check STUN server',
    multiple: false,
  }),

  summary: Flags.boolean({
    default: false,
    description: 'Display a summary of monika running stats',
  }),

  'symon-api-version': Flags.custom<SYMON_API_VERSION>({
    default: SYMON_API_VERSION.v1,
    description:
      'Symon API version to use. Available options: v1, v2. Default: v1',
    options: [SYMON_API_VERSION.v1, SYMON_API_VERSION.v2],
  })(),

  symonKey: Flags.string({
    dependsOn: ['symonUrl'],
    description: 'API Key for Symon',
  }),

  symonGetProbesIntervalMs: Flags.integer({
    default: monikaFlagsDefaultValue.symonGetProbesIntervalMs,
    description: `To determine how often Monika sends a request to Symon to get probe data, in milliseconds. Defaults to ${monikaFlagsDefaultValue.symonGetProbesIntervalMs}ms`,
  }),

  symonLocationId: Flags.string({
    dependsOn: ['symonKey', 'symonUrl'],
    description: 'Location ID for Symon (optional)',
    required: false,
  }),

  symonMonikaId: Flags.string({
    dependsOn: ['symonKey', 'symonUrl'],
    description: 'Monika ID for Symon (optional)',
    required: false,
  }),

  symonReportInterval: Flags.integer({
    dependsOn: ['symonKey', 'symonUrl'],
    description: 'Interval for reporting to Symon in milliseconds (optional)',
    required: false,
  }),

  symonReportLimit: Flags.integer({
    dependsOn: ['symonKey', 'symonUrl'],
    description: 'Data limit to be reported to Symon (optional)',
    required: false,
  }),

  symonUrl: Flags.string({
    dependsOn: ['symonKey'],
    description: 'URL of Symon',
    hidden: false,
  }),

  text: Flags.string({
    description: 'Run Monika using a Simple text file',
    exclusive: ['postman', 'insomnia', 'sitemap', 'har'],
    multiple: false,
  }),

  verbose: Flags.boolean({
    default: false,
    description: 'Show verbose log messages',
  }),

  version: Flags.version({ char: 'v' }),
}

export function sanitizeFlags(flags: Partial<MonikaFlags>): MonikaFlags {
  return { ...monikaFlagsDefaultValue, ...flags }
}
