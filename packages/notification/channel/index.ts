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

import type { ArraySchema, ObjectSchema } from 'joi'

import * as dingtalk from './dingtalk.js'
import * as discord from './discord.js'
import * as desktop from './desktop.js'
import * as googlechat from './googlechat.js'
import * as gotify from './gotify.js'
import * as instatus from './instatus/index.js'
import * as lark from './lark.js'
import * as mailgun from './mailgun.js'
import * as monikaNotif from './monika-notif.js'
import * as opsgenie from './opsgenie.js'
import * as pagerduty from './pagerduty.js'
import * as pushbullet from './pushbullet.js'
import * as pushover from './pushover.js'
import * as sendgrid from './sendgrid.js'
import * as slack from './slack.js'
import * as smtp from './smtp.js'
import * as teams from './teams.js'
import * as telegram from './telegram.js'
import * as webhook from './webhook.js'
import * as whatsapp from './whatsapp.js'
import * as workplace from './workplace.js'

type BaseNotificationMessageMeta = {
  type: string
  time: string
  hostname: string
  privateIpAddress: string
  publicIpAddress: string
  [key: string]: unknown
  monikaInstance?: string
  version: string
}

interface NotificationIncidentRecoveryMessageMeta
  extends BaseNotificationMessageMeta {
  probeID: string
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

type NotificationChannel<T = object, U = object> = {
  validator: ArraySchema | ObjectSchema
  send: (
    notificationData: T | T[] | undefined,
    message: NotificationMessage
  ) => Promise<void>
  sendWithCustomContent?: (
    notificationData: T | T[],
    customContent: U | U[]
  ) => Promise<void>
  additionalStartupMessage?: (notificationData: T) => string
}

export type Notification = {
  id: string
  type: string
  data?: object
}

export const channels: Record<string, NotificationChannel> = {
  dingtalk: dingtalk as NotificationChannel<object>,
  discord: discord as NotificationChannel<object>,
  desktop: desktop as NotificationChannel<unknown>,
  'google-chat': googlechat as NotificationChannel<object>,
  gotify: gotify as NotificationChannel<object>,
  instatus: instatus as NotificationChannel<object>,
  lark: lark as NotificationChannel<object>,
  mailgun: mailgun as NotificationChannel<object>,
  'monika-notif': monikaNotif as NotificationChannel<object>,
  opsgenie: opsgenie as NotificationChannel<object>,
  pagerduty: pagerduty as NotificationChannel<object>,
  pushbullet: pushbullet as NotificationChannel<object>,
  pushover: pushover as NotificationChannel<object>,
  sendgrid: sendgrid as NotificationChannel<object>,
  slack: slack as NotificationChannel<object>,
  smtp: smtp as NotificationChannel<object>,
  teams: teams as NotificationChannel<object>,
  telegram: telegram as NotificationChannel<object>,
  webhook: webhook as NotificationChannel<object>,
  whatsapp: whatsapp as NotificationChannel<object>,
  workplace: workplace as NotificationChannel<object>,
}
