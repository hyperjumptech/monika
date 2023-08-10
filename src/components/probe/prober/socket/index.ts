import { BaseProber, type ProbeResult } from '..'
import type { Socket } from '../../../../interfaces/probe'
import { tcpRequest } from './request'

export class SocketProber extends BaseProber {
  async probe(): Promise<void> {
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

    this.processProbeResults(result)
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
  const requestResponse = await tcpRequest({ host, port, data })
  const { body, responseTime, status } = requestResponse
  const isAlertTriggered = status !== 200
  const timeNow = new Date().toISOString()
  const logMessage = `${timeNow} ${checkOrder} id:${id} tcp:${url} ${responseTime}ms msg:${body}`

  return [{ isAlertTriggered, logMessage, requestResponse }]
}
