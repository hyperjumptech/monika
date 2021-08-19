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
  MonikaNotifData,
  SendgridData,
  SMTPData,
  TeamsData,
  TelegramData,
  WebhookData,
  WorkplaceData,
} from '../../interfaces/data'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import {
  desktopNotificationSender,
  discordNotificationSender,
  mailgunNotificationSender,
  monikaNotificationSender,
  sendgridNotificationSender,
  slackNotificationSender,
  smtpNotificationSender,
  teamsNotificationSender,
  telegramNotificationSender,
  webhookNotificationSender,
  workplaceNotificationSender,
} from './sender'
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

const subject = 'Monika is started'
const body = `Monika is running on ${getIp()}`
const probeState = 'INIT'

export const errorMessage = (
  notificationType: string,
  originalErrorMessage?: string
) => {
  return new Error(
    `Failed to send message using ${notificationType}, please check your ${notificationType} notification config.\nMessage: ${originalErrorMessage}`
  )
}

const smtpNotificationInitialChecker = async (data: SMTPData) => {
  try {
    await dataSMTPSchemaValidator.validateAsync(data)
    await smtpNotificationSender({ data, subject, body })

    return 'success'
  } catch (error) {
    throw errorMessage('SMTP', error?.message)
  }
}

const mailgunNotificationInitialChecker = async (data: MailgunData) => {
  try {
    await dataMailgunSchemaValidator.validateAsync(data)
    await mailgunNotificationSender({ data, subject, body })

    return 'success'
  } catch (error) {
    throw errorMessage('Mailgun', error?.message)
  }
}

const sendgridNotificationInitialChecker = async (data: SendgridData) => {
  try {
    await dataSendgridSchemaValidator.validateAsync(data)
    await sendgridNotificationSender({ data, subject, body })

    return 'success'
  } catch (error) {
    throw errorMessage('Sendgrid', error?.message)
  }
}

const webhookNotificationInitialChecker = async (data: WebhookData) => {
  try {
    await dataWebhookSchemaValidator.validateAsync(data)
    await webhookNotificationSender({ url: data.url, body })

    return 'success'
  } catch (error) {
    throw errorMessage('Webhook', error?.message)
  }
}

const discordNotificationInitialChecker = async (data: WebhookData) => {
  try {
    await dataDiscordSchemaValidator.validateAsync(data)
    await discordNotificationSender({ url: data.url, body })

    return 'success'
  } catch (error) {
    throw errorMessage('Discord', error?.message)
  }
}

const slackNotificationInitialChecker = async (data: WebhookData) => {
  try {
    await dataSlackSchemaValidator.validateAsync(data)
    await slackNotificationSender({ url: data.url, body: body })

    return 'success'
  } catch (error) {
    throw errorMessage('Slack', error?.message)
  }
}

const telegramNotificationInitialChecker = async (data: TelegramData) => {
  try {
    await dataTelegramSchemaValidator.validateAsync(data)
    await telegramNotificationSender({ data, body })

    return 'success'
  } catch (error) {
    throw errorMessage('Telegram', error?.message)
  }
}

const teamsNotificationInitialChecker = async (data: TeamsData) => {
  try {
    await dataTeamsSchemaValidator.validateAsync(data)
    await teamsNotificationSender({ data, body, probeState })

    return 'success'
  } catch (error) {
    throw errorMessage('Teams', error?.message)
  }
}

const monikaNotificationInitialChecker = async (data: MonikaNotifData) => {
  try {
    await dataMonikaNotifSchemaValidator.validateAsync(data)
    await monikaNotificationSender({ data, body, probeState })

    return 'success'
  } catch (error) {
    throw errorMessage('Monika-Notif', error?.message)
  }
}

const workplaceNotificationInitialChecker = async (data: WorkplaceData) => {
  try {
    await dataWorkplaceSchemaValidator.validateAsync(data)
    await workplaceNotificationSender({ data, body })

    return 'success'
  } catch (error) {
    throw errorMessage('Workplace', error?.message)
  }
}

const desktopNotificationInitialChecker = async () => {
  try {
    desktopNotificationSender({ body, probeState })

    return 'success'
  } catch (error) {
    throw errorMessage('Desktop', error?.message)
  }
}

export const notificationChecker = async (notifications: Notification[]) => {
  const smtpNotification = notifications
    .filter((notif) => notif.type === 'smtp')
    .map((notif) => notif.data as SMTPData)
    .map(smtpNotificationInitialChecker)

  const mailgunNotification = notifications
    .filter((notif) => notif.type === 'mailgun')
    .map((notif) => notif.data as MailgunData)
    .map(mailgunNotificationInitialChecker)

  const sendgridNotification = notifications
    .filter((notif) => notif.type === 'sendgrid')
    .map((notif) => notif.data as SendgridData)
    .map(sendgridNotificationInitialChecker)

  const webhookNotification = notifications
    .filter((notif) => notif.type === 'webhook')
    .map((notif) => notif.data as WebhookData)
    .map(webhookNotificationInitialChecker)

  const discordNotification = notifications
    .filter((notif) => notif.type === 'discord')
    .map((notif) => notif.data as WebhookData)
    .map(discordNotificationInitialChecker)

  const slackNotification = notifications
    .filter((notif) => notif.type === 'slack')
    .map((notif) => notif.data as WebhookData)
    .map(slackNotificationInitialChecker)

  const teamsNotification = notifications
    .filter((notif) => notif.type === 'teams')
    .map((notif) => notif.data as TeamsData)
    .map(teamsNotificationInitialChecker)
  const telegramNotification = notifications
    .filter((notif) => notif.type === 'telegram')
    .map((notif) => notif.data as TelegramData)
    .map(telegramNotificationInitialChecker)

  const monikaNotification = notifications
    .filter((notif) => notif.type === 'monika-notif')
    .map((notif) => notif.data as MonikaNotifData)
    .map(monikaNotificationInitialChecker)

  const workplaceNotification = notifications
    .filter((notif) => notif.type === 'workplace')
    .map((notif) => notif.data as WorkplaceData)
    .map(workplaceNotificationInitialChecker)

  const desktopNotification = notifications
    .filter((notif) => notif.type === 'desktop')
    .map(desktopNotificationInitialChecker)

  return Promise.all([
    Promise.all(smtpNotification),
    Promise.all(mailgunNotification),
    Promise.all(sendgridNotification),
    Promise.all(webhookNotification),
    Promise.all(slackNotification),
    Promise.all(teamsNotification),
    Promise.all(telegramNotification),
    Promise.all(discordNotification),
    Promise.all(monikaNotification),
    Promise.all(workplaceNotification),
    Promise.all(desktopNotification),
  ])
}
