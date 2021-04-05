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

import { warn } from 'console'
import { Config } from '../../interfaces/config'
import { parseConfig } from './parse'
import { validateConfig } from './validate'
import { handshake } from '../reporter'

let cfg: Config

export const getConfig = () => {
  if (!cfg) throw new Error('Configuration setup has not been run yet')
  return cfg
}

export const updateConfig = (data: Config) => {
  if (!cfg) {
    cfg = {} as Config
  }

  cfg.version = data.version
  if (data.probes) cfg.probes = data.probes
  if (data.notifications) cfg.notifications = data.notifications
}

export const setupConfigFromFile = async (path: string) => {
  const parsed = parseConfig(path)

  if (parsed.monikaHQ && parsed.monikaHQ.url && parsed.monikaHQ.key) {
    try {
      const {
        data: { probes, notifications },
      } = await handshake(parsed)
      if (probes) parsed.probes = probes
      if (notifications) parsed.notifications = notifications
    } catch (error) {
      warn(
        ` ›   Warning: Please check your monika-hq server, it does not return valid configuration. Monika will use configuration from ${path}.`
      )
    }
  }

  const validated = validateConfig(parsed)

  if (validated.valid) {
    updateConfig(parsed)
  } else {
    throw new Error(validated.message)
  }
}
