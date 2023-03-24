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

import { validator as dataStatuspageSchemaValidator } from '../../../../plugins/visualization/atlassian-status-page'
import { validator as dataInstatusSchemaValidator } from '../../../../plugins/visualization/instatus'
import { NotificationSendingError } from '../../../notification'
import {
  dataDingtalkSchemaValidator,
  dataDiscordSchemaValidator,
  dataGoogleChatSchemaValidator,
  dataGotifySchemaValidator,
  dataLarkSchemaValidator,
  dataMailgunSchemaValidator,
  dataMonikaNotifSchemaValidator,
  dataOpsgenieSchemaValidator,
  dataPushbulletSchemaValidator,
  dataPushoverSchemaValidator,
  dataSendgridSchemaValidator,
  dataSlackSchemaValidator,
  dataSMTPSchemaValidator,
  dataTeamsSchemaValidator,
  dataTelegramSchemaValidator,
  dataWebhookSchemaValidator,
  dataWorkplaceSchemaValidator,
  newPagerDuty,
  Notification,
  validator,
} from '../../../notification/channel'

// reexported with alias because this `errorMessage` function is used in test file
export const errorMessage = NotificationSendingError.create

export const validateNotification = async (
  notifications: Notification[]
): Promise<void> => {
  const hasNotification = notifications.length > 0
  if (!hasNotification) {
    return
  }

  const pagerduty = newPagerDuty()
  const validators = {
    desktop: validator,
    dingtalk: dataDingtalkSchemaValidator,
    discord: dataDiscordSchemaValidator,
    'google-chat': dataGoogleChatSchemaValidator,
    gotify: dataGotifySchemaValidator,
    instatus: dataInstatusSchemaValidator,
    lark: dataLarkSchemaValidator,
    mailgun: dataMailgunSchemaValidator,
    'monika-notif': dataMonikaNotifSchemaValidator,
    opsgenie: dataOpsgenieSchemaValidator,
    pagerduty: pagerduty.validator,
    pushbullet: dataPushbulletSchemaValidator,
    pushover: dataPushoverSchemaValidator,
    sendgrid: dataSendgridSchemaValidator,
    slack: dataSlackSchemaValidator,
    smtp: dataSMTPSchemaValidator,
    statuspage: dataStatuspageSchemaValidator,
    teams: dataTeamsSchemaValidator,
    telegram: dataTelegramSchemaValidator,
    webhook: dataWebhookSchemaValidator,
    whatsapp: dataWebhookSchemaValidator,
    workplace: dataWorkplaceSchemaValidator,
  }

  await Promise.all(
    notifications.map(async (notification) => {
      const validator = validators[notification.type]

      if (!validator) {
        return
      }

      try {
        await validator.validateAsync(notification.data)
      } catch (error: any) {
        throw NotificationSendingError.create(notification.type, error?.message)
      }
    })
  )
}
