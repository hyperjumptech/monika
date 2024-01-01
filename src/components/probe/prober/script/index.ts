import { BaseProber, type ProbeResult } from '..'
import type { Script } from '../../../../interfaces/probe'
import { scriptRequest } from './request'

export class ScriptProber extends BaseProber {
  async probe(incidentRetryAttempt: number): Promise<void> {
    if (!this.probeConfig.script) {
      throw new Error(
        `Script configuration is empty. Probe ID: ${this.probeConfig.id}`
      )
    }

    const result = await probeScript({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      script: this.probeConfig.script,
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
    result += this.getScriptDetails()

    return result
  }

  private getScriptDetails(): string {
    return (
      this.probeConfig.script
        ?.map((script) => `
    Command: ${script.cmd}
`
        ).join('\n') || '');
  }
}

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
    const isAlertTriggered = status !== 0
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} ${status} script:${cmd} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })

    // Stop executing additional scripts if one fails
    if (isAlertTriggered) {
      break
    }
  }

  return probeResults
}
