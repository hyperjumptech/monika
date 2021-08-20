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
  WhatsappData,
  WorkplaceData,
} from './data'

export type Notification =
  | SMTPNotification
  | MailgunNotification
  | SendgridNotification
  | WebhookNotification
  | SlackNotification
  | WhatsappBusinessNotification
  | MonikaWhatsappNotification
  | TeamsNotification
  | TelegramNotification
  | DiscordNotification
  | WorkplaceNotification
  | DesktopNotification

interface BaseNotification {
  id: string
}

interface SMTPNotification extends BaseNotification {
  type: 'smtp'
  data: SMTPData
}

interface MailgunNotification extends BaseNotification {
  type: 'mailgun'
  data: MailgunData
}

interface SendgridNotification extends BaseNotification {
  type: 'sendgrid'
  data: SendgridData
}

interface WebhookNotification extends BaseNotification {
  type: 'webhook'
  data: WebhookData
}

interface SlackNotification extends BaseNotification {
  type: 'slack'
  data: WebhookData
}

interface WhatsappBusinessNotification extends BaseNotification {
  type: 'whatsapp'
  data: WhatsappData
}

interface MonikaWhatsappNotification extends BaseNotification {
  type: 'monika-notif'
  data: MonikaNotifData
}

interface TeamsNotification extends BaseNotification {
  type: 'teams'
  data: TeamsData
}

interface TelegramNotification extends BaseNotification {
  type: 'telegram'
  data: TelegramData
}

interface DiscordNotification extends BaseNotification {
  type: 'discord'
  data: WebhookData
}

interface WorkplaceNotification extends BaseNotification {
  type: 'workplace'
  data: WorkplaceData
}

interface DesktopNotification extends BaseNotification {
  type: 'desktop'
  // actually do not need data property
  // it is here just to make type consistent and does not throw type error in other parts of app
  data: undefined
}
