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
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { publicIpAddress } from '../../utils/public-ip'
// import { sendWhatsapp } from './channel/whatsapp'
// import { sendDiscord } from './channel/discord'
// import { sendMonikaNotif } from './channel/monika-notif'
// import { sendWorkplace } from './channel/workplace'
import { sendDesktop } from './channel/desktop'
// import { sendMailgun } from './channel/mailgun'
// import { sendSlack } from './channel/slack'
// import { createSmtpTransport, sendSmtpMail } from './channel/smtp'
// import { sendTeams } from './channel/teams'
// import { sendTelegram } from './channel/telegram'
import { sendWebhook } from './channel/webhook'

export async function sendStatusNotification({
  summary,
  notifications = [],
}: {
  summary: {
    numberOfProbes: number
    averageResponseTime: number
    numberOfIncidents: number
    numberOfRecoveries: number
    numberOfSentNotifications: number
  }
  notifications?: Notification[]
}): Promise<void> {
  // const title = 'Monika Status'
  const subtitle = `Status Update ${new Date().toLocaleString()}`
  const body = `Host: ${getIp()} (Local), ${publicIpAddress} (Public), ${hostname()} (Hostname)
  Number of probes: ${summary.numberOfProbes}
  Average response time: ${summary.averageResponseTime} ms in the last 24 hours
  Incidents: ${summary.numberOfIncidents} in the last 24 hours
  Recoveries: ${summary.numberOfRecoveries} in the last 24 hours
  Notifications: ${summary.numberOfSentNotifications}`

  const sendAll = notifications.map((notification) => {
    switch (notification.type) {
      case 'desktop':
        return sendDesktop({
          title: subtitle,
          message: body,
        })
      case 'webhook':
        return sendWebhook({
          ...notification.data,
          body: JSON.stringify(summary),
        }).then(() => {
          // to make typecheck pass
          return undefined
        })
      default:
        return Promise.resolve()
    }
  })

  await Promise.all(sendAll)
}
