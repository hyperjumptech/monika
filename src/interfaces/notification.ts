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
  WhatsappData,
  WorkplaceData,
} from './data'

export type Notification = { id: string } & (
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
)

interface SMTPNotification {
  type: 'smtp'
  data: SMTPData
}

interface MailgunNotification {
  type: 'mailgun'
  data: MailgunData
}

interface SendgridNotification {
  type: 'sendgrid'
  data: SendgridData
}

interface WebhookNotification {
  type: 'webhook'
  data: WebhookData
}

interface SlackNotification {
  type: 'slack'
  data: WebhookData
}

interface WhatsappBusinessNotification {
  type: 'whatsapp'
  data: WhatsappData
}

interface MonikaWhatsappNotification {
  type: 'monika-notif'
  data: MonikaNotifData
}

interface TeamsNotification {
  type: 'teams'
  data: TeamsData
}

interface TelegramNotification {
  type: 'telegram'
  data: TelegramData
}

interface DiscordNotification {
  type: 'discord'
  data: WebhookData
}

interface WorkplaceNotification {
  type: 'workplace'
  data: WorkplaceData
}

interface DesktopNotification {
  type: 'desktop'
  data: DesktopData
}
