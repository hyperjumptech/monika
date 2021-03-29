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
import { warn } from 'console'
import { getCheckResponseFn } from './alert'
import { Notification } from '../interfaces/notification'
import {
  SMTPData,
  MailgunData,
  SendgridData,
  WebhookData,
  MailData,
  WhatsappData,
} from './../interfaces/data'
import { Config } from '../interfaces/config'
import { Probe } from '../interfaces/probe'
import { RequestConfig } from './../interfaces/request'
import { isValidURL } from './is-valid-url'
import chalk from 'chalk'
import boxen from 'boxen'

// Validations messages
const VALID_CONFIG = {
  valid: true,
  message: '',
}
const NO_NOTIFICATIONS = {
  valid: false,
  message: `Notifications config has not been set. We will not be able to notify you when INCIDENT happened!\nPlease refer to Monika documentation for setting the notifications config at https://hyperjumptech.github.io/monika/guides/notifications.`,
}
const NO_PROBES = {
  valid: false,
  message: 'Probes object does not exists or has length lower than 1!',
}

// Notification
const NOTIFICATION_NO_RECIPIENTS = {
  valid: false,
  message: 'Recipients does not exists or has length lower than 1!',
}
const NOTIFICATION_INVALID_TYPE = {
  valid: false,
  message: 'Notifications type is not allowed',
}

// Probe
const PROBE_NO_ALERT = {
  valid: false,
  message: 'Alerts does not exists or has length lower than 1!',
}
const PROBE_NO_NAME = {
  valid: false,
  message: 'Probe name should not be empty',
}
const PROBE_NO_REQUEST = {
  valid: false,
  message: 'Probe request should not be empty',
}
const PROBE_REQUEST_INVALID_URL = {
  valid: false,
  message: 'Probe request URL should start with http:// or https://',
}
const PROBE_REQUEST_INVALID_METHOD = {
  valid: false,
  message: 'Probe request method should be GET or POST only',
}
const PROBE_ALERT_INVALID = {
  valid: false,
  message:
    "Probe alert should be 'status-not-2xx' or 'response-time-greater-than-<number>-(m)s",
}
const PROBE_DUPLICATE_ID = {
  valid: false,
  message: 'Probe should have unique id',
}

// SMTP
const SMTP_NO_HOSTNAME = {
  valid: false,
  message: 'Hostname not found',
}
const SMTP_NO_PORT = {
  valid: false,
  message: 'Port not found',
}
const SMTP_NO_USERNAME = {
  valid: false,
  message: 'Username not found',
}
const SMTP_NO_PASSWORD = {
  valid: false,
  message: 'Password not found',
}

// Mailgun
const MAILGUN_NO_APIKEY = {
  valid: false,
  message: 'API key not found',
}
const MAILGUN_NO_DOMAIN = {
  valid: false,
  message: 'Domain not found',
}

// Sendgrid
const SENDGRID_NO_APIKEY = {
  valid: false,
  message: 'API key not found',
}

// Webhook
const WEBHOOK_NO_URL = {
  valid: false,
  message: 'URL not found',
}

// Whatsapp
const WHATSAPP_NO_URL = {
  valid: false,
  message: 'URL not found',
}

// Whatsapp
const WHATSAPP_NO_USERNAME = {
  valid: false,
  message: 'Username not found',
}

// Whatsapp
const WHATSAPP_NO_PASSWORD = {
  valid: false,
  message: 'Password not found',
}

export const validateConfig = async (configuration: Config) => {
  const data = configuration

  // Validate Notifications
  if (!data.notifications || (data?.notifications?.length ?? 0) === 0) {
    warn(
      boxen(chalk.yellow(NO_NOTIFICATIONS.message), {
        padding: 1,
        margin: 1,
        borderStyle: 'bold',
        borderColor: 'yellow',
        align: 'center',
      })
    )
  }

  // Validate probes
  if ((data?.probes?.length ?? 0) === 0) return NO_PROBES

  if (data.notifications && data.notifications.length > 0) {
    // Check notifications properties
    for (const notification of data.notifications) {
      const { type, data } = notification as Notification

      // Check if type equals to mailgun, smtp, or sendgrid, and has no recipients
      if (
        ['mailgun', 'smtp', 'sendgrid', 'whatsapp'].indexOf(type) >= 0 &&
        ((data as MailData)?.recipients?.length ?? 0) === 0
      )
        return NOTIFICATION_NO_RECIPIENTS

      switch (type) {
        case 'smtp':
          if (!(data as SMTPData).hostname) return SMTP_NO_HOSTNAME

          if (!(data as SMTPData).port) return SMTP_NO_PORT

          if (!(data as SMTPData).username) return SMTP_NO_USERNAME

          if (!(data as SMTPData).password) return SMTP_NO_PASSWORD

          break
        case 'mailgun':
          if (!(data as MailgunData).apiKey) return MAILGUN_NO_APIKEY

          if (!(data as MailgunData).domain) return MAILGUN_NO_DOMAIN

          break
        case 'sendgrid':
          if (!(data as SendgridData).apiKey) return SENDGRID_NO_APIKEY

          break
        case 'webhook':
          if (!(data as WebhookData).url) return WEBHOOK_NO_URL
          break

        case 'slack':
          if (!(data as WebhookData).url) return WEBHOOK_NO_URL

          break

        case 'whatsapp':
          if (!(data as WhatsappData).url) return WHATSAPP_NO_URL

          if (!(data as WhatsappData).username) return WHATSAPP_NO_USERNAME

          if (!(data as WhatsappData).password) return WHATSAPP_NO_PASSWORD

          break

        default:
          return NOTIFICATION_INVALID_TYPE
      }
    }
  }

  // Check probes properties
  for (const probe of data.probes) {
    const {
      id,
      alerts,
      name,
      request,
      incidentThreshold,
      recoveryThreshold,
    } = probe as Probe

    if (!name) return PROBE_NO_NAME

    if (!request) return PROBE_NO_REQUEST

    if ((alerts?.length ?? 0) === 0) return PROBE_NO_ALERT

    if (!incidentThreshold)
      warn(
        `Warning: Probe ${id} has no incidentThreshold configuration defined. Using the default threshold: 5`
      )
    if (!recoveryThreshold)
      warn(
        `Warning: Probe ${id} has no recoveryThreshold configuration defined. Using the default threshold: 5`
      )

    // Check probe request properties
    const { url, method } = request as RequestConfig

    if (url && !isValidURL(url)) return PROBE_REQUEST_INVALID_URL

    if (method && ['GET', 'POST'].indexOf(method) < 0)
      return PROBE_REQUEST_INVALID_METHOD

    // Check probe alert properties
    for (const alert of alerts) {
      const check = getCheckResponseFn(alert)
      if (!check) {
        return PROBE_ALERT_INVALID
      }
    }
  }

  // Check duplicate probe id
  const probeIds = data.probes.map((probe) => probe.id)
  const uniqueProbeIds = new Set(probeIds)
  if (uniqueProbeIds.size !== data.probes.length) return PROBE_DUPLICATE_ID

  return VALID_CONFIG
}
