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

/* eslint-disable complexity */
import { getCheckResponseFn } from '../notification/alert'
import { Notification } from '../../interfaces/notification'
import {
  SMTPData,
  MailgunData,
  SendgridData,
  WebhookData,
  MailData,
  WhatsappData,
  TeamsData,
  DiscordData,
  MonikaNotifData,
  WorkplaceData,
} from '../../interfaces/data'
import { Config } from '../../interfaces/config'
import { RequestConfig } from '../../interfaces/request'
import { Validation } from '../../interfaces/validation'
import { isValidURL } from '../../utils/is-valid-url'

const setInvalidResponse = (message: string): Validation => ({
  valid: false,
  message: message,
})

// Validations messages
const VALID_CONFIG: Validation = {
  valid: true,
  message: '',
}
const NO_PROBES = setInvalidResponse(
  'Probes object does not exists or has length lower than 1!'
)

// Notification
const NOTIFICATION_NO_RECIPIENTS = setInvalidResponse(
  'Recipients does not exists or has length lower than 1!'
)
const NOTIFICATION_INVALID_TYPE = setInvalidResponse(
  'Notifications type is not allowed'
)

const PROBE_NO_REQUESTS = setInvalidResponse(
  'Probe requests does not exists or has length lower than 1!'
)
const PROBE_REQUEST_INVALID_URL = setInvalidResponse(
  'Probe request URL should start with http:// or https://'
)
const PROBE_REQUEST_INVALID_METHOD = setInvalidResponse(
  'Probe request method should be GET or POST only'
)
const PROBE_ALERT_INVALID = setInvalidResponse(
  `Probe alert should be 'status-not-2xx' or 'response-time-greater-than-<number>-(m)s`
)

const PROBE_REQUEST_NO_URL = setInvalidResponse(
  'Probe request URL does not exists'
)

// SMTP
const SMTP_NO_HOSTNAME = setInvalidResponse('Hostname not found')
const SMTP_NO_PORT = setInvalidResponse('Port not found')
const SMTP_NO_USERNAME = setInvalidResponse('Username not found')
const SMTP_NO_PASSWORD = setInvalidResponse('Password not found')

// Mailgun
const MAILGUN_NO_APIKEY = setInvalidResponse('API key not found')
const MAILGUN_NO_DOMAIN = setInvalidResponse('Domain not found')

// Sendgrid
const SENDGRID_NO_APIKEY = setInvalidResponse('API key not found')

// Teams
const TEAMS_NO_URL = setInvalidResponse('Teams Webhook URL not found')

// Teams
const MONIKA_NOTIF_NO_URL = setInvalidResponse(
  'Monika Notification Webhook URL not found'
)

// Webhook
const WEBHOOK_NO_URL = setInvalidResponse('URL not found')

// Discord
const DISCORD_NO_URL = setInvalidResponse('Discord URL not found')

// Whatsapp
const WHATSAPP_NO_URL = setInvalidResponse('Whatsapp URL not found')
const WHATSAPP_NO_USERNAME = setInvalidResponse('Whatsapp Username not found')
const WHATSAPP_NO_PASSWORD = setInvalidResponse('Whatsapp Password not found')

// Workplace
const WORKPLACE_NO_ACCESS_TOKEN = setInvalidResponse(
  'Workplace Access Token not found'
)
const WORKPLACE_NO_THREAD_ID = setInvalidResponse(
  'Workplace Thread ID not found'
)

function validateNotification(notifications: Notification[]): Validation {
  // Check notifications properties
  for (const notification of notifications) {
    const { type, data } = notification

    // Check if type equals to mailgun, smtp, or sendgrid, and has no recipients
    if (
      ['mailgun', 'smtp', 'sendgrid', 'whatsapp'].indexOf(type) >= 0 &&
      ((data as MailData)?.recipients?.length ?? 0) === 0
    )
      return NOTIFICATION_NO_RECIPIENTS

    switch (type) {
      case 'smtp': {
        if (!(data as SMTPData).hostname) return SMTP_NO_HOSTNAME
        if (!(data as SMTPData).port) return SMTP_NO_PORT
        if (!(data as SMTPData).username) return SMTP_NO_USERNAME
        if (!(data as SMTPData).password) return SMTP_NO_PASSWORD

        break
      }

      case 'mailgun': {
        if (!(data as MailgunData).apiKey) return MAILGUN_NO_APIKEY
        if (!(data as MailgunData).domain) return MAILGUN_NO_DOMAIN

        break
      }

      case 'sendgrid': {
        if (!(data as SendgridData).apiKey) return SENDGRID_NO_APIKEY

        break
      }

      case 'webhook': {
        if (!(data as WebhookData).url) return WEBHOOK_NO_URL

        break
      }

      case 'discord': {
        if (!(data as DiscordData).url) return DISCORD_NO_URL

        break
      }

      case 'slack': {
        if (!(data as WebhookData).url) return WEBHOOK_NO_URL

        break
      }

      case 'telegram': {
        break
      }

      case 'whatsapp': {
        if (!(data as WhatsappData).url) return WHATSAPP_NO_URL
        if (!(data as WhatsappData).username) return WHATSAPP_NO_USERNAME
        if (!(data as WhatsappData).password) return WHATSAPP_NO_PASSWORD

        break
      }

      case 'teams': {
        if (!(data as TeamsData).url) return TEAMS_NO_URL

        break
      }

      case 'monika-notif': {
        if (!(data as MonikaNotifData).url) return MONIKA_NOTIF_NO_URL

        break
      }

      case 'workplace': {
        if (!(data as WorkplaceData).access_token)
          return WORKPLACE_NO_ACCESS_TOKEN
        if (!(data as WorkplaceData).thread_id) return WORKPLACE_NO_THREAD_ID

        break
      }

      default:
        return NOTIFICATION_INVALID_TYPE
    }
  }

  return VALID_CONFIG
}

export const validateConfig = (configuration: Config): Validation => {
  const { notifications, probes } = configuration

  // validate notification
  if (notifications && notifications.length > 0) {
    const validateValue = validateNotification(notifications)

    if (validateValue !== VALID_CONFIG) {
      return validateValue
    }
  }
  // Validate probes
  if ((configuration?.probes?.length ?? 0) === 0) return NO_PROBES

  // Check probes properties
  for (const probe of probes) {
    const { alerts, requests } = probe

    if ((requests?.length ?? 0) === 0) return PROBE_NO_REQUESTS
    if ((alerts?.length ?? 0) === 0) {
      probe.alerts = ['status-not-2xx', 'response-time-greater-than-2-s']
    }

    // Check probe request properties
    for (const request of requests) {
      const { url } = request as RequestConfig

      if (!url) return PROBE_REQUEST_NO_URL

      if (url && !isValidURL(url)) return PROBE_REQUEST_INVALID_URL

      if (!request.method) {
        request.method = 'GET'
      }

      if (['GET', 'POST'].indexOf(request.method) < 0)
        return PROBE_REQUEST_INVALID_METHOD

      // Check probe alert properties
      for (const alert of probe.alerts) {
        const check = getCheckResponseFn(alert)
        if (!check) {
          return PROBE_ALERT_INVALID
        }
      }
    }
  }

  return VALID_CONFIG
}
