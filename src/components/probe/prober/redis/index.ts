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

import parse from 'url-parse'
import { BaseProber, type ProbeParams, type ProbeResult } from '../index.js'
import type { Redis } from '../../../../interfaces/probe.js'
import { probeRequestResult } from '../../../../interfaces/request.js'
import { moduleExports } from './request.js'

export class RedisProber extends BaseProber {
  async probe({ incidentRetryAttempt }: ProbeParams): Promise<void> {
    if (!this.probeConfig.redis) {
      throw new Error(
        `Redis configuration is empty. Probe ID: ${this.probeConfig.id}`
      )
    }

    const result = await probeRedis({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      redis: this.probeConfig.redis,
    })

    this.processProbeResults(result, incidentRetryAttempt)
  }

  generateVerboseStartupMessage(): string {
    const { description, id, interval, name } = this.probeConfig

    let result = `- Probe ID: ${id}
  Name: ${name}
  Description: ${description || '-'}
  Interval: ${interval}
`
    result += '  Connection Details:'
    result += this.getConnectionDetails()

    return result
  }

  private getConnectionDetails(): string {
    return (
      this.probeConfig.redis
        ?.map((db) => {
          if (db.uri) {
            return `
    URI: ${db.uri}
`
          }

          return `
    Host: ${db.host}
    Port: ${db.port}
    Username: ${db.username}
        `
        })
        .join('\n') || ''
    )
  }
}

type ProbeRedisParams = {
  id: string
  checkOrder: number
  redis: Redis[]
}

export async function probeRedis({
  id,
  checkOrder,
  redis,
}: ProbeRedisParams): Promise<ProbeResult[]> {
  const probeResults: ProbeResult[] = []
  let hostTxt = '0.0.0.0'
  let portTxt = 6379

  for await (const { host, port, uri, username, password } of redis) {
    const requestResponse = await moduleExports.redisRequest({
      host,
      port,
      username,
      password,
      uri,
    })
    const { body, responseTime, result } = requestResponse
    const isAlertTriggered = result !== probeRequestResult.success
    const timeNow = new Date().toISOString()

    // parse uri for logMessage(host:port)
    if (host && port) {
      hostTxt = host
      portTxt = port
    } else if (uri) {
      const parsed = parse(uri)
      hostTxt = parsed.host
      portTxt = Number(parsed.port)
    }

    const logMessage = `${timeNow} ${checkOrder} id:${id} redis:${hostTxt}:${portTxt} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}
