import type { AnySchema } from 'joi'

import * as dingtalk from './dingtalk'
import * as discord from './discord'
import * as desktop from './desktop'
import * as googlechat from './googlechat'
import * as gotify from './gotify'
import * as lark from './lark'
import * as mailgun from './mailgun'
import * as monikaNotif from './monika-notif'
import * as opsgenie from './opsgenie'
import * as pagerduty from './pagerduty'
import * as pushbullet from './pushbullet'
import * as pushover from './pushover'
import * as sendgrid from './sendgrid'
import * as slack from './slack'
import * as smtp from './smtp'
import * as teams from './teams'
import * as telegram from './telegram'
import * as webhook from './webhook'
import * as whatsapp from './whatsapp'
import * as workplace from './workplace'

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

export type NotificationChannel<T = any> = {
  validator: AnySchema
  send: (notificationData: T, message: NotificationMessage) => Promise<void>
  additionalStartupMessage?: (notificationData: T) => string
}

export type Notification = {
  id: string
  type: string
  data: any
}

export const channels: Record<string, NotificationChannel> = {
  dingtalk,
  discord,
  desktop,
  'google-chat': googlechat,
  gotify,
  lark,
  mailgun,
  'monika-notif': monikaNotif,
  opsgenie,
  pagerduty,
  pushbullet,
  pushover,
  sendgrid,
  slack,
  smtp,
  teams,
  telegram,
  webhook,
  whatsapp,
  workplace,
}
