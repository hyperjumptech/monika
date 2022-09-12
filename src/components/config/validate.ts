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
import Joi from 'joi'
import { Notification } from '../../interfaces/notification'
import { Config } from '../../interfaces/config'
import { ProbeAlert, Socket, Redis } from '../../interfaces/probe'
import { Validation } from '../../interfaces/validation'
import { isValidURL } from '../../utils/is-valid-url'
import { parseAlertStringTime } from '../../plugins/validate-response/checkers'
import { compileExpression } from '../../utils/expression-parser'
import type { SymonConfig } from '../reporter'
import { newPagerDuty } from '../notification/channel/pagerduty'

const HTTPMethods = [
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
  'PURGE',
  'LINK',
  'UNLINK',
]

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
const PROBE_NO_REQUESTS = setInvalidResponse(
  'Probe requests does not exists or has length lower than 1!'
)
const PROBE_REQUEST_INVALID_URL = setInvalidResponse(
  'Probe request URL should start with http:// or https://'
)

const PROBE_REQUEST_INVALID_METHOD = setInvalidResponse(
  'Probe request method is invalid! Valid methods are GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, PURGE, LINK, and UNLINK'
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

// Pushover
const PUSHOVER_NO_TOKEN = setInvalidResponse('TOKEN not found')
const PUSHOVER_NO_USER = setInvalidResponse('USER not found')

// Discord
const DISCORD_NO_URL = setInvalidResponse('Discord URL not found')

// Dingtalk
const DINGTALK_NO_ACCESS_TOKEN = setInvalidResponse(
  'Dingtalk Access Token not found'
)

// Opsgenie
const OPSGENIE_NO_GENIE_KEY = setInvalidResponse('Opsgenie Geniekey not found')

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
  const pagerduty = newPagerDuty()

  // Check notifications properties
  for (const notification of notifications) {
    // Check if type equals to mailgun, smtp, or sendgrid, and has no recipients
    // check one-by-one instead of using indexOf or includes so the type is correct without type assertion
    if (
      (notification.type === 'mailgun' ||
        notification.type === 'smtp' ||
        notification.type === 'sendgrid' ||
        notification.type === 'whatsapp') &&
      (notification.data.recipients?.length ?? 0) === 0
    ) {
      return NOTIFICATION_NO_RECIPIENTS
    }

    switch (notification.type) {
      case 'smtp': {
        const { data } = notification
        if (!data.hostname) return SMTP_NO_HOSTNAME
        if (!data.port) return SMTP_NO_PORT
        if (!data.username) return SMTP_NO_USERNAME
        if (!data.password) return SMTP_NO_PASSWORD

        break
      }

      case 'mailgun': {
        const { data } = notification
        if (!data.apiKey) return MAILGUN_NO_APIKEY
        if (!data.domain) return MAILGUN_NO_DOMAIN

        break
      }

      case 'sendgrid': {
        if (!notification.data.apiKey) return SENDGRID_NO_APIKEY

        break
      }

      case 'webhook': {
        if (!notification.data.url) return WEBHOOK_NO_URL

        break
      }

      case 'discord': {
        if (!notification.data.url) return DISCORD_NO_URL

        break
      }

      case 'slack': {
        if (!notification.data.url) return WEBHOOK_NO_URL

        break
      }

      case 'telegram': {
        break
      }

      case 'whatsapp': {
        const { data } = notification
        if (!data.url) return WHATSAPP_NO_URL
        if (!data.username) return WHATSAPP_NO_USERNAME
        if (!data.password) return WHATSAPP_NO_PASSWORD

        break
      }

      case 'teams': {
        if (!notification.data.url) return TEAMS_NO_URL

        break
      }

      case 'monika-notif': {
        if (!notification.data.url) return MONIKA_NOTIF_NO_URL

        break
      }

      case 'workplace': {
        const { data } = notification
        if (!data.access_token) return WORKPLACE_NO_ACCESS_TOKEN
        if (!data.thread_id) return WORKPLACE_NO_THREAD_ID

        break
      }

      case 'desktop': {
        break
      }

      case 'lark': {
        if (!notification.data.url) return WEBHOOK_NO_URL
        break
      }

      case 'google-chat': {
        if (!notification.data.url) return WEBHOOK_NO_URL
        break
      }

      case 'dingtalk': {
        if (!notification.data.access_token) return DINGTALK_NO_ACCESS_TOKEN
        break
      }

      case 'opsgenie': {
        if (!notification.data.geniekey) return OPSGENIE_NO_GENIE_KEY
        break
      }

      case pagerduty.slug: {
        const error = pagerduty.validateConfig(notification.data)
        if (error) {
          return setInvalidResponse(error)
        }

        break
      }

      case 'pushover': {
        if (!notification.data.token) return PUSHOVER_NO_TOKEN
        if (!notification.data.user) return PUSHOVER_NO_USER
        break
      }

      default:
        return setInvalidResponse(
          `Notifications type is not allowed (${(notification as any)?.type})`
        )
    }
  }

  return VALID_CONFIG
}

