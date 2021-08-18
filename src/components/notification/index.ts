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

import { Notification } from '../../interfaces/notification'
import { ValidateResponse } from '../../plugins/validate-response'
import getIp from '../../utils/ip'
import { getMessageForAlert } from './alert-message'
import { sendDesktop } from './channel/desktop'
import { sendDiscord } from './channel/discord'
import { sendMailgun } from './channel/mailgun'
import { sendMonikaNotif } from './channel/monika-notif'
import { sendSlack } from './channel/slack'
import { createSmtpTransport, sendSmtpMail } from './channel/smtp'
import { sendTeams } from './channel/teams'
import { sendTelegram } from './channel/telegram'
import { sendWebhook } from './channel/webhook'
import { sendWhatsapp } from './channel/whatsapp'
import { sendWorkplace } from './channel/workplace'

export async function sendAlerts({
  validation,
  notifications,
  url,
  probeState,
  incidentThreshold,
  probeName,
  probeId,
}: {
  validation: ValidateResponse
  notifications: Notification[]
  url: string
  probeState: string
  incidentThreshold: number
  probeName?: string
  probeId?: string
}): Promise<void> {
  const ipAddress = getIp()
  const message = getMessageForAlert({
    alert: validation.alert,
    url,
    ipAddress,
    probeState,
    incidentThreshold,
    responseValue: validation.responseValue,
  })
  await Promise.all<any>(
    notifications.map((notification) => {
      switch (notification.type) {
        case 'mailgun': {
          return sendMailgun(
            {
              subject: message.subject,
              body: message.body,
              sender: {
                // TODO: Read from ENV Variables
                name: 'Monika',
                email: 'Monika@hyperjump.tech',
              },
              recipients: notification?.data?.recipients?.join(','),
            },
            notification.data
          )
        }
        case 'webhook': {
          return sendWebhook({
            ...notification.data,
            body: message.body,
          })
        }
        case 'discord': {
          return sendDiscord({
            ...notification.data,
            body: message.body,
          })
        }
        case 'slack': {
          return sendSlack({
            ...notification.data,
            body: message.body,
          })
        }
        case 'telegram': {
          return sendTelegram({
            ...notification.data,
            body: message.body,
          })
        }
        case 'smtp': {
          const transporter = createSmtpTransport(notification.data)
          return sendSmtpMail(transporter, {
            // TODO: Read from ENV Variables
            from: 'http-probe@hyperjump.tech',
            to: notification?.data?.recipients?.join(','),
            subject: message.subject,
            text: message.body,
          })
        }
        case 'whatsapp': {
          const data = notification.data
          return sendWhatsapp(data, validation.alert.query)
        }
        case 'teams': {
          return sendTeams({
            ...notification.data,
            body: {
              alert: validation.alert.query,
              url,
              time: new Date().toLocaleString(),
              probeState,
              expected: message.expected,
            },
          })
        }
        case 'monika-notif': {
          return sendMonikaNotif({
            ...notification.data,
            body: {
              type: probeState === 'DOWN' ? 'incident' : 'recovery',
              probe_url: url,
              probe_name: probeName,
              ip_address: ipAddress,
              monika_id: probeId,
              alert: validation.alert.query,
              response_time: new Date().toLocaleString(),
            },
          })
        }
        case 'workplace': {
          return sendWorkplace({
            ...notification.data,
            body: message.body,
          })
        }
        case 'desktop': {
          return sendDesktop({
            ...notification.data,
            body: {
              url,
              alert: validation.alert.query,
              time: new Date().toLocaleString(),
              probeState,
              expected: message.expected,
            },
          })
        }
        default: {
          return Promise.resolve()
        }
      }
    })
  )
}
