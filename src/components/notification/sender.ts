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
  DesktopData,
  MailgunData,
  MonikaNotifData,
  SendgridData,
  SMTPData,
  TeamsData,
  TelegramData,
  WebhookData,
  WorkplaceData,
} from '../../interfaces/data'
import getIp from '../../utils/ip'
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
import { sendWorkplace } from './channel/workplace'

export const errorMessage = (
  notificationType: string,
  originalErrorMessage?: string
) => {
  return new Error(
    `Failed to send message using ${notificationType}, please check your ${notificationType} notification config.\nMessage: ${originalErrorMessage}`
  )
}

export const smtpNotificationSender = async ({
  data,
  subject,
  body,
}: {
  data: SMTPData
  subject: string
  body: string
}) => {
  const transporter = createSmtpTransport(data)

  await sendSmtpMail(transporter, {
    from: 'Monika@hyperjump.tech',
    to: data?.recipients?.join(','),
    subject: subject,
    text: body,
  })
}

export const mailgunNotificationSender = async ({
  data,
  subject,
  body,
}: {
  data: MailgunData
  subject: string
  body: string
}) => {
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
    data
  )
}

export const sendgridNotificationSender = async ({
  data,
  subject,
  body,
}: {
  data: SendgridData
  subject: string
  body: string
}) => {
  await sendSendgrid(
    {
      recipients: data?.recipients?.join(','),
      subject: subject,
      body: body,
      sender: {
        name: 'Monika',
        email: data?.sender,
      },
    },
    data
  )
}

export const webhookNotificationSender = async ({ url, body }: WebhookData) => {
  await sendWebhook({ url, body })
}

export const discordNotificationSender = async ({ url, body }: WebhookData) => {
  await sendDiscord({ url, body })
}

export const slackNotificationSender = async ({ url, body }: WebhookData) => {
  await sendSlack({ url, body })
}

export const telegramNotificationSender = async ({
  data,
  body,
}: {
  data: TelegramData
  body: string
}) => {
  await sendTelegram({
    group_id: data?.group_id,
    bot_token: data?.bot_token,
    body,
  })
}

export const teamsNotificationSender = async ({
  data,
  body,
  status,
}: {
  data: TeamsData
  body: string
  status: string
}) => {
  await sendTeams({
    url: data?.url,
    body: {
      url: '-',
      alert: body,
      time: new Date().toLocaleString(),
      status,
    },
  })
}

export const monikaNotificationSender = async ({
  data,
  body,
  status,
}: {
  data: MonikaNotifData
  body: string
  status: string
}) => {
  await sendMonikaNotif({
    url: data?.url,
    body: {
      type: status === 'INIT' ? 'start' : 'termination',
      probe_url: '-',
      ip_address: getIp(),
      response_time: new Date().toLocaleString(),
      alert: body,
    },
  })
}

export const workplaceNotificationSender = async ({
  data,
  body,
}: {
  data: WorkplaceData
  body: string
}) => {
  await sendWorkplace({
    thread_id: data.thread_id,
    access_token: data.access_token,
    body,
  })
}

export const desktopNotificationSender = async ({
  data,
  body,
  status,
}: {
  data: DesktopData
  body: string
  status: string
}) => {
  await sendDesktop({
    url: data?.url,
    body: {
      url: '-',
      alert: body,
      time: new Date().toLocaleString(),
      status,
    },
  })
}
