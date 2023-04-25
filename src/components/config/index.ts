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

import chokidar from 'chokidar'
import { CliUx } from '@oclif/core'
import { existsSync, writeFileSync } from 'fs'
import isUrl from 'is-url'
import pEvent from 'p-event'

import events from '../../events'
import { Config } from '../../interfaces/config'
import { monikaFlagsDefaultValue } from '../../context/monika-flags'
import type { MonikaFlags } from '../../context/monika-flags'
import { getEventEmitter } from '../../utils/events'
import { md5Hash } from '../../utils/hash'
import { open } from '../../utils/open-website'
import { log } from '../../utils/pino'
import { parseConfig } from './parse'
import { validateConfig } from './validate'
import { createConfigFile } from './create-config'
import yml from 'js-yaml'
import { exit } from 'process'
import {
  type ConfigType,
  addDefaultNotifications,
  getConfigFrom,
  mergeConfigs,
} from './get'

type ScheduleRemoteConfigFetcherParams = {
  configType: ConfigType
  interval: number
  url: string
  index?: number
}

type WatchConfigFileParams = {
  path: string
  type: string
  index?: number
  repeat?: number
}

const isTestEnvironment = process.env.CI || process.env.NODE_ENV === 'test'
const emitter = getEventEmitter()

let cfg: Config
let defaultConfigs: Partial<Config>[]
let nonDefaultConfig: Partial<Config>

export const getConfig = (skipConfigCheck = true): Config => {
  if (!skipConfigCheck && !cfg)
    throw new Error('Configuration setup has not been run yet')
  return cfg
}

export async function* getConfigIterator(
  skipConfigCheck = true
): AsyncGenerator<Config, void, undefined> {
  if (!skipConfigCheck && !cfg)
    throw new Error('Configuration setup has not been run yet')

  yield cfg

  if (!isTestEnvironment) {
    yield* pEvent.iterator<string, Config>(emitter, events.config.updated)
  }
}

export const updateConfig = async (
  config: Config,
  validate = true
): Promise<void> => {
  log.info('Updating config')
  if (validate) {
    try {
      await validateConfig(config)
    } catch (error: any) {
      if (isTestEnvironment) {
        // return error during tests
        throw new Error(error.message)
      }

      log.error(error?.message)
      exit(1)
    }
  }

  const lastConfigVersion = cfg?.version
  cfg = config
  cfg.version = cfg.version || md5Hash(cfg)
  if (lastConfigVersion !== undefined && lastConfigVersion !== cfg.version) {
    emitter.emit(events.config.updated, cfg)
    log.warn('config file update detected')
  }
}

export const setupConfig = async (flags: MonikaFlags): Promise<void> => {
  const sanitizedFlags = await sanitizeFlags(flags)
  const config = await getConfigFrom(sanitizedFlags)

  watchConfigsChange(sanitizedFlags)

  await updateConfig(config)
}

async function sanitizeFlags(flags: MonikaFlags): Promise<MonikaFlags> {
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
        interval:
          flags['config-interval'] ||
          monikaFlagsDefaultValue['config-interval'],
        repeat: flags.repeat,
        source,
        type: 'monika',
        index,
      })
    )
  )
}

type WatchConfigChangeParams = {
  interval: number
  repeat: number
  source: string
  type: ConfigType
  index?: number
}

function watchConfigChange({
  interval,
  repeat,
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
    path: source,
    type,
    index,
    repeat,
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
    } catch (error: any) {
      log.error(error?.message)
    }
  }, interval * 1000)
}

function watchConfigFile({ path, type, index, repeat }: WatchConfigFileParams) {
  const isWatchConfigFile = !(isTestEnvironment || repeat !== 0)
  if (isWatchConfigFile) {
    const watcher = chokidar.watch(path)
    watcher.on('change', async () => {
      const newConfig = await parseConfig(path, type)
      if (index === undefined) {
        nonDefaultConfig = newConfig
      } else {
        defaultConfigs[index] = newConfig
      }

      await updateConfig(mergeConfigs(defaultConfigs, nonDefaultConfig))
    })
  }
}

const getPathAndTypeFromFlag = (flags: MonikaFlags) => {
  // TODO: Assuming the first index of config is the primary config
  let path = flags.config?.[0]
  let type = 'monika'

  if (flags.postman) {
    path = flags.postman
    type = 'postman'
  }

  if (flags.har) {
    path = flags.har
    type = 'har'
  }

  if (flags.insomnia) {
    path = flags.insomnia
    type = 'insomnia'
  }

  if (flags.sitemap) {
    path = flags.sitemap
    type = 'sitemap'
  }

  if (flags.text) {
    path = flags.text
    type = 'text'
  }

  return {
    path,
    type,
  }
}

export const createConfig = async (flags: MonikaFlags): Promise<void> => {
  if (
    !flags.har &&
    !flags.postman &&
    !flags.insomnia &&
    !flags.sitemap &&
    !flags.text
  ) {
    log.info(
      'Opening Monika Configuration Generator in your default browser...'
    )
    open('https://hyperjumptech.github.io/monika-config-generator/')
  } else {
    const { path, type } = getPathAndTypeFromFlag(flags)

    if (!existsSync(path)) {
      log.error(`Couldn't found the ${path} file.`)
      return
    }

    const parse = await parseConfig(path, type, flags)
    const result = addDefaultNotifications(parse)
    const file = flags.output || 'monika.yml'

    if (existsSync(file) && !flags.force) {
      const ans = await CliUx.ux.prompt(
        `\n${file} file is already exists. Overwrite (Y/n)?`
      )

      if (ans.toLowerCase() !== 'y') {
        log.warn(
          `Command cancelled. You can use the -o flag to specify an output file or --force to overwrite without prompting.`
        )
        return
      }
    }

    const yamlDoc = yml.dump(result)
    writeFileSync(file, yamlDoc, 'utf8')
    log.info(`${file} file has been created.`)
  }
}
