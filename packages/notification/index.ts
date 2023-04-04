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

import type { AnySchema } from 'joi'

import * as dingtalk from './channel/dingtalk'
import * as discord from './channel/discord'
import * as desktop from './channel/desktop'
import * as googlechat from './channel/googlechat'
import * as gotify from './channel/gotify'
import * as lark from './channel/lark'
import * as mailgun from './channel/mailgun'
import * as monikaNotif from './channel/monika-notif'
import * as opsgenie from './channel/opsgenie'
import * as pagerduty from './channel/pagerduty'
import * as pushbullet from './channel/pushbullet'
import * as pushover from './channel/pushover'
import * as sendgrid from './channel/sendgrid'
import * as slack from './channel/slack'
import * as smtp from './channel/smtp'
import * as teams from './channel/teams'
import * as telegram from './channel/telegram'
import * as webhook from './channel/webhook'
import * as whatsapp from './channel/whatsapp'
import * as workplace from './channel/workplace'

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

type NotificationChannel<T = any> = {
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
