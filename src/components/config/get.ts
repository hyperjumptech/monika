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

import { getContext } from '../../context/index.js'
import type { Config } from '../../interfaces/config.js'
import { log } from '../../utils/pino.js'
import { parseByType } from './parser/parse.js'

export async function getRawConfig(): Promise<Config> {
  const nativeConfig = await parseNativeConfig()
  const nonNativeConfig = await parseNonNativeConfig()
  const config = mergeConfigs(
    nonNativeConfig ? [...nativeConfig, nonNativeConfig] : nativeConfig
  )
  const hasNotification =
    config.notifications !== undefined && config.notifications.length > 0

  if (!hasNotification) {
    log.info('Notifications not found, using desktop as default.')
    return addDefaultNotifications(config)
  }

  return config
}

// mergeConfigs merges configs by overwriting each other
// with initial value taken from nonNativeConfig
function mergeConfigs(configs: Config[]): Config {
  let mergedConfig = configs[0]

  for (const config of configs.splice(1)) {
    const hasNotification =
      config.notifications && config.notifications.length > 0
    const hasProbe = config.probes && config.probes.length > 0

    mergedConfig = {
      ...mergedConfig,
      ...config,
      notifications: hasNotification
        ? config.notifications
        : mergedConfig.notifications,
      probes: hasProbe ? config.probes : mergedConfig.probes,
    }
  }

  return mergedConfig
}

export function addDefaultNotifications(config: Config): Config {
  return {
    ...config,
    notifications: [
      {
        id: 'default',
        type: 'desktop',
      },
    ],
  }
}

async function parseNativeConfig(): Promise<Config[]> {
  const { flags } = getContext()

  return Promise.all(
    flags.config.map((source) => parseByType(source, 'monika'))
  )
}

async function parseNonNativeConfig(): Promise<Config | undefined> {
  const { flags } = getContext()
  const hasNonNativeConfig =
    flags.har || flags.insomnia || flags.postman || flags.sitemap || flags.text

  if (!hasNonNativeConfig) {
    return
  }

  if (flags.har) {
    return parseByType(flags.har, 'har')
  }

  if (flags.postman) {
    return parseByType(flags.postman, 'postman')
  }

  if (flags.insomnia) {
    return parseByType(flags.insomnia, 'insomnia')
  }

  if (flags.sitemap) {
    return parseByType(flags.sitemap, 'sitemap')
  }

  if (flags.text) {
    return parseByType(flags.text, 'text')
  }
}
