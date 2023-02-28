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

/* eslint-disable camelcase */
export const requiredFieldMessages: Record<string, any> = {
  smtp: {
    hostname: 'Hostname not found',
    port: 'Port not found',
    username: 'Username not found',
    password: 'Password not found',
  },
  mailgun: {
    apiKey: 'Api key not found',
    domain: 'Domain not found',
  },
  sendgrid: {
    apiKey: 'apiKey not found',
  },
  webhook: {
    url: 'URL not found',
  },
  discord: {
    url: 'URL not found',
  },
  slack: {
    url: 'URL not found',
  },
  telegram: {},
  whatsapp: {
    url: 'URL not found',
    username: 'username not found',
    password: 'password not found',
  },
  teams: {
    url: 'Teams Webhook URL not found',
  },
  'monika-notif': {
    url: 'Monika Notification Webhook URL not found',
  },
  workplace: {
    access_token: 'Workplace Access Token not found',
    thread_id: 'Workplace Thread ID not found',
  },
  desktop: {},
  lark: {
    url: 'URL not found',
  },
  'google-chat': {
    url: 'URL not found',
  },
  dingtalk: {
    access_token: 'Dingtalk Access Token not found',
  },
  opsgenie: {
    geniekey: 'Opsgenie Geniekey not found',
  },
  pushover: {
    token: 'TOKEN not found',
    user: 'USER not found',
  },
  gotify: {
    token: 'TOKEN not found',
    url: 'URL not found',
  },
  pushbullet: {
    token:
      'Pushbullet Access Token not found! You can create your Access Token at https://www.pushbullet.com/#settings',
  },
  instatus: {
    apiKey: 'apiKey not found',
    pageID: 'pageID not found',
  },
}
