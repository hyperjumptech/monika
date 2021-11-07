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
import { NotificationSendingError, sendNotifications } from '.'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { getMessageForStart } from './alert-message'
import {
  dataDiscordSchemaValidator,
  dataMailgunSchemaValidator,
  dataMonikaNotifSchemaValidator,
  dataSendgridSchemaValidator,
  dataSlackSchemaValidator,
  dataSMTPSchemaValidator,
  dataTeamsSchemaValidator,
  dataTelegramSchemaValidator,
  dataWebhookSchemaValidator,
  dataWorkplaceSchemaValidator,
  dataLarkSchemaValidator,
  dataGoogleChatSchemaValidator,
} from './validator'

// reexported with alias because this `errorMessage` function is used in test file
export const errorMessage = NotificationSendingError.create

export const notificationChecker = async (notifications: Notification[]) => {
  const validators = {
    desktop: null,
    discord: dataDiscordSchemaValidator,
    mailgun: dataMailgunSchemaValidator,
    'monika-notif': dataMonikaNotifSchemaValidator,
    sendgrid: dataSendgridSchemaValidator,
    slack: dataSlackSchemaValidator,
    smtp: dataSMTPSchemaValidator,
    teams: dataTeamsSchemaValidator,
    telegram: dataTelegramSchemaValidator,
    webhook: dataWebhookSchemaValidator,
    whatsapp: dataWebhookSchemaValidator,
    workplace: dataWorkplaceSchemaValidator,
    lark: dataLarkSchemaValidator,
    'google-chat': dataGoogleChatSchemaValidator,
  }

  await Promise.all(
    notifications.map(async (notification) => {
      const validator = validators[notification.type]
      if (!validator) return Promise.resolve()
      try {
        const validated = await validator.validateAsync(notification.data)
        return validated
      } catch (error) {
        throw NotificationSendingError.create(notification.type, error?.message)
      }
    })
  )

  const message = await getMessageForStart(hostname(), getIp())
  await sendNotifications(notifications, message)
}
