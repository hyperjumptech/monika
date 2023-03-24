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
import type { Notification, NotificationMessage } from './channel'
import { ValidatedResponse } from '../../plugins/validate-response'
import getIp from '../../utils/ip'
import { getMessageForAlert } from './alert-message'
import {
  sendDesktop,
  newPagerDuty,
  sendDingtalk,
  sendDiscord,
  sendGoogleChat,
  sendGotify,
  sendLark,
  sendMailgun,
  sendMonikaNotif,
  sendOpsgenie,
  sendPushbullet,
  sendPushover,
  sendSendgrid,
  sendSlack,
  sendSmtpMail,
  sendTeams,
  sendTelegram,
  sendWebhook,
  sendWhatsapp,
  sendWorkplace,
} from './channel'

export class NotificationSendingError extends Error {
  notificationType: string

  private constructor(notificationType: string, message: string) {
    super(message)
    this.name = 'NotificationSendingError'
    this.notificationType = notificationType
  }

  static create(
    notificationType: string,
    originalErrorMessage?: string
  ): NotificationSendingError {
    return new NotificationSendingError(
      notificationType,
      `Failed to send message using ${notificationType}, please check your ${notificationType} notification config.\nMessage: ${originalErrorMessage}`
    )
  }
}

export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
): Promise<void> {
  const pagerduty = newPagerDuty()

  await Promise.all(
    // eslint-disable-next-line complexity
    notifications.map(async ({ data, type }) => {
      // catch and rethrow error to add information about which notification channel errors.
      try {
        switch (type) {
          case 'mailgun': {
            await sendMailgun(data, message)
            break
          }

          case 'sendgrid': {
            await sendSendgrid(data, message)
            break
          }

          case 'webhook': {
            await sendWebhook(data, message)
            break
          }

          case 'discord': {
            await sendDiscord(data, message)
            break
          }

          case 'dingtalk': {
            await sendDingtalk(data, message)
            break
          }

          case 'opsgenie': {
            await sendOpsgenie(data, message)
            break
          }

          case 'slack': {
            await sendSlack(data, message)
            break
          }

          case 'telegram': {
            await sendTelegram(data, message)
            break
          }

          case 'pushover': {
            await sendPushover(data, message)
            break
          }

          case 'gotify': {
            await sendGotify(data, message)
            break
          }

          case 'pushbullet': {
            await sendPushbullet(data, message)
            break
          }

          case 'smtp': {
            await sendSmtpMail(data, message)
            break
          }

          case 'whatsapp': {
            await sendWhatsapp(data, message)
            break
          }

          case 'teams': {
            await sendTeams(data, message)
            break
          }

          case 'monika-notif': {
            await sendMonikaNotif(data, message)
            break
          }

          case 'workplace': {
            await sendWorkplace(data, message)
            break
          }

          case 'desktop': {
            sendDesktop(data, message)
            break
          }

          case 'lark': {
            await sendLark(data, message)
            break
          }

          case 'google-chat': {
            await sendGoogleChat(data, message)
            break
          }

          case pagerduty.slug:
            await pagerduty.send(data, message)
            break

          default: {
            break
          }
        }

        return Promise.resolve()
      } catch (error: any) {
        throw NotificationSendingError.create(type, error?.message)
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
}: SendAlertsProps): Promise<void> {
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
