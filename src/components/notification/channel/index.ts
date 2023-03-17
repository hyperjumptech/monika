import Joi from 'joi'
import type { StatuspageNotification } from '../../../plugins/visualization/atlassian-status-page'
import type { InstatusPageNotification } from '../../../plugins/visualization/instatus'

export { send as sendDesktop, validator } from './desktop'
import type { DesktopNotification } from './desktop'
export {
  send as sendDingtalk,
  validator as dataDingtalkSchemaValidator,
} from './dingtalk'
import type { DingtalkNotification } from './dingtalk'
export {
  send as sendDiscord,
  validator as dataDiscordSchemaValidator,
} from './discord'
import type { DiscordNotification } from './discord'
export {
  send as sendGoogleChat,
  validator as dataGoogleChatSchemaValidator,
} from './googlechat'
import type { GoogleChatNotification } from './googlechat'
export {
  send as sendGotify,
  validator as dataGotifySchemaValidator,
} from './gotify'
import type { GotifyNotification } from './gotify'
export { send as sendLark, validator as dataLarkSchemaValidator } from './lark'
import type { LarkNotification } from './lark'
export {
  send as sendMailgun,
  validator as dataMailgunSchemaValidator,
} from './mailgun'
import type { MailgunNotification } from './mailgun'
export {
  send as sendMonikaNotif,
  validator as dataMonikaNotifSchemaValidator,
} from './monika-notif'
import type { MonikaWhatsappNotification } from './monika-notif'
export {
  send as sendOpsgenie,
  validator as dataOpsgenieSchemaValidator,
} from './opsgenie'
import type { OpsgenieNotification } from './opsgenie'
export { newPagerDuty } from './pagerduty'
import type { PagerDutyNotification } from './pagerduty'
export {
  send as sendPushbullet,
  validator as dataPushbulletSchemaValidator,
} from './pushbullet'
import type { PushbulletNotification } from './pushbullet'
export {
  send as sendPushover,
  validator as dataPushoverSchemaValidator,
} from './pushover'
import type { PushoverNotification } from './pushover'
export {
  send as sendSendgrid,
  validator as dataSendgridSchemaValidator,
} from './sendgrid'
import type { SendgridNotification } from './sendgrid'
export {
  send as sendSlack,
  validator as dataSlackSchemaValidator,
} from './slack'
import type { SlackNotification } from './slack'
export {
  send as sendSmtpMail,
  validator as dataSMTPSchemaValidator,
} from './smtp'
import type { SMTPNotification } from './smtp'
export {
  send as sendTeams,
  validator as dataTeamsSchemaValidator,
} from './teams'
import type { TeamsNotification } from './teams'
export {
  send as sendTelegram,
  validator as dataTelegramSchemaValidator,
} from './telegram'
import type { TelegramNotification } from './telegram'
export {
  send as sendWebhook,
  validator as dataWebhookSchemaValidator,
} from './webhook'
import type { WebhookNotification } from './webhook'
export { send as sendWhatsapp } from './whatsapp'
import type { WhatsappBusinessNotification } from './whatsapp'
export {
  send as sendWorkplace,
  validator as dataWorkplaceSchemaValidator,
} from './workplace'
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

export const dataBaseEmailSchemaValidator = (
  type: string
): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    recipients: Joi.array()
      .items(Joi.string().email().label(`${type} Recipients`))
      .label(`${type} Recipients`),
  })
}

export interface Notifier {
  send(data: Notification, message: NotificationMessage): Promise<void>
}
