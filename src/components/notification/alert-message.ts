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

import { hostname } from 'os'
import { parseAlertStringTime } from '../../plugins/validate-response/checkers'
import { publicIpAddress } from '../../utils/public-ip'
import { ProbeAlert } from '../../interfaces/probe'

export function getMessageForAlert({
  alert,
  url,
  ipAddress,
  probeState, // state of the probed target
  incidentThreshold,
  responseValue,
}: {
  alert: ProbeAlert
  url: string
  ipAddress: string
  probeState: string
  incidentThreshold: number
  responseValue: number
}): {
  subject: string
  body: string
  expected: string
} {
  const getSubject = (url: string, probeState: string) => {
    const recoveryOrIncident = probeState === 'UP' ? 'RECOVERY' : 'INCIDENT'

    if (alert.query === 'status-not-2xx')
      return `[${recoveryOrIncident}] Target ${url} is not OK`
    if (alert.query.includes('response-time-greater-than-')) {
      return `[${recoveryOrIncident}] Target ${url} took too long to respond`
    }

    return `[${recoveryOrIncident}] ${alert.subject}`
  }

  const getBody = (probeState: string) => {
    if (probeState === 'DOWN') {
      if (alert.query === 'status-not-2xx')
        return `Target ${url} is not healthy. It has not been returning status code 2xx ${incidentThreshold} times in a row.`

      if (alert.query.includes('response-time-greater-than-')) {
        const alertTime = parseAlertStringTime(alert.query)
        return `Target ${url} is not healthy. The response time has been greater than ${alertTime} ${incidentThreshold} times in a row`
      }

      return 'New INCIDENT from Monika'
    }

    return `Target ${url} is back to healthy.`
  }

  const getExpectedMessage = (probeState: string, responseValue: number) => {
    if (alert.query === 'status-not-2xx') {
      if (probeState === 'DOWN') {
        return `Status is ${responseValue}, was expecting 200.`
      }

      if (probeState === 'UP') {
        return `Service is ok. Status now 200`
      }
    }

    if (alert.query.includes('response-time-greater-than-')) {
      const alertTime = parseAlertStringTime(alert.query)

      if (probeState === 'DOWN') {
        return `Response time is ${responseValue}ms expecting a ${alertTime}ms`
      }

      if (probeState === 'UP') {
        return `Service is ok. Response now is within ${alertTime}ms`
      }
    }

    return alert.message
  }

  const today = new Date().toUTCString()
  const message = {
    subject: getSubject(url, probeState),
    body: `
      ${getBody(probeState)}\n\n
      Alert: ${getExpectedMessage(probeState, responseValue)}\n
      URL: ${url}\n
      At: ${today}\n
      Monika: ${ipAddress} (local), ${
      publicIpAddress ? `${publicIpAddress} (public)` : ''
    } ${hostname} (hostname)
    `,
    expected: getExpectedMessage(probeState, responseValue),
  }

  return message
}
