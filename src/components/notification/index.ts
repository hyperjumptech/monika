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

import { getContext, setContext } from '../../context'
import { MonikaNotifDataBody } from '../../interfaces/data'
import {
  Notification,
  NotificationMessage,
} from '../../interfaces/notification'
import { ValidatedResponse } from '../../plugins/validate-response'
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
import { sendLark } from './channel/lark'
import { sendGoogleChat } from './channel/googlechat'

export class NotificationSendingError extends Error {
  notificationType: string

  private constructor(notificationType: string, message: string) {
    super(message)
    this.name = 'NotificationSendingError'
    this.notificationType = notificationType
  }

  static create(notificationType: string, originalErrorMessage?: string) {
    // for the sake of passing test
    const notificationTypeformatted = notificationType
      .split('-')
      .map((s) => s[0].toUpperCase() + s.substring(1))
      .join('-')
      .replace(/^smtp$/i, 'SMTP')

    return new NotificationSendingError(
      notificationType,
      `Failed to send message using ${notificationTypeformatted}, please check your ${notificationTypeformatted} notification config.\nMessage: ${originalErrorMessage}`
    )
  }
}

export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
) {
  await Promise.all(
    // eslint-disable-next-line complexity
    notifications.map(async (notification) => {
      // catch and rethrow error to add information about which notification channel errors.
      try {
        switch (notification.type) {
          case 'mailgun': {
            await sendMailgun(
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
            break
          }
          case 'sendgrid': {
            await sendSendgrid(
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
            break
          }
          case 'webhook': {
            await sendWebhook({
              ...notification.data,
              body: message.body,
            })
            break
          }
          case 'discord': {
            await sendDiscord({
              ...notification.data,
              body: message.body,
            })
            break
          }
          case 'slack': {
            await sendSlack(notification.data, message)
            break
          }
          case 'telegram': {
            await sendTelegram({
              ...notification.data,
              body: message.body,
            })
            break
          }
          case 'smtp': {
            const transporter = createSmtpTransport(notification.data)
            await sendSmtpMail(transporter, {
              // TODO: Read from ENV Variables
              from: 'Monika@hyperjump.tech',
              to: notification?.data?.recipients?.join(','),
              subject: message.subject,
              text: message.body,
            })
            break
          }
          case 'whatsapp': {
            await sendWhatsapp(notification.data, message.body)
            break
          }
          case 'teams': {
            await sendTeams(notification.data, message)
            break
          }
          case 'monika-notif': {
            let body: MonikaNotifDataBody

            if (
              message.meta.type === 'start' ||
              message.meta.type === 'termination'
            ) {
              body = {
                type: message.meta.type,
                ip_address: message.body,
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
                monika: message.meta.monikaInstance,
              }
            } else if (message.meta.type === 'status-update') {
              body = {
                type: message.meta.type,
                time: message.meta.time,
                monika: message.meta.monikaInstance,
                numberOfProbes: String(message.meta.numberOfProbes),
                maxResponseTime: String(message.meta.maxResponseTime),
                minResponseTime: String(message.meta.minResponseTime),
                averageResponseTime: String(message.meta.averageResponseTime),
                numberOfIncidents: String(message.meta.numberOfIncidents),
                numberOfRecoveries: String(message.meta.numberOfRecoveries),
                numberOfSentNotifications: String(
                  message.meta.numberOfSentNotifications
                ),
              }
            }

            await sendMonikaNotif({
              ...notification.data,
              body: body!,
            })
            break
          }
          case 'workplace': {
            await sendWorkplace({
              ...notification.data,
              body: message.body,
            })
            break
          }
          case 'desktop': {
            await sendDesktop({
              title: message.subject,
              message: message.summary || message.body,
            })
            break
          }

          case 'lark': {
            await sendLark(notification.data, message)
            break
          }

          case 'google-chat': {
            await sendGoogleChat(notification.data, message)
            break
          }

          default: {
            break
          }
        }
        return Promise.resolve()
      } catch (error) {
        throw NotificationSendingError.create(notification.type, error?.message)
      }
    })
  )
}

type SendAlertsProps = {
  probeID: string
  validation: ValidatedResponse
  notifications: Notification[]
  url: string
  probeState: string
}

export async function sendAlerts({
  probeID,
  validation,
  notifications,
  url,
  probeState,
}: SendAlertsProps) {
  const ipAddress = getIp()
  const isRecovery = probeState === 'UP'
  const message = await getMessageForAlert({
    probeID,
    alert: validation.alert,
    url,
    ipAddress,
    isRecovery,
    response: validation.response,
  })

  updateLastIncidentData(isRecovery, probeID, url)

  return sendNotifications(notifications, message)
}

function updateLastIncidentData(
  isRecovery: boolean,
  probeID: string,
  url: string
) {
  const { incidents } = getContext()

  if (isRecovery) {
    // delete last incident
    const newIncidents = incidents.filter(
      (incident) =>
        incident.probeID !== probeID && incident.probeRequestURL !== url
    )

    setContext({ incidents: newIncidents })
    return
  }

  // set incident date time to global context to be used later on recovery notification
  const newIncident = { probeID, probeRequestURL: url, createdAt: new Date() }

  setContext({ incidents: [...incidents, newIncident] })
}
