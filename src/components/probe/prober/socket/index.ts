import type { ProbeResult } from '..'
import type { Socket } from '../../../../interfaces/probe'
import { tcpRequest } from './request'

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
