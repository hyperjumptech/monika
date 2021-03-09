import { getCheckResponseFn } from './alert'
/* eslint-disable complexity */
import { Notification } from '../interfaces/notification'
import {
  SMTPData,
  MailgunData,
  SendgridData,
  WebhookData,
  MailData,
} from './../interfaces/data'
import { Config } from '../interfaces/config'
import { Probe } from '../interfaces/probe'
import { RequestConfig } from './../interfaces/request'
import { isValidURL } from './is-valid-url'

// Validations messages
const VALID_CONFIG = {
  valid: true,
  message: '',
}
const NO_NOTIFICATIONS = {
  valid: false,
  message: 'Notifications object does not exists or has length lower than 1!',
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
const WEBHOOK_NO_METHOD = {
  valid: false,
  message: 'Method not found',
}

export const validateConfig = async (configuration: Config) => {
  const data = configuration

  // Check if notifications object is exists
  if ((data?.notifications?.length ?? 0) === 0) return NO_NOTIFICATIONS

  // Validate probes
  if ((data?.probes?.length ?? 0) === 0) return NO_PROBES

  // Check notifications properties
  for (const notification of data.notifications) {
    const { type, data } = notification as Notification

    // Check if type equals to mailgun, smtp, or sendgrid, and has no recipients
    if (
      ['mailgun', 'smtp', 'sendgrid'].indexOf(type) >= 0 &&
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

        if (!(data as WebhookData).method) return WEBHOOK_NO_METHOD

        break
      default:
        return NOTIFICATION_INVALID_TYPE
    }
  }

  // Check probes properties
  for (const probe of data.probes) {
    const { alerts, name, request } = probe as Probe

    if (!name) return PROBE_NO_NAME

    if (!request) return PROBE_NO_REQUEST

    if ((alerts?.length ?? 0) === 0) return PROBE_NO_ALERT

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

  return VALID_CONFIG
}
