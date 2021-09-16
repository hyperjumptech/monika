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

import EventEmitter from 'events'
import chokidar from 'chokidar'
import pEvent from 'p-event'
import isUrl from 'is-url'
import events from './../../events'
import { open } from './../../utils/open-website'
import { Config, ConfigOptional } from '../../interfaces/config'
import { fetchConfig } from './fetch'
import { parseConfig } from './parse'
import { validateConfig } from './validate'
import { handshake } from '../reporter'
import { log } from '../../utils/pino'
import { md5Hash } from '../../utils/hash'
import { existsSync, writeFileSync } from 'fs'
import { cli } from 'cli-ux'

const emitter = new EventEmitter()

let cfg: Config
let configs: ConfigOptional[]

export const getConfig = () => {
  if (!cfg) throw new Error('Configuration setup has not been run yet')
  return cfg
}

export async function* getConfigIterator() {
  if (!cfg) throw new Error('Configuration setup has not been run yet')

  yield cfg

  if (!(process.env.CI || process.env.NODE_ENV === 'test')) {
    yield* pEvent.iterator<string, Config>(emitter, events.config.updated)
  }
}

const handshakeAndValidate = async (config: Config) => {
  if (config.symon?.url && config.symon?.key) {
    try {
      await handshake(config)
    } catch (error) {
      log.warn(` ›   Warning: Can't do handshake with Symon.`)
    }
  }

  const validated = validateConfig(config)

  if (!validated.valid) {
    throw new Error(validated.message)
  }
}

const updateConfig = async (config: Config) => {
  await handshakeAndValidate(config)
  const lastConfig = cfg?.version
  cfg = config
  cfg.version = lastConfig || md5Hash(config)
  if (lastConfig !== cfg.version) {
    emitter.emit(events.config.updated, cfg)
    log.warn('config file update detected')
  }
}

const mergeConfigs = (): Config => {
  const mergedConfig = configs.reduce((prev, current) => {
    return {
      certificate: current?.certificate
        ? current.certificate
        : prev.certificate,
      interval: current?.interval ? current.interval : prev.interval,
      notifications:
        current?.notifications && current.notifications.length > 0
          ? current.notifications
          : prev.notifications,
      probes:
        current?.probes && current.probes.length > 0
          ? current.probes
          : prev.probes,
      symon: current?.symon ? current.symon : prev.symon,
      'status-notification': current?.['status-notification']
        ? current['status-notification']
        : prev['status-notification'],
    }
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
      updateConfig(mergeConfigs())
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
    updateConfig(mergeConfigs())
  }, interval * 1000)
}

const setupConfigFromJson = (flags: any): Promise<ConfigOptional>[] => {
  return (flags.config as Array<string>).map((source, i) => {
    if (isUrl(source)) {
      scheduleRemoteConfigFetcher(source, flags['config-interval'], i)
      return fetchConfig(source)
    }
    delete flags.config
    watchConfigFile(source, 'monika', i, flags.repeat)
    return parseConfig(source, 'monika')
  })
}

export const setupConfig = async (flags: any) => {
  const configParse = new Array<Promise<ConfigOptional>>(0)
  if (flags.har) {
    configParse.push(parseConfig(flags.har, 'har'))
  } else if (flags.postman) {
    configParse.push(parseConfig(flags.postman, 'postman'))
  } else if (Array.isArray(flags.config) && flags.config.length > 0) {
    const json = setupConfigFromJson(flags)
    configParse.push(...json)
  }
  if (configParse.length === 0)
    throw new Error('Failed to recognize configuration(s)')
  configs = await Promise.all(configParse)
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

    const parsed = await parseConfig(path, type)
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

    writeFileSync(file, JSON.stringify(parsed), 'utf8')
    log.info(`${file} file has been created.`)
  }
}
