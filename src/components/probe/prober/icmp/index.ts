/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
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

import type { Ping } from '../../../../interfaces/probe.js'
import { BaseProber, type ProbeParams, type ProbeResult } from '../index.js'
import { icmpRequest } from './request.js'
import { probeRequestResult } from '../../../../interfaces/request.js'

export class PingProber extends BaseProber {
  async probe({ incidentRetryAttempt }: ProbeParams): Promise<void> {
    const result = await probePing({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      pings: this.probeConfig.ping,
    })

    this.processProbeResults(result, incidentRetryAttempt)
  }

  generateVerboseStartupMessage(): string {
    const { description, id, interval, name } = this.probeConfig

    let result = `- Probe ID: ${id} 
        Name: ${name || '-'}
        Description: ${description || '-'}
        Interval: ${interval}
        `
    result += '  ping:'
    result += this.getConnectionDetails()

    return result
  }

  private getConnectionDetails(): string {
    return (
      this.probeConfig.ping
        ?.map(
          (probe) => `
            uri: ${probe.uri}`
        )
        .join(``) || `\n`
    )
  }
}

type ProbePingParams = {
  id: string
  checkOrder: number
  pings?: Ping[]
}

export async function probePing({
  id,
  checkOrder,
  pings,
}: ProbePingParams): Promise<ProbeResult[]> {
  const probeResults: ProbeResult[] = []

  if (!pings) {
    // pings defined or length == 0?
    return probeResults
  }

  for await (const { uri } of pings) {
    const requestResponse = await icmpRequest({ host: uri })
    const { responseTime, result, body } = requestResponse

    const isAlertTriggered = result !== probeRequestResult.success
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} ${body} responseTime:${responseTime}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}
