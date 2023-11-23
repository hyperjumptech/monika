/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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

import { sendPing } from '../../../../utils/ping'
import {
  ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request'

type icmpParams = {
  host: string // target to ping
}

// icmp specific responses from the library
type icmpResponse = {
  host?: string // host name
  numericHost?: string // resolved host ip
  isAlive?: boolean // is the host alive?
  min?: string // minimum round trip time ms
  max?: string // max round trip time in ms
  average?: number // average time in ms
  packetLoss?: number // packet loss%
  output?: string // driver output
}

export async function icmpRequest(
  params: icmpParams
): Promise<ProbeRequestResponse> {
  const icmpResp: icmpResponse = {
    isAlive: false, // initialize to off and packet loss
    packetLoss: 100,
    average: 0,
  }

  const baseResponse: ProbeRequestResponse = {
    data: '',
    body: '',
    status: 0,
    result: probeRequestResult.unknown,
    headers: '',
    responseTime: 0,
  }

  try {
    const resp = await sendPing(params.host)

    icmpResp.host = resp.inputHost
    icmpResp.average = resp.avg === 'unknown' ? 0 : resp.avg // map response time to the average ping time
    icmpResp.isAlive = resp.alive
    icmpResp.packetLoss = resp.packetLoss
    icmpResp.numericHost = resp.numeric_host
    icmpResp.output = resp.output

    return processICMPRequestResult(icmpResp)
  } catch (error) {
    console.error('icmp got error:', error)
    baseResponse.data = error // map error to data
    baseResponse.errMessage = error
  }

  return baseResponse
}

// translates icmp specific response to base monika response
export function processICMPRequestResult(
  params: icmpResponse
): ProbeRequestResponse {
  // build log message
  const aliveMsg = params.isAlive ? 'alive' : 'dead'
  const packetLossMsg = params.isAlive ? params.packetLoss : '100%'
  const msg = `PING:${aliveMsg} host:${params.host} avg:${params.average}ms packetLoss:${packetLossMsg}`

  return {
    requestType: 'ICMP',
    data: params.output, // map output to response data
    status: params.isAlive ? 200 : 0, // TO IMPROVE: this is a monkey patch to map ping return status to http status. Should not need it!
    result: params.isAlive
      ? probeRequestResult.success
      : probeRequestResult.failed,
    body: msg,
    headers: {},
    responseTime: params.average || 0,
  }
}
