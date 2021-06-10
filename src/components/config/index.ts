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
  }
}

export const setupConfigFromFile = async (path: string) => {
  const handler = async () => {
    const parsed = parseConfig(path)

    const validated = validateConfig(parsed)
    if (!validated.valid) {
      throw new Error(validated.message)
    }

    updateConfig(parsed)

    if (parsed.symon?.url && parsed.symon?.key) {
      try {
        await handshake(parsed)

        // TODO: fetch config from Symon and override local config
        // Need API in Symon first
      } catch (error) {
        log.warn(` ›   Warning: Can't do handshake with Symon.`)
      }
    }
  }

  await handler()

  chokidar.watch(path).on('change', handler)
}
