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

import { watch } from 'chokidar'
import isUrl from 'is-url'

import events from '../../events'
import type { Config } from '../../interfaces/config'
import { getContext, setContext } from '../../context'
import type { MonikaFlags } from '../../flag'
import { getEventEmitter } from '../../utils/events'
import { md5Hash } from '../../utils/hash'
import { log } from '../../utils/pino'
import { parseConfig } from './parse'
import { validateConfig } from './validate'
import { createConfigFile } from './create-config'
import { exit } from 'process'
import { type ConfigType, getConfigFrom, mergeConfigs } from './get'
import { getProbes, setProbes } from './probe'
import { getErrorMessage } from '../../utils/catch-error-handler'

type ScheduleRemoteConfigFetcherParams = {
  configType: ConfigType
  interval: number
  url: string
  index?: number
}

type WatchConfigFileParams = {
  flags: MonikaFlags
  path: string
}

const emitter = getEventEmitter()

const defaultConfigs: Partial<Config>[] = []
let nonDefaultConfig: Partial<Config>

export const getConfig = (): Config => {
  const { config, flags } = getContext()

  if (!config) {
    if (!isSymonModeFrom(flags)) {
      throw new Error('Configuration setup has not been run yet')
    }

    return {
      probes: [],
    }
  }

  return { ...config, probes: getProbes() }
}

export const updateConfig = async (config: Config): Promise<void> => {
  log.info('Updating config')
  try {
    const validatedConfig = await validateConfig(config)
    const version = md5Hash(validatedConfig)
    const hasChangeConfig = getContext().config?.version !== version

    if (!hasChangeConfig) {
      return
    }

    const newConfig = addConfigVersion(validatedConfig)

    setContext({ config: newConfig })
    setProbes(newConfig.probes)
    emitter.emit(events.config.updated)
    log.info('Config file update detected')
  } catch (error: unknown) {
    const message = getErrorMessage(error)

    if (getContext().isTest) {
      // return error during tests
      throw new Error(message)
    }

    log.error(message)
    exit(1)
  }
}

export const setupConfig = async (flags: MonikaFlags): Promise<void> => {
  const validFlag = await createConfigIfEmpty(flags)
  const config = await getConfigFrom(validFlag)
  await updateConfig(config)

  watchConfigsChange(validFlag)
}

function addConfigVersion(config: Config) {
  if (config.version) {
    return config
  }

  const version = config.version || md5Hash(config)

  return { ...config, version }
}

async function createConfigIfEmpty(flags: MonikaFlags): Promise<MonikaFlags> {
  // check for default config path when -c/--config not provided
  const hasConfig =
    flags.config.length > 0 ||
    flags.har ||
    flags.postman ||
    flags.insomnia ||
    flags.sitemap ||
    flags.text

  if (!hasConfig) {
    log.info('No Monika configuration available, initializing...')
    const configFilename = await createConfigFile(flags)
    return { ...flags, config: [configFilename] }
  }

  return flags
}

async function watchConfigsChange(flags: MonikaFlags) {
  await Promise.all(
    flags.config.map((source, index) =>
      watchConfigChange({
        flags,
        interval: flags['config-interval'],
        source,
        type: 'monika',
        index,
      })
    )
  )
}

type WatchConfigChangeParams = {
  flags: MonikaFlags
  interval: number
  source: string
  type: ConfigType
  index?: number
}

function watchConfigChange({
  flags,
  interval,
  source,
  type,
  index,
}: WatchConfigChangeParams) {
  if (isUrl(source)) {
    scheduleRemoteConfigFetcher({
      configType: type,
      interval,
      url: source,
      index,
    })
    return
  }

  watchConfigFile({
    flags,
    path: source,
  })
}

function scheduleRemoteConfigFetcher({
  configType,
  interval,
  url,
  index,
}: ScheduleRemoteConfigFetcherParams) {
  setInterval(async () => {
    try {
      const newConfig = await parseConfig(url, configType)
      if (index === undefined) {
        nonDefaultConfig = newConfig
      } else {
        defaultConfigs[index] = newConfig
      }

      await updateConfig(mergeConfigs(defaultConfigs, nonDefaultConfig))
    } catch (error: unknown) {
      log.error(getErrorMessage(error))
    }
  }, interval * 1000)
}

function watchConfigFile({ flags, path }: WatchConfigFileParams) {
  const isWatchConfigFile = !(getContext().isTest || flags.repeat !== 0)
  if (isWatchConfigFile) {
    const watcher = watch(path)
    watcher.on('change', async () => {
      const config = await getConfigFrom(flags)

      await updateConfig(config)
    })
  }
}

export function isSymonModeFrom({
  symonKey,
  symonUrl,
}: Pick<MonikaFlags, 'symonKey' | 'symonUrl'>): boolean {
  return Boolean(symonUrl) && Boolean(symonKey)
}
