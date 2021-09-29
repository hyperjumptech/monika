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
import format from 'date-fns/format'
import { getConfig } from '../components/config'
import { getSummary } from '../components/logger/history'
import { sendNotifications } from '../components/notification'
import { getOSName } from '../components/notification/alert-message'
import { getContext } from '../context'
import getIp from '../utils/ip'
import { log } from '../utils/pino'
import { publicIpAddress } from '../utils/public-ip'
import {
  averageResponseTime,
  minResponseTime,
  maxResponseTime,
} from '../components/probe'

export async function getSummaryAndSendNotif() {
  const config = getConfig()
  const { notifications } = config

  if (!notifications) return

  try {
    const { userAgent } = getContext()
    const [summary, osName] = await Promise.all([getSummary(), getOSName()])

    sendNotifications(notifications, {
      subject: `Monika Status`,
      body: `Status Update ${format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX')}
Host: ${hostname()} (${[publicIpAddress, getIp()].filter(Boolean).join('/')})
Number of probes: ${summary.numberOfProbes}
Maximum response time: ${maxResponseTime} ms in the last 24 hours
Minimum response time: ${minResponseTime} ms in the last 24 hours
Average response time: ${averageResponseTime} ms in the last 24 hours
Incidents: ${summary.numberOfIncidents} in the last 24 hours
Recoveries: ${summary.numberOfRecoveries} in the last 24 hours
Notifications: ${summary.numberOfSentNotifications}
OS: ${osName}
Version: ${userAgent}`,
      summary: `There are ${summary.numberOfIncidents} incidents and ${summary.numberOfRecoveries} recoveries in the last 24 hours. - ${userAgent} - ${osName}`,
      meta: {
        type: 'status-update' as const,
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
        hostname: hostname(),
        privateIpAddress: getIp(),
        publicIpAddress,
        maxResponseTime,
        minResponseTime,
        averageResponseTime,
        ...summary,
      },
    }).catch((error) => log.error(`Summary notification: ${error.message}`))
  } catch (error) {
    log.error(`Summary notification: ${error.message}`)
  }
}
