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

import {
  MailgunData,
  SMTPData,
  TeamsData,
  TelegramData,
  WebhookData,
  WhatsappData,
  DiscordData,
  MonikaNotifData,
} from '../../interfaces/data'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { getMessageForAlert } from './alert-message'
import { sendMailgun } from './channel/mailgun'
import { sendSlack } from './channel/slack'
import { createSmtpTransport, sendSmtpMail } from './channel/smtp'
import { sendTeams } from './channel/teams'
import { sendTelegram } from './channel/telegram'
import { sendWebhook } from './channel/webhook'
import { sendWhatsapp } from './channel/whatsapp'
import { sendDiscord } from './channel/discord'
import { sendMonikaNotif } from './channel/monika-notif'

export type ValidateResponseStatus = { alert: string; status: boolean }

export async function sendAlerts({
  validation,
  notifications,
  url,
  status,
  incidentThreshold,
  probeName,
  probeId,
  statusCode,
  responseTime,
}: {
  validation: ValidateResponseStatus
  notifications: Notification[]
  url: string
  status: string
  incidentThreshold: number
  probeName?: string
  probeId?: string
  statusCode?: number
  responseTime?: number
}): Promise<
  Array<{
    alert: string
    notification: string
    url: string
  }>
> {
  const ipAddress = getIp()
  const message = getMessageForAlert({
    alert: validation.alert,
    url,
    ipAddress,
    status,
    incidentThreshold,
  })
  const sent = await Promise.all<any>(
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
              recipients: (notification?.data as MailgunData)?.recipients?.join(
                ','
              ),
            },
            notification
          ).then(() => ({
            notification: 'mailgun',
            alert: validation.alert,
            url,
          }))
        }
        case 'webhook': {
          return sendWebhook({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as WebhookData).then(() => ({
            notification: 'webhook',
            alert: validation.alert,
            url,
          }))
        }
        case 'discord': {
          return sendDiscord({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as DiscordData).then(() => ({
            notification: 'discord',
            alert: validation.alert,
            url,
          }))
        }
        case 'slack': {
          return sendSlack({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as WebhookData).then(() => ({
            notification: 'slack',
            alert: validation.alert,
            url,
          }))
        }
        case 'telegram': {
          return sendTelegram({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as TelegramData).then(() => ({
            notification: 'telegram',
            alert: validation.alert,
            url,
          }))
        }
        case 'smtp': {
          const transporter = createSmtpTransport(notification.data as SMTPData)
          return sendSmtpMail(transporter, {
            // TODO: Read from ENV Variables
            from: 'http-probe@hyperjump.tech',
            to: (notification?.data as SMTPData)?.recipients?.join(','),
            subject: message.subject,
            text: message.body,
          }).then(() => ({
            notification: 'smtp',
            alert: validation.alert,
            url,
          }))
        }
        case 'whatsapp': {
          const data = notification.data as WhatsappData
          return sendWhatsapp(data, validation.alert).then(() => ({
            notification: 'whatsapp',
            alert: validation.alert,
            url,
          }))
        }
        case 'teams': {
          return sendTeams({
            ...notification.data,
            body: {
              alert: validation.alert,
              url,
              time: new Date().toLocaleString(),
              status,
            },
          } as TeamsData).then(() => ({
            notification: 'teams',
            alert: validation.alert,
            url,
          }))
        }
        case 'monika-notif': {
          return sendMonikaNotif({
            ...notification.data,
            body: {
              type: status === 'DOWN' ? 'incident' : 'recovery',
              probe_url: url,
              probe_name: probeName,
              ip_address: ipAddress,
              monika_id: probeId,
              status_code: statusCode,
              response_time: responseTime,
            },
          } as MonikaNotifData).then(() => ({
            notification: 'monika-notif',
            alert: validation.alert,
            url,
          }))
        }
        default: {
          return Promise.resolve({
            notification: '',
            alert: validation.alert,
            url,
          })
        }
      }
    })
  )

  return sent
}
