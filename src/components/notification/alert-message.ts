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

import { hostname, platform } from 'os'
import { promisify } from 'util'
import { format, formatDistanceToNow } from 'date-fns'
import * as Handlebars from 'handlebars'
import getos from 'getos'
import osName from 'os-name'
import { getContext } from '../../context'
import { NotificationMessage } from '../../interfaces/notification'
import { ProbeRequestResponse } from '../../interfaces/request'
import { ProbeAlert } from '../../interfaces/probe'
import {
  getPublicIp,
  publicIpAddress,
  publicNetworkInfo,
} from '../../utils/public-ip'

const getLinuxDistro = promisify(getos)

export const getMonikaInstance = async (ipAddress: string) => {
  const osHostname = hostname()
  await getPublicIp()

  if (publicNetworkInfo) {
    const { city, isp } = publicNetworkInfo

    return `${city} - ${isp} (${publicIpAddress}) - ${osHostname} (${ipAddress})`
  }

  return `${osHostname} (${[publicIpAddress, ipAddress]
    .filter(Boolean)
    .join('/')})`
}

type MessageAlertProps = {
  probeID: string
  alert: ProbeAlert
  url: string
  ipAddress: string
  // state of the probed target
  isRecovery: boolean
  response: ProbeRequestResponse
}

export async function getMessageForAlert({
  probeID,
  alert,
  url,
  ipAddress,
  isRecovery,
  response,
}: MessageAlertProps): Promise<NotificationMessage> {
  const { userAgent, incidents } = getContext()
  const [monikaInstance, osName] = await Promise.all([
    getMonikaInstance(ipAddress),
    getOSName(),
  ])
  const recoveryOrIncident = isRecovery ? 'Recovery' : 'Incident'
  const meta = {
    type: isRecovery ? ('recovery' as const) : ('incident' as const),
    url,
    time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
    hostname: hostname(),
    privateIpAddress: ipAddress,
    publicIpAddress,
    monikaInstance,
    version: userAgent,
  }
  const getExpectedMessage = (
    alert: ProbeAlert,
    response: ProbeRequestResponse,
    isRecovery: boolean
  ) => {
    const { status } = response
    const isHTTPStatusCode = status >= 100 && status <= 599

    if (!alert.message) {
      if (isRecovery)
        return `The request is back to normal and pass the query: ${alert.query}`
      return `The request failed because the response does not pass the query: ${alert.query}. The actual response status is ${response.status} and the response time is ${response.responseTime}.`
    }

    if (!isHTTPStatusCode) {
      switch (status) {
        case 0:
          return 'URI not found'
        case 1:
          return 'Connection reset'
        case 2:
          return 'Connection refused'

        default:
          return status
      }
    }

    return Handlebars.compile(alert.message)({
      response: {
        size: Number(response.headers['content-length']),
        status,
        time: response?.responseTime,
        body: response.data,
        headers: response.headers,
      },
    })
  }
  const lastIncident = incidents.find(
    (incident) =>
      incident.probeID === probeID && incident.probeRequestURL === url
  )
  const recoveryMessage = getRecoveryMessage(
    isRecovery,
    lastIncident?.createdAt
  )
  const expectedMessage = getExpectedMessage(alert, response, isRecovery)
  const bodyString = `Message: ${recoveryMessage}${expectedMessage}

URL: ${meta.url}

Time: ${meta.time}

From: ${monikaInstance}

OS: ${osName}

Version: ${userAgent}`

  const summary = `${expectedMessage}`

  const message = {
    subject: `New ${recoveryOrIncident} from Monika`,
    body: bodyString,
    summary,
    meta,
  }

  return message
}

function getRecoveryMessage(isRecovery: boolean, incidentDateTime?: Date) {
  if (!isRecovery || !incidentDateTime) {
    return ''
  }

  const incidentDuration = formatDistanceToNow(incidentDateTime, {
    includeSeconds: true,
  })
  const humanReadableIncidentDateTime = format(
    incidentDateTime,
    'yyyy-MM-dd HH:mm:ss XXX'
  )

  return `Target is back to normal after ${incidentDuration}. The incident happened at ${humanReadableIncidentDateTime}. `
}

export const getMessageForStart = async (
  hostname: string,
  ip: string
): Promise<NotificationMessage> => {
  const { userAgent } = getContext()
  const [monikaInstance, osName] = await Promise.all([
    getMonikaInstance(ip),
    getOSName(),
  ])
  const monikaDetail = `${monikaInstance} - ${userAgent} - ${osName}`

  return {
    subject: 'Monika is started',
    body: `Monika is running from ${monikaDetail}`,
    summary: `Monika is running from ${monikaDetail}`,
    meta: {
      type: 'start',
      time: new Date().toUTCString(),
      hostname,
      privateIpAddress: ip,
      publicIpAddress,
      version: userAgent,
    },
  }
}

export const getMessageForTerminate = async (
  hostname: string,
  ip: string
): Promise<NotificationMessage> => {
  const { userAgent } = getContext()
  const [monikaInstance, osName] = await Promise.all([
    getMonikaInstance(ip),
    getOSName(),
  ])
  const monikaDetail = `${monikaInstance} - ${userAgent} - ${osName}`

  return {
    subject: 'Monika terminated',
    body: `Monika is no longer running from ${monikaDetail}`,
    summary: `Monika is no longer running from ${monikaDetail}`,
    meta: {
      type: 'termination',
      time: new Date().toUTCString(),
      hostname,
      privateIpAddress: ip,
      publicIpAddress,
      version: userAgent,
    },
  }
}

export async function getOSName() {
  const osPlatform = platform()
  const isLinux = osPlatform === 'linux'

  if (isLinux) {
    const linuxDistro = await getLinuxDistro()

    // checking again due to inconsistency of getos module return type
    if (linuxDistro.os !== 'linux') {
      return linuxDistro.os
    }

    return `${linuxDistro?.dist} ${linuxDistro?.release}`
  }

  return osName()
}
