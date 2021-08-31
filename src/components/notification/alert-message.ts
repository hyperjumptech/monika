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

import { format } from 'date-fns'
import { hostname } from 'os'
import { NotificationMessage } from '../../interfaces/notification'
import { ProbeAlert } from '../../interfaces/probe'
import { parseAlertStringTime } from '../../plugins/validate-response/checkers'
import { publicIpAddress } from '../../utils/public-ip'

export function getMessageForAlert({
  alert,
  url,
  ipAddress,
  probeState, // state of the probed target
  responseValue,
}: {
  alert: ProbeAlert
  url: string
  ipAddress: string
  probeState: string
  incidentThreshold: number
  responseValue: number
}): NotificationMessage {
  const getSubject = (probeState: string) => {
    const recoveryOrIncident = probeState === 'UP' ? 'Recovery' : 'Incident'

    if (alert.subject)
      return `[${recoveryOrIncident.toUpperCase()}] ${alert.subject}`

    return `New ${recoveryOrIncident} from Monika`
  }

  // TODO
  const getExpectedMessage = (responseValue: number) => {
    if (alert.query === 'status-not-2xx') {
      return `HTTP Status is ${responseValue}, expecting 200.`
    }

    if (alert.query.includes('response-time-greater-than-')) {
      const alertTime = parseAlertStringTime(alert.query)
      return `Response time is ${responseValue}ms, expecting less than ${alertTime}ms`
    }

    return alert.message
  }

  const getMonikaInstance = () => {
    return `${hostname()} (${[publicIpAddress, ipAddress]
      .filter(Boolean)
      .join('/')})`
  }

  const meta = {
    type: probeState === 'UP' ? ('recovery' as const) : ('incident' as const),
    url,
    time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
    hostname: hostname(),
    privateIpAddress: ipAddress,
    publicIpAddress,
  }

  const bodyString = `Message: ${getExpectedMessage(responseValue)}

URL: ${meta.url}

Time: ${meta.time}

From: ${getMonikaInstance()}`

  const message = {
    subject: getSubject(probeState),
    body: bodyString,
    summary: getExpectedMessage(responseValue),
    meta,
  }

  return message
}
