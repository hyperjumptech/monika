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
import { sendNotifications } from '.'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { publicIpAddress } from '../../utils/public-ip'
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
} from './validator'

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
  }

  await Promise.all(
    notifications.map(async (notification) => {
      const validator = validators[notification.type]
      if (!validator) return Promise.resolve()
      try {
        return validator.validateAsync(notification.data)
      } catch (error) {
        throw new Error(
          `Please check your ${notification.type} notification config.\nMessage: ${error?.message}`
        )
      }
    })
  )

  const results = await sendNotifications(notifications, {
    subject: 'Monika is started',
    body: `Monika is running on ${publicIpAddress}`,
    summary: `Monika is running on ${publicIpAddress}`,
    meta: {
      type: 'start',
      time: new Date().toUTCString(),
      hostname: hostname(),
      privateIpAddress: getIp(),
      publicIpAddress,
    },
  })

  const sendingErrors = results.reduce((acc, current, index) => {
    if (current.status === 'rejected') {
      acc.push([notifications[index].type, current.reason?.message || ''])
    }
    return acc
  }, [] as [Notification['type'], string][])

  if (sendingErrors.length > 0) {
    const combinedMessage = sendingErrors
      .map(([type, message]) => {
        return `- ${type}, reason: ${message}`
      })
      .join('\n')

    throw new Error(`Failed to send message using following channels, check your connection or your configuration for:'
${combinedMessage}`)
  }
}
