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
import { Config } from '../../interfaces/config'
import { fetchConfig } from './fetch'
import { parseConfig } from './parse'
import { validateConfig } from './validate'
import { handshake } from '../reporter'
import { log } from '../../utils/pino'
import { md5Hash } from '../../utils/hash'

const emitter = new EventEmitter()

const CONFIG_UPDATED = 'CONFIG_UPDATED_EVENT'

let cfg: Config

export const getConfig = () => {
  if (!cfg) throw new Error('Configuration setup has not been run yet')
  return cfg
}

export async function* getConfigIterator() {
  if (!cfg) throw new Error('Configuration setup has not been run yet')

  yield cfg

  if (!(process.env.CI || process.env.NODE_ENV === 'test')) {
    yield* pEvent.iterator<string, Config>(emitter, CONFIG_UPDATED)
  }
}

export const updateConfig = (data: Config) => {
  const lastVersion = cfg?.version

  cfg = data
  cfg.version = cfg.version || md5Hash(cfg)

  if (cfg.version !== lastVersion) {
    emitter.emit(CONFIG_UPDATED, cfg)
    log.warn('config file update detected')
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

export const setupConfigFromFile = async (flags: any, watch: boolean) => {
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

  const parsed = parseConfig(path, type)
  await handshakeAndValidate(parsed)
  cfg = parsed
  cfg.version = cfg.version || md5Hash(cfg)

  if (watch) {
    const fileWatcher = chokidar.watch(path)
    fileWatcher.on('change', async () => {
      const parsed = parseConfig(path, type)
      await handshakeAndValidate(parsed)
      updateConfig(parsed)
    })
  }
}

export const setupConfigFromUrl = async (
  url: string,
  checkingInterval: number
) => {
  const fetched = await fetchConfig(url)
  await handshakeAndValidate(fetched)
  cfg = fetched
  cfg.version = cfg.version || md5Hash(cfg)

  setInterval(async () => {
    const fetched = await fetchConfig(url)
    await handshakeAndValidate(fetched)
    updateConfig(fetched)
  }, checkingInterval * 1000)
}
