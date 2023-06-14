import type { ProbeResult } from '..'
import { ProbeRequestResult } from '../../../../interfaces/request'
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
  const { body, responseTime, result } = requestResponse
  const isAlertTriggered = result !== ProbeRequestResult.success
  const timeNow = new Date().toISOString()
  const logMessage = `${timeNow} ${checkOrder} id:${id} tcp:${url} ${responseTime}ms msg:${body}`

  return [{ isAlertTriggered, logMessage, requestResponse }]
}
