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

import type { MonikaFlags } from '../../flag'
import type { Config } from '../../interfaces/config'
import { log } from '../../utils/pino'
import { parseConfig } from './parse'
import { validateConfigWithSchema } from './validation'
import { validateConfig } from './validate'
import type { RequestConfig } from '../../interfaces/request'

export type ConfigType =
  | 'monika'
  | 'har'
  | 'insomnia'
  | 'postman'
  | 'sitemap'
  | 'text'

export async function getConfigFrom(flags: MonikaFlags): Promise<Config> {
  const defaultConfigs = await parseDefaultConfig(flags)

  const nonDefaultConfig = setDefaultNotifications(
    defaultConfigs,
    await getNonDefaultFlags(flags)
  )

  return mergeConfigs(defaultConfigs, nonDefaultConfig)
}

// mergeConfigs merges configs by overwriting each other
// with initial value taken from nonDefaultConfig
export function mergeConfigs(
  defaultConfigs: Partial<Config>[],
  nonDefaultConfig: Partial<Config>
): Config {
  if (defaultConfigs.length === 0 && nonDefaultConfig !== undefined) {
    return nonDefaultConfig as Config
  }

  // eslint-disable-next-line unicorn/no-array-reduce
  const mergedConfig = defaultConfigs.reduce((prev, current) => {
    return {
      ...prev,
      ...current,
      notifications: current.notifications || prev.notifications,
      probes: current.probes || prev.probes,
    }
  }, nonDefaultConfig || {})

  return mergedConfig as Config
}

export function addDefaultNotifications(
  config: Partial<Config>
): Partial<Config> {
  log.info('Notifications not found, using desktop as default...')
  return {
    ...config,
    notifications: [{ id: 'default', type: 'desktop', data: undefined }],
  }
}

async function parseDefaultConfig(
  flags: MonikaFlags
): Promise<Partial<Config>[]> {
  return Promise.all(
    flags.config.map((source) => parseConfigType(source, 'monika', flags))
  )
}

async function parseConfigType(
  source: string,
  configType: ConfigType,
  flags: MonikaFlags
): Promise<Partial<Config>> {
  const parsed = await parseConfig(source, configType, flags)

  // ensure that the parsed config meets our formatting
  const validatedConfig = await validateConfig(parsed)

  if (configType !== 'har') {
    const isValidConfig = validateConfigWithSchema(validatedConfig)
    if (!isValidConfig.valid) {
      throw new Error(isValidConfig.message)
    }
  }

  return {
    ...validatedConfig,
    probes: validatedConfig.probes?.map((probe) => {
      const requests: RequestConfig[] | undefined = probe?.requests?.map(
        (request) => ({
          ...request,
          timeout: request.timeout ?? 10_000,
        })
      )

      const interval = () => {
        if (typeof probe?.interval === 'number') return probe.interval

        if (!requests) {
          return 10
        }

        return requests.length * 10 === 0 ? 10 : requests.length * 10
      }

      return { ...probe, interval: interval(), requests }
    }),
  }
}

async function getNonDefaultFlags(
  flags: MonikaFlags
): Promise<Partial<Config>> {
  let result = {}

  if (flags.har) {
    result = await parseConfigType(flags.har, 'har', flags)
  } else if (flags.postman) {
    result = await parseConfigType(flags.postman, 'postman', flags)
  } else if (flags.insomnia) {
    result = await parseConfigType(flags.insomnia, 'insomnia', flags)
  } else if (flags.sitemap) {
    result = await parseConfigType(flags.sitemap, 'sitemap', flags)
  } else if (flags.text) {
    result = await parseConfigType(flags.text, 'text', flags)
  }

  return result
}

function setDefaultNotifications(
  defaultConfigs: Partial<Config>[],
  nonDefaultConfig: Partial<Config>
): Partial<Config> {
  const hasDefaultConfig = defaultConfigs.length > 0
  const hasNonDefaultConfig = Object.keys(nonDefaultConfig).length > 0

  if (!hasDefaultConfig && hasNonDefaultConfig) {
    return addDefaultNotifications(nonDefaultConfig)
  }

  return nonDefaultConfig
}
