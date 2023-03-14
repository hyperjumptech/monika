import type { ProbeResult } from '..'
import type { Redis } from '../../../../interfaces/probe'
import { redisRequest } from './request'

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

  for await (const { host, port } of redis) {
    const requestResponse = await redisRequest({
      host: host,
      port: port,
    })
    const { body, responseTime, status } = requestResponse
    const isAlertTriggered = status !== 200
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} redis:${host}:${port} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}
