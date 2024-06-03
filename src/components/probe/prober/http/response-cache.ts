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

import { getContext } from '../../../../context'
import { ProbeRequestResponse, RequestConfig } from 'src/interfaces/request'
import { log } from '../../../../utils/pino'
import TTLCache from '@isaacs/ttlcache'
import { createHash } from 'crypto'

const ttlCache =
  getContext().flags['ttl-cache'] > 0
    ? new TTLCache({ ttl: getContext().flags['ttl-cache'] * 60_000 })
    : undefined
const cacheHash = new Map<RequestConfig, string>()

function getOrCreateHash(config: RequestConfig) {
  let hash = cacheHash.get(config)
  if (!hash) {
    hash = createHash('SHA1').update(JSON.stringify(config)).digest('hex')
  }

  return hash
}

function put(config: RequestConfig, value: ProbeRequestResponse) {
  if (!ttlCache || getContext().isTest) return
  const hash = getOrCreateHash(config)
  ttlCache.set(hash, value)
}

function get(config: RequestConfig): ProbeRequestResponse | undefined {
  if (!ttlCache || getContext().isTest) return undefined
  const key = getOrCreateHash(config)
  const response = ttlCache.get(key)
  const isVerbose = getContext().flags.verbose
  const shortHash = key.slice(Math.max(0, key.length - 7))
  if (isVerbose && response) {
    const time = new Date().toISOString()
    log.info(`${time} - [${shortHash}] Cache HIT`)
  } else if (isVerbose) {
    const time = new Date().toISOString()
    log.info(`${time} - [${shortHash}] Cache MISS`)
  }

  return response as ProbeRequestResponse | undefined
}

export { put as putCache, get as getCache }
