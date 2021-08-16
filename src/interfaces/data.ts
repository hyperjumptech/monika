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

export interface MailData {
  recipients: string[]
}

export interface MailgunData extends MailData {
  apiKey: string
  domain: string
  username?: string
}

export interface SendgridData extends MailData {
  apiKey: string
}

export interface SMTPData extends MailData {
  hostname: string
  port: number
  username: string
  password: string
}

export interface TeamsData {
  url: string
  body: TeamsDataBody
}

export interface TeamsDataBody extends WebhookDataBody {
  status: string
  expected?: string
}

export interface WebhookData {
  url: string
  body: string
}

export interface MonikaNotifData {
  url: string
  body: MonikaNotifDataBody
}

export interface MonikaNotifDataBody {
  type: 'start' | 'incident' | 'recovery' | 'termination'
  probe_url: string
  probe_name?: string
  monika_id?: string
  ip_address: string
  response_time: string
  alert: string
}

export interface TelegramData {
  group_id: string
  bot_token: string
  body: WebhookDataBody
}

export interface WebhookDataBody {
  url: string
  time: string
  alert: string
}

export interface WhatsappData extends MailData {
  url: string
  username: string
  password: string
}

export interface WorkplaceData {
  thread_id: string
  access_token: string
  body: WorkplaceDataBody
}

export interface WorkplaceDataBody {
  url: string
  time: string
  alert: string
}
