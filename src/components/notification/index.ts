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

import { MonikaNotifDataBody } from '../../interfaces/data'
import {
  Notification,
  NotificationMessage,
} from '../../interfaces/notification'
import { ValidateResponse } from '../../plugins/validate-response'
import getIp from '../../utils/ip'
import { getMessageForAlert } from './alert-message'
import { sendDesktop } from './channel/desktop'
import { sendDiscord } from './channel/discord'
import { sendMailgun } from './channel/mailgun'
import { sendMonikaNotif } from './channel/monika-notif'
import { sendSendgrid } from './channel/sendgrid'
import { sendSlack } from './channel/slack'
import { createSmtpTransport, sendSmtpMail } from './channel/smtp'
import { sendTeams } from './channel/teams'
import { sendTelegram } from './channel/telegram'
import { sendWebhook } from './channel/webhook'
import { sendWhatsapp } from './channel/whatsapp'
import { sendWorkplace } from './channel/workplace'

export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
) {
  return Promise.allSettled(
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
        case 'sendgrid': {
          return sendSendgrid(
            {
              recipients: notification?.data?.recipients?.join(','),
              subject: message.subject,
              body: message.body,
              sender: {
                name: 'Monika',
                email: notification?.data?.sender,
              },
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
          return sendWhatsapp(data, message.body)
        }
        case 'teams': {
          return sendTeams(notification.data, message)
        }
        case 'monika-notif': {
          let body: MonikaNotifDataBody

          if (
            message.meta.type === 'start' ||
            message.meta.type === 'termination'
          ) {
            body = {
              type: message.meta.type,
              ip_address: message.meta.publicIpAddress,
            }
          } else if (
            message.meta.type === 'incident' ||
            message.meta.type === 'recovery'
          ) {
            body = {
              type: message.meta.type,
              alert: message.summary,
              url: message.meta.url,
              time: message.meta.time,
              monika: `${message.meta.privateIpAddress} (local), ${
                message.meta.publicIpAddress
                  ? `${message.meta.publicIpAddress} (public)`
                  : ''
              } ${message.meta.hostname} (hostname)`,
            }
          }

          return sendMonikaNotif({
            ...notification.data,
            body: body!,
          })
        }
        case 'workplace': {
          return sendWorkplace({
            ...notification.data,
            body: message.body,
          })
        }
        case 'desktop': {
          sendDesktop({
            title: message.subject,
            message: message.summary || message.body,
          })
          // for type consitency
          // because all other functions above return promise
          return Promise.resolve()
        }
        default: {
          return Promise.resolve()
        }
      }
    })
  )
}

export async function sendAlerts({
  validation,
  notifications,
  url,
  probeState,
  incidentThreshold,
}: {
  validation: ValidateResponse
  notifications: Notification[]
  url: string
  probeState: string
  incidentThreshold: number
}) {
  const ipAddress = getIp()
  const message = getMessageForAlert({
    alert: validation.alert,
    url,
    ipAddress,
    probeState,
    incidentThreshold,
    responseValue: validation.responseValue,
  })

  return sendNotifications(notifications, message)
}