const isValidProbeAlert = (alert: ProbeAlert | string): boolean => {
  try {
    if (typeof alert === 'string') {
      return (
        alert === 'status-not-2xx' ||
        (alert.startsWith('response-time-greater-than-') &&
          Boolean(parseAlertStringTime(alert)))
      )
    }

    return Boolean(compileExpression(alert.query))
  } catch {
    return false
  }
}

export const validateConfig = (configuration: Config): Validation => {
  const { notifications = [], probes = [], symon } = configuration
  const symonConfigError = validateSymonConfig(symon)

  // validate notification
  if (notifications.length > 0) {
    const validateValue = validateNotification(notifications)

    if (validateValue !== VALID_CONFIG) {
      return validateValue
    }
  }

  // Validate probes
  if (probes.length === 0) return NO_PROBES

  // Check probes properties
  for (const probe of probes) {
    const { name, interval, alerts = [], requests, socket, redis } = probe
    const socketAlerts = socket?.alerts ?? []
    const tcpConfigError = validateTCPConfig(socket)

    if (tcpConfigError) {
      return setInvalidResponse(
        `Monika configuration: probes.socket ${tcpConfigError}`
      )
    }

    const redisConfigError = validateRedisConfig(redis)
    if (redisConfigError) {
      return setInvalidResponse(
        `Monika configuration: probes.redis ${redisConfigError}`
      )
    }

    // ensure at least one of these probe types is defined/exist in the probe object
    const totalProbes =
      (socket ? 1 : 0) + (redis ? 1 : 0) + (requests?.length ?? 0)
    if (totalProbes === 0) return PROBE_NO_REQUESTS

    // Validate Interval
    if (interval <= 0) {
      return setInvalidResponse(
        `The interval in the probe with name "${name}" should be greater than 0.`
      )
    }

    for (const req of requests) {
      if (req.timeout <= 0) {
        return setInvalidResponse(
          `The timeout in the request with id "${req.id}" should be greater than 0.`
        )
      }
    }

    const totalTimeout = requests.reduce((prev, curr) => prev + curr.timeout, 0)
    const totalTimeoutSeconds = totalTimeout / 1000

    if (totalTimeoutSeconds > interval) {
      return setInvalidResponse(
        `The interval in the probe with name "${name}" should be greater than the total timeout value of all requests in this probe (${totalTimeoutSeconds} seconds). Current interval value is ${interval} seconds but the expected value is greater than ${totalTimeoutSeconds} seconds.`
      )
    }

    // Check probe request properties
    if (requests?.length > 0) {
      for (const request of requests) {
        const { method, ping, url } = request

        if (!url) return PROBE_REQUEST_NO_URL

        // if not a ping request and url not valid, return INVLID_URL error
        if (ping !== true && !isValidURL(url)) {
          return PROBE_REQUEST_INVALID_URL
        }

        if (!HTTPMethods.includes(method?.toUpperCase() ?? 'GET'))
          return PROBE_REQUEST_INVALID_METHOD
      }
    }

    const allAlerts = [...alerts, ...socketAlerts]

    // Check probe alert properties
    for (const alert of allAlerts) {
      const check = isValidProbeAlert(alert)
      if (!check) {
        return setInvalidResponse(`Probe alert format is invalid! (${alert})`)
      }
    }

    // convert old alert format to new format
    probe.alerts = allAlerts.map((alert: any) => {
      if (typeof alert === 'string') {
        let query = ''
        let message = ''
        const subject = ''

        if (alert === 'status-not-2xx') {
          // This is temporary, TODO: remove support later
          query = 'response.status < 200 or response.status > 299'
          message = 'HTTP Status is {{ response.status }}, expecting 200'
        } else if (alert.startsWith('response-time-greater-than-')) {
          const expectedTime = parseAlertStringTime(alert)
          query = `response.time > ${expectedTime}`
          message = `Response time is {{ response.time }}ms, expecting less than ${expectedTime}ms`
        }

        return { query, subject, message }
      }

      return alert
    })
  }

  // validate symon config
  if (symonConfigError) {
    return setInvalidResponse(`Monika configuration: symon ${symonConfigError}`)
  }

  return VALID_CONFIG
}

function validateSymonConfig(symonConfig?: SymonConfig) {
  if (!symonConfig) {
    return ''
  }

  const schema = Joi.object({
    id: Joi.string().required(),
    url: Joi.string().uri().required(),
    key: Joi.string().required(),
    projectID: Joi.string().required(),
    organizationID: Joi.string().required(),
    interval: Joi.number(),
  })
  const validationError = schema.validate(symonConfig)

  return validationError?.error?.message
}

function validateTCPConfig(tcpConfig?: Socket) {
  if (!tcpConfig) {
    return ''
  }

  const schema = Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    data: Joi.string(),
  })
  const validationError = schema.validate(tcpConfig)

  return validationError?.error?.message
}

function validateRedisConfig(redisConfig?: Redis[]) {
  if (!redisConfig) {
    return ''
  }

  const schema = Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    password: Joi.string(),
    username: Joi.string(),
    command: Joi.string(),
  })

  for (const redis of redisConfig) {
    const validationError = schema.validate(redis)
    if (validationError?.error?.message) return validationError?.error?.message
  }
}
