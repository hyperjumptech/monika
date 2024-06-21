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

import TTLCache from '@isaacs/ttlcache'
import { createHash } from 'crypto'
import { getContext } from '../../../../context'
import type {
  ProbeRequestResponse,
  RequestConfig,
} from '../../../../interfaces/request'
import { log } from '../../../../utils/pino'

const ttlCache = new TTLCache()
const cacheHash = new Map<RequestConfig, string>()

export function put(config: RequestConfig, value: ProbeRequestResponse) {
  const hash = getOrCreateHash(config)
  // manually set time-to-live for each cache entry
  // moved from "new TTLCache()" initialization above because corresponding flag is not yet parsed
  const minutes = 60_000
  const ttl = getContext().flags['ttl-cache'] * minutes
  ttlCache.set(hash, value, { ttl })
}

export function get(config: RequestConfig) {
  const key = getOrCreateHash(config)
  const response = ttlCache.get<ProbeRequestResponse | undefined>(key)

  if (getContext().flags['verbose-cache']) {
    logVerbose({ response, key })
  }

  return response
}

function getOrCreateHash(config: RequestConfig) {
  const hash = cacheHash.get(config)
  if (hash) {
    return hash
  }

  return createHash('SHA1').update(JSON.stringify(config)).digest('hex')
}

type LogVerbose = {
  response: unknown
  key: string
}

function logVerbose({ response, key }: LogVerbose) {
  const time = new Date().toISOString()
  const shortHash = key.slice(Math.max(0, key.length - 7))
  const message = response ? 'Cache HIT' : 'Cache MISS'

  log.info(`${time} - [${shortHash}] ${message}`)
}
