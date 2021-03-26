import ip from 'ip'

import {
  MailgunData,
  SendgridData,
  SMTPData,
  WebhookData,
} from '../../interfaces/data'
import { Notification } from '../../interfaces/notification'
import { sendMailgun } from '../mailgun'
import { sendSendgrid } from '../sendgrid'
import { createSmtpTransport, sendSmtpMail } from '../smtp'
import { sendSlack } from './slack'
import { sendWebhook } from './webhook'

const subject = 'Monika is started'
const body = `Monika is running on ${ip.address()}`

const errorMessage = (context: string) => {
  return `Failed to send message using ${context}, please check your ${context} notification config.`
}

const smtpNotificationInitialChecker = async (data: SMTPData) => {
  try {
    const transporter = createSmtpTransport(data)

    await sendSmtpMail(transporter, {
      from: 'Monika@hyperjump.tech',
      to: data?.recipients?.join(','),
      subject: subject,
      html: body,
    })
  } catch (error) {
    throw new Error(errorMessage('SMTP'))
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
    throw new Error(errorMessage('Mailgun'))
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
    throw new Error(errorMessage('Sendgrid'))
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
    throw new Error(errorMessage('Webhook'))
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
    throw new Error(errorMessage('Slack'))
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

  const slackNotification = notifications
    .filter((notif) => notif.type === 'slack')
    .map((notif) => notif.data as WebhookData)
    .map(slackNotificationInitialChecker)

  return Promise.all([
    Promise.all(smtpNotification),
    Promise.all(mailgunNotification),
    Promise.all(sendgridNotification),
    Promise.all(webhookNotification),
    Promise.all(slackNotification),
  ])
}
