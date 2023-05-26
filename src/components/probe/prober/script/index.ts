import type { ProbeResult } from '..'
import type { Script } from '../../../../interfaces/probe'
import { scriptRequest } from './request'

type ProbeScriptParams = {
  id: string
  checkOrder: number
  script: Script[]
}

export async function probeScript({
  id,
  checkOrder,
  script: scripts,
}: ProbeScriptParams): Promise<ProbeResult[]> {
  const probeResults: ProbeResult[] = []

  for await (const script of scripts) {
    const { cmd } = script
    const requestResponse = await scriptRequest(script)
    const { body, responseTime, status } = requestResponse
    const isAlertTriggered = status !== 200
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} script:${cmd} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}
