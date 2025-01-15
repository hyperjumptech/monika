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

import { HTTPProber } from './http/index.js'
import { MongoProber } from './mongo/index.js'
import { MariaDBProber } from './mariadb/index.js'
import { PingProber } from './icmp/index.js'
import { PostgresProber } from './postgres/index.js'
import { RedisProber } from './redis/index.js'
import { SocketProber } from './socket/index.js'
import type { Prober, ProberMetadata } from './index.js'

export function createProbers(probeMetadata: ProberMetadata): Prober[] {
  const { probeConfig } = probeMetadata
  const result: Prober[] = []

  if (probeConfig?.requests) {
    result.push(createProber(probeMetadata))
  }

  if (probeConfig?.mongo) {
    result.push(createProber(probeMetadata))
  }

  if (probeConfig?.mariadb || probeConfig?.mysql) {
    result.push(createProber(probeMetadata))
  }

  if (probeConfig?.postgres) {
    result.push(createProber(probeMetadata))
  }

  if (probeConfig?.redis) {
    result.push(createProber(probeMetadata))
  }

  if (probeConfig?.socket) {
    result.push(createProber(probeMetadata))
  }

  if (probeConfig?.ping) {
    result.push(createProber(probeMetadata))
  }

  return result
}

export function createProber(probeMetadata: ProberMetadata): Prober {
  const { probeConfig } = probeMetadata

  if (probeConfig?.requests) {
    return new HTTPProber(probeMetadata)
  }

  if (probeConfig?.mariadb || probeConfig?.mysql) {
    return new MariaDBProber(probeMetadata)
  }

  if (probeConfig?.mongo) {
    return new MongoProber(probeMetadata)
  }

  if (probeConfig?.postgres) {
    return new PostgresProber(probeMetadata)
  }

  if (probeConfig?.redis) {
    return new RedisProber(probeMetadata)
  }

  if (probeConfig?.socket) {
    return new SocketProber(probeMetadata)
  }

  if (probeConfig?.ping) {
    return new PingProber(probeMetadata)
  }

  throw new Error('Unknown probe type')
}
