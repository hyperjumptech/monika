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
import { cli } from 'cli-ux'
import { existsSync, writeFileSync } from 'fs'
import isUrl from 'is-url'
import pEvent from 'p-event'

import events from '../../events'
import { Config } from '../../interfaces/config'
import { getEventEmitter } from '../../utils/events'
import { md5Hash } from '../../utils/hash'
import { open } from '../../utils/open-website'
import { log } from '../../utils/pino'
import { fetchConfig } from './fetch'
import { parseConfig } from './parse'
import { validateConfig } from './validate'

const emitter = getEventEmitter()

let cfg: Config
let configs: Partial<Config>[]

export const getConfig = (skipConfigCheck = true) => {
  if (!skipConfigCheck) {
    if (!cfg) throw new Error('Configuration setup has not been run yet')
  }
  return cfg
}

export async function* getConfigIterator(skipConfigCheck = true) {
  if (!skipConfigCheck) {
    if (!cfg) throw new Error('Configuration setup has not been run yet')
  }

  yield cfg

  if (!(process.env.CI || process.env.NODE_ENV === 'test')) {
    yield* pEvent.iterator<string, Config>(emitter, events.config.updated)
  }
}

export const updateConfig = async (config: Config, validate = true) => {
  log.debug('Updating config')
  if (validate) {
    const validated = validateConfig(config)
    if (!validated.valid) {
      throw new Error(validated.message)
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

const mergeConfigs = (): Config => {
  const mergedConfig = configs.reduce((prev, current) => {
    return { ...prev, ...current }
  })
  return mergedConfig as Config
}

const watchConfigFile = (
  path: string,
  type: string,
  index: number,
  repeat?: number
) => {
  const watchConfigFile = !(
    process.env.CI ||
    process.env.NODE_ENV === 'test' ||
    repeat !== undefined
  )
  if (watchConfigFile) {
    const watcher = chokidar.watch(path)
    watcher.on('change', async () => {
      configs[index] = await parseConfig(path, type)
      await updateConfig(mergeConfigs())
    })
  }
}

const scheduleRemoteConfigFetcher = (
  url: string,
  interval: number,
  index: number
) => {
  setInterval(async () => {
    configs[index] = await fetchConfig(url)
    await updateConfig(mergeConfigs())
  }, interval * 1000)
}

const parseDefaultConfig = (flags: any): Promise<Partial<Config>[]> => {
  return Promise.all(
    (flags.config as Array<string>).map((source, i) => {
      if (isUrl(source)) {
        scheduleRemoteConfigFetcher(source, flags['config-interval'], i)
        return fetchConfig(source)
      }
      watchConfigFile(source, 'monika', i, flags.repeat)
      return parseConfig(source, 'monika')
    })
  )
}

const addDefaultNotifications = (config: Partial<Config>): Partial<Config> => {
  log.info('Notifications not found, using desktop as default...')
  return {
    ...config,
    notifications: [{ id: 'default', type: 'desktop', data: undefined }],
  }
}

export const setupConfig = async (flags: any) => {
  // check for default config path when -c/--config not provided
  if (flags.config.length === 0 && !flags.har && !flags.postman) {
    throw new Error(
      'Configuration file not found. By default, Monika looks for monika.yml configuration file in the current directory.\n\nOtherwise, you can also specify a configuration file using -c flag as follows:\n\nmonika -c <path_to_configuration_file>\n\nYou can create a configuration file via web interface by opening this web app: https://hyperjumptech.github.io/monika-config-generator/'
    )
  }

  const parsedConfigs = await parseDefaultConfig(flags)

  let nonDefaultConfig: Partial<Config> | undefined
  if (flags.har) {
    nonDefaultConfig = parseConfig(flags.har, 'har')
  } else if (flags.postman) {
    nonDefaultConfig = parseConfig(flags.postman, 'postman')
  }

  if (parsedConfigs.length === 0 && nonDefaultConfig !== undefined) {
    nonDefaultConfig = addDefaultNotifications(nonDefaultConfig)
  }

  if (nonDefaultConfig !== undefined) parsedConfigs.push(nonDefaultConfig)

  configs = parsedConfigs

  await updateConfig(mergeConfigs())
}

const getPathAndTypeFromFlag = (flags: any) => {
  let path = flags.config
  let type = 'monika'

  if (flags.postman) {
    path = flags.postman
    type = 'postman'
  }

  if (flags.har) {
    path = flags.har
    type = 'har'
  }

  return {
    path,
    type,
  }
}

export const createConfig = async (flags: any) => {
  if (!flags.har && !flags.postman) {
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

    const parse = parseConfig(path, type)
    const result = await addDefaultNotifications(parse)
    const file = flags.output || 'monika.json'

    if (existsSync(file) && !flags.force) {
      const ans = await cli.prompt(
        `\n${file} file is already exists. Overwrite (Y/n)?`
      )

      if (ans.toLowerCase() !== 'y') {
        log.warn(
          `Command cancelled. You can use the -o flag to specify an output file or --force to overwrite without prompting.`
        )
        return
      }
    }

    writeFileSync(file, JSON.stringify(result), 'utf8')
    log.info(`${file} file has been created.`)
  }
}
