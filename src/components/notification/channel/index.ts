import type { StatuspageNotification } from '../../../plugins/visualization/atlassian-status-page'
import type { InstatusPageNotification } from '../../../plugins/visualization/instatus'

export { send as sendDesktop } from './desktop'
import type { DesktopNotification } from './desktop'
export { send as sendDingtalk } from './dingtalk'
import type { DingtalkNotification } from './dingtalk'
export { send as sendDiscord } from './discord'
import type { DiscordNotification } from './discord'
export { send as sendGoogleChat } from './googlechat'
import type { GoogleChatNotification } from './googlechat'
export { send as sendGotify } from './gotify'
import type { GotifyNotification } from './gotify'
export { send as sendLark } from './lark'
import type { LarkNotification } from './lark'
export { send as sendMailgun } from './mailgun'
import type { MailgunNotification } from './mailgun'
export { send as sendMonikaNotif } from './monika-notif'
import type { MonikaWhatsappNotification } from './monika-notif'
export { send as sendOpsgenie } from './opsgenie'
import type { OpsgenieNotification } from './opsgenie'
export { newPagerDuty } from './pagerduty'
import type { PagerDutyNotification } from './pagerduty'
export { send as sendPushbullet } from './pushbullet'
import type { PushbulletNotification } from './pushbullet'
export { send as sendPushover } from './pushover'
import type { PushoverNotification } from './pushover'
export { send as sendSendgrid } from './sendgrid'
import type { SendgridNotification } from './sendgrid'
export { send as sendSlack } from './slack'
import type { SlackNotification } from './slack'
export { send as sendSmtpMail } from './smtp'
import type { SMTPNotification } from './smtp'
export { send as sendTeams } from './teams'
import type { TeamsNotification } from './teams'
export { send as sendTelegram } from './telegram'
import type { TelegramNotification } from './telegram'
export { send as sendWebhook } from './webhook'
import type { WebhookNotification } from './webhook'
export { send as sendWhatsapp } from './whatsapp'
import type { WhatsappBusinessNotification } from './whatsapp'
export { send as sendWorkplace } from './workplace'
import type { WorkplaceNotification } from './workplace'

export type Notification =
  | DesktopNotification
  | DingtalkNotification
  | DiscordNotification
  | GoogleChatNotification
  | GotifyNotification
  | InstatusPageNotification
  | LarkNotification
  | MailgunNotification
  | MonikaWhatsappNotification
  | OpsgenieNotification
  | PagerDutyNotification
  | PushbulletNotification
  | PushoverNotification
  | SendgridNotification
  | SlackNotification
  | StatuspageNotification
  | SMTPNotification
  | TeamsNotification
  | TelegramNotification
  | WebhookNotification
  | WhatsappBusinessNotification
  | WorkplaceNotification

type BaseNotificationMessageMeta = {
  type: string
  time: string
  hostname: string
  privateIpAddress: string
  publicIpAddress: string
  [key: string]: unknown
  monikaInstance?: any
  version: string
}

interface NotificationIncidentRecoveryMessageMeta
  extends BaseNotificationMessageMeta {
  type: 'incident' | 'recovery'
  url: string
}

interface NotificationStartTerminationMessageMeta
  extends BaseNotificationMessageMeta {
  type: 'start' | 'termination'
}

interface NotificationStatusUpdateMessageMeta
  extends BaseNotificationMessageMeta {
  type: 'status-update'
  numberOfProbes: number
  averageResponseTime: number
  numberOfIncidents: number
  numberOfRecoveries: number
  numberOfSentNotifications: number
}

export type NotificationMessage = {
  subject: string
  body: string
  summary: string
  meta:
    | NotificationIncidentRecoveryMessageMeta
    | NotificationStartTerminationMessageMeta
    | NotificationStatusUpdateMessageMeta
}

export interface Notifier {
  send(data: Notification, message: NotificationMessage): Promise<void>
}
