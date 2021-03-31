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
import { RequestConfig } from './../interfaces/request'
import { isValidURL } from './is-valid-url'
import chalk from 'chalk'
import boxen from 'boxen'

const setInvalidResponse = (message: string) => ({
  valid: false,
  message: message,
  config: { probes: [] },
})

// Validations messages
const VALID_CONFIG = {
  valid: true,
  message: '',
}
const NO_NOTIFICATIONS = setInvalidResponse(
  `Notifications config has not been set. We will not be able to notify you when INCIDENT happened!\nPlease refer to Monika documentation for setting the notifications config at https://hyperjumptech.github.io/monika/guides/notifications.`
)
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
const PROBE_DUPLICATE_ID = setInvalidResponse('Probe should have unique id')

const PROBE_REQUEST_NO_URL = setInvalidResponse('Probe request URL does not exists')

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

// Webhook
const WEBHOOK_NO_URL = setInvalidResponse('URL not found')

// Whatsapp
const WHATSAPP_NO_URL = setInvalidResponse('Whatsapp URL not found')
const WHATSAPP_NO_USERNAME = setInvalidResponse('Whatsapp Username not found')
const WHATSAPP_NO_PASSWORD = setInvalidResponse('Whatsapp Password not found')

export const validateConfig = async (configuration: Config) => {
  const data = configuration
  const { notifications, probes, interval } = configuration
  const resultNotif = []
  const resultProbes = []

  // Validate Notifications
  if (!notifications || (notifications.length ?? 0) === 0) {
    warn(
      boxen(chalk.yellow(NO_NOTIFICATIONS.message), {
        padding: 1,
        margin: 1,
        borderStyle: 'bold',
        borderColor: 'yellow',
      })
    )
  }

  // Validate probes
  if ((data?.probes?.length ?? 0) === 0) return NO_PROBES

  if (notifications && notifications.length > 0) {
    // Check notifications properties
    for (const notification of notifications) {
      const { id, type, data } = notification as Notification

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

          const {
            hostname,
            port,
            username,
            password,
            recipients,
          } = data as SMTPData
          resultNotif.push({
            id: id,
            type: type,
            data: {
              recipients,
              hostname,
              port,
              username,
              password,
            } as SMTPData,
          } as Notification)

          break
        }
        case 'mailgun': {
          if (!(data as MailgunData).apiKey) return MAILGUN_NO_APIKEY

          if (!(data as MailgunData).domain) return MAILGUN_NO_DOMAIN

          const { apiKey, domain, recipients } = data as MailgunData
          resultNotif.push({
            id: id,
            type: type,
            data: {
              recipients,
              apiKey,
              domain,
            } as MailgunData,
          } as Notification)

          break
        }
        case 'sendgrid': {
          if (!(data as SendgridData).apiKey) return SENDGRID_NO_APIKEY
          const { apiKey, recipients } = data as SendgridData
          resultNotif.push({
            id: id,
            type: type,
            data: {
              recipients,
              apiKey,
            } as SendgridData,
          } as Notification)

          break
        }
        case 'webhook': {
          if (!(data as WebhookData).url) return WEBHOOK_NO_URL

          const { url } = data as WebhookData
          resultNotif.push({
            id: id,
            type: type,
            data: {
              url,
            } as WebhookData,
          } as Notification)

          break
        }
        case 'slack': {
          if (!(data as WebhookData).url) return WEBHOOK_NO_URL

          const { url } = data as WebhookData
          resultNotif.push({
            id: id,
            type: type,
            data: {
              url,
            } as WebhookData,
          } as Notification)

          break
        }
        case 'whatsapp': {
          if (!(data as WhatsappData).url) return WHATSAPP_NO_URL

          if (!(data as WhatsappData).username) return WHATSAPP_NO_USERNAME

          if (!(data as WhatsappData).password) return WHATSAPP_NO_PASSWORD

          const { url, username, password, recipients } = data as WhatsappData
          resultNotif.push({
            id: id,
            type: type,
            data: {
              recipients,
              url,
              username,
              password,
            } as WhatsappData,
          } as Notification)

          break
        }
        default:
          return NOTIFICATION_INVALID_TYPE
      }
    }
  }

  let i = 1
  const defaultThreshold = 5
  // Check probes properties
  for (const probe of probes) {
    const { requests } = probe
    let { id, name, incidentThreshold, recoveryThreshold, alerts } = probe

    if (!id) {
      id = `${i}`
    }

    if (!name) {
      name = `monika_${i}`
      warn(
        `Warning: Probe ${id} has no name defined. Using the default name started by monika`
      )
    }

    if (!incidentThreshold) {
      incidentThreshold = defaultThreshold
      warn(
        `Warning: Probe ${id} has no incidentThreshold configuration defined. Using the default threshold: 5`
      )
    }

    if (!recoveryThreshold) {
      recoveryThreshold = defaultThreshold
      warn(
        `Warning: Probe ${id} has no recoveryThreshold configuration defined. Using the default threshold: 5`
      )
    }

    if ((requests?.length ?? 0) === 0) return PROBE_NO_REQUESTS

    if ((alerts?.length ?? 0) === 0) {
      alerts = ['status-not-2xx', 'response-time-greater-than-2-s']
      warn(
        `Warning: Probe ${id} has no Alerts configuration defined. Using the default status-not-2xx and response-time-greater-than-2-s`
      )
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
      for (const alert of alerts) {
        const check = getCheckResponseFn(alert)
        if (!check) {
          return PROBE_ALERT_INVALID
        }
      }
    }

    resultProbes.push({
      id,
      name,
      requests,
      incidentThreshold,
      recoveryThreshold,
      alerts,
    })

    i++
  }

  // Check duplicate probe id
  const probeIds = resultProbes.map((probe) => probe.id)
  const uniqueProbeIds = new Set(probeIds)
  if (uniqueProbeIds.size !== resultProbes.length) return PROBE_DUPLICATE_ID

  return {
    ...VALID_CONFIG,
    config: {
      interval: interval,
      notifications: resultNotif,
      probes: resultProbes,
    },
  }
}
