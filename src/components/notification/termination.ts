import {
  smtpNotificationSender,
  mailgunNotificationSender,
  sendgridNotificationSender,
  webhookNotificationSender,
  discordNotificationSender,
  slackNotificationSender,
  telegramNotificationSender,
  teamsNotificationSender,
  monikaNotificationSender,
  workplaceNotificationSender,
  desktopNotificationSender,
} from './sender'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import {
  DesktopData,
  DiscordData,
  MailgunData,
  MonikaNotifData,
  SendgridData,
  SMTPData,
  TeamsData,
  TelegramData,
  WebhookData,
  WorkplaceData,
} from '../../interfaces/data'

const subject = 'Monika terminated'
const body = `Monika is no longer running in ${getIp()}`
const status = 'TERMINATE'

export const errorMessage = (
  notificationType: string,
  originalErrorMessage?: string
) => {
  return new Error(
    `Failed to send message using ${notificationType}, please check your ${notificationType} notification config.\nMessage: ${originalErrorMessage}`
  )
}

export const terminationNotif = async (notifications: Notification[]) => {
  const smtpNotification = notifications
    .filter((notif) => notif.type === 'smtp')
    .map((notif) => notif.data as SMTPData)
    .map((data) => smtpNotificationSender({ data, subject, body }))

  const mailgunNotification = notifications
    .filter((notif) => notif.type === 'mailgun')
    .map((notif) => notif.data as MailgunData)
    .map((data) => mailgunNotificationSender({ data, subject, body }))

  const sendgridNotification = notifications
    .filter((notif) => notif.type === 'sendgrid')
    .map((notif) => notif.data as SendgridData)
    .map((data) => sendgridNotificationSender({ data, subject, body }))

  const webhookNotification = notifications
    .filter((notif) => notif.type === 'webhook')
    .map((notif) => notif.data as WebhookData)
    .map((data) => webhookNotificationSender({ data, body }))

  const discordNotification = notifications
    .filter((notif) => notif.type === 'discord')
    .map((notif) => notif.data as DiscordData)
    .map((data) => discordNotificationSender({ data, body }))

  const slackNotification = notifications
    .filter((notif) => notif.type === 'slack')
    .map((notif) => notif.data as WebhookData)
    .map((data) => slackNotificationSender({ data, body }))

  const teamsNotification = notifications
    .filter((notif) => notif.type === 'teams')
    .map((notif) => notif.data as TeamsData)
    .map((data) => teamsNotificationSender({ data, body, status }))

  const telegramNotification = notifications
    .filter((notif) => notif.type === 'telegram')
    .map((notif) => notif.data as TelegramData)
    .map((data) => telegramNotificationSender({ data, body }))

  const monikaNotification = notifications
    .filter((notif) => notif.type === 'monika-notif')
    .map((notif) => notif.data as MonikaNotifData)
    .map((data) => monikaNotificationSender({ data, body, status }))

  const workplaceNotification = notifications
    .filter((notif) => notif.type === 'workplace')
    .map((notif) => notif.data as WorkplaceData)
    .map((data) => workplaceNotificationSender({ data, body }))

  const desktopNotification = notifications
    .filter((notif) => notif.type === 'desktop')
    .map((notif) => notif.data as DesktopData)
    .map((data) => desktopNotificationSender({ data, body, status }))

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
