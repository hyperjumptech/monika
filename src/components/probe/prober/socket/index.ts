import { BaseProber, type ProbeParams, type ProbeResult } from '../index.js'
import { probeRequestResult } from '../../../../interfaces/request.js'
import type { Socket } from '../../../../interfaces/probe.js'
import { moduleExports } from './request.js'

export class SocketProber extends BaseProber {
  async probe({ incidentRetryAttempt }: ProbeParams): Promise<void> {
    if (!this.probeConfig.socket) {
      throw new Error(
        `Socket configuration is empty. Probe ID: ${this.probeConfig.id}`
      )
    }

    const result = await probeSocket({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      socket: this.probeConfig.socket,
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
    return `
    Host: ${this.probeConfig?.socket?.host}
    Port: ${this.probeConfig?.socket?.port}
    Username: ${this.probeConfig?.socket?.data}
`
  }
}

type ProbeSocketParams = {
  id: string
  checkOrder: number
  socket: Socket
}

export async function probeSocket({
  id,
  checkOrder,
  socket,
}: ProbeSocketParams): Promise<ProbeResult[]> {
  const { data, host, port } = socket
  const url = `${host}:${port}`
  const requestResponse = await moduleExports.tcpRequest({ host, port, data })
  const { body, responseTime, result } = requestResponse
  const isAlertTriggered = result !== probeRequestResult.success
  const timeNow = new Date().toISOString()
  const logMessage = `${timeNow} ${checkOrder} id:${id} tcp:${url} ${responseTime}ms msg:${body}`

  return [{ isAlertTriggered, logMessage, requestResponse }]
}
