import parse from 'url-parse'
import { BaseProber, type ProbeParams, type ProbeResult } from '../index.js'
import type { Redis } from '../../../../interfaces/probe.js'
import { probeRequestResult } from '../../../../interfaces/request.js'
import { redisRequest } from './request.js'

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
    const requestResponse = await redisRequest({
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
