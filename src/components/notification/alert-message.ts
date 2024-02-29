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
import { format } from 'date-fns'
import * as Handlebars from 'handlebars'
import getos from 'getos'
import osName from 'os-name'
import { getContext } from '../../context'
import type { NotificationMessage } from '@hyperjumptech/monika-notification'
import { ProbeRequestResponse } from '../../interfaces/request'
import { ProbeAlert } from '../../interfaces/probe'
import { publicIpAddress, publicNetworkInfo } from '../../utils/public-ip'
import { getDowntimeDuration, getIncidents } from '../downtime-counter'

const getLinuxDistro = promisify(getos)

export const getMonikaInstance = async (ipAddress: string): Promise<string> => {
  const osHostname = hostname()

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

const getExpectedMessage = (
  alert: ProbeAlert,
  response: ProbeRequestResponse,
  isRecovery: boolean
): string | number => {
  const { status, data, headers, responseTime } = response

  if (alert.message === '') {
    if (isRecovery) {
      return `The request is back to normal and passed the assertion: ${alert.assertion}`
    }

    return `The request failed because the response did not pass the query: ${alert.assertion}. The actual response status is ${status} and the response time is ${responseTime}.`
  }

  return Handlebars.compile(alert.message)({
    response: {
      size:
        typeof headers === 'string'
          ? undefined
          : Number(headers['content-length']),
      status,
      time: responseTime,
      body: data,
      headers,
    },
  })
}

export async function getMessageForAlert({
  probeID,
  alert,
  url,
  ipAddress,
  isRecovery,
  response,
}: MessageAlertProps): Promise<NotificationMessage> {
  const { userAgent } = getContext()
  const [monikaInstance, osName] = await Promise.all([
    getMonikaInstance(ipAddress),
    getOSName(),
  ])
  const recoveryOrIncident = isRecovery ? 'Recovery' : 'Incident'
  const meta = {
    type: isRecovery ? ('recovery' as const) : ('incident' as const),
    probeID,
    alertQuery: alert.assertion,
    url,
    time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
    hostname: hostname(),
    privateIpAddress: ipAddress,
    publicIpAddress,
    monikaInstance,
    version: userAgent,
  }

  const recoveryMessage = getRecoveryMessage(isRecovery, probeID, url)
  const expectedMessage = getExpectedMessage(alert, response, isRecovery)
  const bodyString = `Message: ${recoveryMessage}${expectedMessage}

${meta.url ? `URL: ${meta.url}` : `Probe ID: ${probeID}`}

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

function getRecoveryMessage(isRecovery: boolean, probeID: string, url: string) {
  const incidentDateTime = getIncidents().find(
    (incident) =>
      incident.probeID === probeID && incident.probeRequestURL === url
  )?.createdAt
  if (!isRecovery || !incidentDateTime) {
    return ''
  }

  const incidentDuration = getDowntimeDuration({ probeID, url })
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

export async function getOSName(): Promise<string> {
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
