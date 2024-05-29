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
import { ProbeRequestResponse } from 'src/interfaces/request'
import { log } from '../../../../utils/pino'
import { serialize } from 'v8'
/**
 * Simple implementation for caching Monika HTTP responses.
 * With default total cache size limited to 50 MB.
 * And default time-to-live for each cache entries is 30s.
 *
 * About cache size 50 MB limit :
 * Assuming a typical web page response is around 500 KB
 * This cache can fit around 100 entries of web pages
 * A typical response with empty body is around 300 bytes of headers
 * That means, this cache can fit around 160K entries of empty body responses
 */
const DEFAULT_CACHE_LIMIT = 50_000_000 // 50 MB in bytes
const DEFAULT_TIME_TO_LIVE = 30_000 // 30s in ms
const responseCache = new Map<
  string,
  { expireAt: number; response: ProbeRequestResponse }
>()

// ensureCacheSize ensures total size of cache is under DEFAULT_CACHE_LIMIT
function ensureCacheSize() {
  const totalCacheSize = serialize(responseCache).byteLength
  const firstKey = responseCache.keys().next().value
  if (totalCacheSize > DEFAULT_CACHE_LIMIT && firstKey) {
    responseCache.delete(firstKey)
    // recursive until cache size is under limit
    ensureCacheSize()
  }
}

// ensureCacheTtl ensures cache entries are within valid time-to-live
// this will delete already expired cache entries
function ensureCacheTtl() {
  const now = Date.now()
  for (const [key, { expireAt }] of responseCache.entries()) {
    if (expireAt <= now) {
      responseCache.delete(key)
    } else {
      // next items have valid time-to-live
      // break out of loop to save time
      break
    }
  }
}

function put(key: string, value: ProbeRequestResponse) {
  if (getContext().isTest) return
  const expireAt = Date.now() + DEFAULT_TIME_TO_LIVE
  responseCache.set(key, { expireAt, response: value })
  // after put into cache, ensure total cache size is under limit
  ensureCacheSize()
}

function get(key: string) {
  // remove expired entries before actually getting cache
  ensureCacheTtl()
  const response = responseCache.get(key)?.response
  const isVerbose = getContext().flags.verbose
  const shortHash = key.slice(Math.max(0, key.length - 7))
  if (isVerbose && response) {
    const time = new Date().toISOString()
    log.info(`${time} - [${shortHash}] Cache HIT`)
  } else if (isVerbose) {
    const time = new Date().toISOString()
    log.info(`${time} - [${shortHash}] Cache MISS`)
  }

  return response
}

export { responseCache, put as putCache, get as getCache }
