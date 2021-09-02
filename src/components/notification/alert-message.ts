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
import * as Handlebars from 'handlebars'
import { hostname } from 'os'
import { NotificationMessage } from '../../interfaces/notification'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { ProbeAlert } from '../../interfaces/probe'
import { publicIpAddress } from '../../utils/public-ip'

export function getMessageForAlert({
  alert,
  url,
  ipAddress,
  probeState, // state of the probed target
  response,
}: {
  alert: ProbeAlert
  url: string
  ipAddress: string
  probeState: string
  response: AxiosResponseWithExtraData
}): NotificationMessage {
  const getSubject = (alert: ProbeAlert, probeState: string) => {
    const recoveryOrIncident = probeState === 'UP' ? 'Recovery' : 'Incident'

    if (alert.subject)
      return `[${recoveryOrIncident.toUpperCase()}] ${alert.subject}`

    return `New ${recoveryOrIncident} from Monika`
  }

  const getExpectedMessage = (
    alert: ProbeAlert,
    response: AxiosResponseWithExtraData
  ) => {
    if (!alert.message) return ''

    return Handlebars.compile(alert.message)({
      response: {
        size: Number(response.headers['content-length']),
        status: response.status,
        time: response.config.extraData?.responseTime,
        body: response.data,
        headers: response.headers,
      },
    })
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

  const bodyString = `Message: ${getExpectedMessage(alert, response)}

URL: ${meta.url}

Time: ${meta.time}

From: ${getMonikaInstance()}`

  const message = {
    subject: getSubject(alert, probeState),
    body: bodyString,
    summary: getExpectedMessage(alert, response),
    meta,
  }

  return message
}
