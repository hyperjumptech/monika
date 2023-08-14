import parse from 'url-parse'
import { BaseProber, type ProbeResult } from '..'
import type { Redis } from '../../../../interfaces/probe'
import { redisRequest } from './request'

export class RedisProber extends BaseProber {
  async probe(): Promise<void> {
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

    this.processProbeResults(result)
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
    const { body, responseTime, status } = requestResponse
    const isAlertTriggered = status !== 200
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
