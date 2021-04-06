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
  SendgridData,
  SMTPData,
  TelegramData,
  WebhookData,
  TeamsData,
  DiscordData,
} from '../../interfaces/data'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { sendMailgun } from './channel/mailgun'
import { sendSendgrid } from './channel/sendgrid'
import { sendSlack } from './channel/slack'
import { createSmtpTransport, sendSmtpMail } from './channel/smtp'
import { sendTelegram } from './channel/telegram'
import { sendWebhook } from './channel/webhook'
import { sendTeams } from './channel/teams'
import { sendDiscord } from './channel/discord'

const subject = 'Monika is started'
const body = `Monika is running on ${getIp()}`

const errorMessage = (
  notificationType: string,
  originalErrorMessage?: string
) => {
  return new Error(
    `Failed to send message using ${notificationType}, please check your ${notificationType} notification config.\nMessage: ${originalErrorMessage}`
  )
}

const smtpNotificationInitialChecker = async (data: SMTPData) => {
  try {
    const transporter = createSmtpTransport(data)

    await sendSmtpMail(transporter, {
      from: 'Monika@hyperjump.tech',
      to: data?.recipients?.join(','),
      subject: subject,
      text: body,
    })
  } catch (error) {
    throw errorMessage('SMTP', error?.message)
  }
}

const mailgunNotificationInitialChecker = async (data: MailgunData) => {
  try {
    await sendMailgun(
      {
        recipients: data?.recipients?.join(','),
        subject: subject,
        body: body,
        sender: {
          name: 'Monika',
          email: 'monika@hyperjump.tech',
        },
      },
      { id: 'mailgun', type: 'mailgun', data }
    )
  } catch (error) {
    throw errorMessage('Mailgun', error?.message)
  }
}

const sendgridNotificationInitialChecker = async (data: SendgridData) => {
  try {
    await sendSendgrid(
      {
        recipients: data?.recipients?.join(','),
        subject: subject,
        body: body,
        sender: {
          name: 'Monika',
          email: 'monika@hyperjump.tech',
        },
      },
      { id: 'sendgrid', type: 'sendgrid', data }
    )
  } catch (error) {
    throw errorMessage('Sendgrid', error?.message)
  }
}

const webhookNotificationInitialChecker = async (data: WebhookData) => {
  try {
    await sendWebhook({
      url: data?.url,
      body: {
        url: '-',
        alert: body,
        time: new Date().toLocaleString(),
      },
    })
  } catch (error) {
    throw errorMessage('Webhook', error?.message)
  }
}

const discordNotificationInitialChecker = async (data: WebhookData) => {
  try {
    await sendDiscord({
      url: data?.url,
      body: {
        url: '-',
        alert: body,
        time: new Date().toLocaleString(),
      },
    })
  } catch (error) {
    throw errorMessage('discord', error?.message)
  }
}

const slackNotificationInitialChecker = async (data: WebhookData) => {
  try {
    await sendSlack({
      url: data?.url,
      body: {
        url: '-',
        alert: body,
        time: new Date().toLocaleString(),
      },
    })
  } catch (error) {
    throw errorMessage('Slack', error?.message)
  }
}

const telegramNotificationInitialChecker = async (data: TelegramData) => {
  try {
    await sendTelegram({
      group_id: data?.group_id,
      bot_token: data?.bot_token,
      body: {
        url: '-',
        alert: body,
        time: new Date().toLocaleString(),
      },
    })
  } catch (error) {
    throw errorMessage('Telegram', error?.message)
  }
}

const teamsNotificationInitialChecker = async (data: TeamsData) => {
  try {
    await sendTeams({
      url: data?.url,
      body: {
        url: '-',
        alert: body,
        time: new Date().toLocaleString(),
        status: 'INIT',
      },
    })
  } catch (error) {
    throw errorMessage('Teams', error?.message)
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
    .map((notif) => notif.data as DiscordData)
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

  return Promise.all([
    Promise.all(smtpNotification),
    Promise.all(mailgunNotification),
    Promise.all(sendgridNotification),
    Promise.all(webhookNotification),
    Promise.all(slackNotification),
    Promise.all(teamsNotification),
    Promise.all(telegramNotification),
    Promise.all(discordNotification),
  ])
}
