import { SMTPData, WebhookData, MailgunData } from '../interfaces/data'
import { Notification } from '../interfaces/notification'
import { Probe } from '../interfaces/probe'
import { AxiosResponseWithExtraData } from '../interfaces/request'

import getIp from './ip'
import { sendMailgun } from './mailgun'
import { createSmtpTransport, sendSmtpMail } from './smtp'
import { sendWebhook } from './notifications/webhook'
import { sendSlack } from './notifications/slack'

type CheckResponseFn = (response: AxiosResponseWithExtraData) => boolean
export type ValidateResponseStatus = { alert: string; status: boolean }

// Check if response status is not 2xx
export const statusNot2xx: CheckResponseFn = (response) =>
  response.status < 200 || response.status >= 300

// Check if response time is greater than specified value in milliseconds
export const responseTimeGreaterThan: (
  minimumTime: number
) => CheckResponseFn = (minimumTime) => (
  response: AxiosResponseWithExtraData
): boolean => {
  const respTimeNum = response.config.extraData?.responseTime ?? 0

  return respTimeNum > minimumTime
}

// parse string like "response-time-greater-than-200-ms" and return the time in ms
export const parseAlertStringTime = (str: string): number => {
  // match any string that ends with digits followed by unit 's' or 'ms'
  const match = str.match(/(\d+)-(m?s)$/)
  if (!match) {
    throw new Error('alert string does not contain valid time number')
  }

  const number = Number(match[1])
  const unit = match[2]

  if (unit === 's') return number * 1000
  return number
}

export const getCheckResponseFn = (
  alert: string
): CheckResponseFn | undefined => {
  if (alert === 'status-not-2xx') {
    return statusNot2xx
  }
  if (alert.startsWith('response-time-greater-than-')) {
    const alertTime = parseAlertStringTime(alert)
    return responseTimeGreaterThan(alertTime)
  }
}

export const validateResponse = (
  alerts: Probe['alerts'],
  response: AxiosResponseWithExtraData
): ValidateResponseStatus[] => {
  const checks = []

  for (const alert of alerts) {
    const checkFn = getCheckResponseFn(alert.toLowerCase())
    if (checkFn) {
      checks.push({
        alert,
        status: checkFn(response),
      })
    }
  }

  return checks
}

export const getMessageForAlert = (
  alert: string,
  url: string,
  ipAddress: string,
  status: string
): {
  subject: string
  body: string
} => {
  const getSubject = (url: string, status: string) => {
    if (status === 'UP') {
      return `${alert} from probing ${url} has been resolved.`
    }
    return `"${alert}" has been detected from probing ${url}`
  }

  const getBody = (status: string) => {
    if (status === 'UP') {
      return `We found that your "${alert}" alert has been resolved when probing "${url}".`
    }
    return `New "${alert}" alert when probing "${url}".`
  }

  const message = {
    subject: getSubject(url, status),
    body: `
      ${getBody(status)}\n
      Time: ${Date.now()}\n
      Target URL: ${url}\n
      From server: ${ipAddress}
    `,
  }

  return message
}

export const sendAlerts = async ({
  validation,
  notifications,
  url,
  status,
}: {
  validation: ValidateResponseStatus
  notifications: Notification[]
  url: string
  status: string
}): Promise<
  Array<{
    alert: string
    notification: string
    url: string
  }>
> => {
  const ipAddress = getIp()

  const message = getMessageForAlert(validation.alert, url, ipAddress, status)
  const sent = await Promise.all<any>(
    notifications.map((notification) => {
      switch (notification.type) {
        case 'mailgun': {
          return sendMailgun(
            {
              subject: message.subject,
              body: message.body,
              sender: {
                // TODO: Read from ENV Variables
                name: 'Monika',
                email: 'Monika@hyperjump.tech',
              },
              recipients: (notification?.data as MailgunData)?.recipients?.join(
                ','
              ),
            },
            notification
          ).then(() => ({
            notification: 'mailgun',
            alert: validation.alert,
            url,
          }))
        }
        case 'webhook': {
          return sendWebhook({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as WebhookData).then(() => ({
            notification: 'webhook',
            alert: validation.alert,
            url,
          }))
        }
        case 'slack': {
          return sendSlack({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as WebhookData).then(() => ({
            notification: 'slack',
            alert: validation.alert,
            url,
          }))
        }
        case 'smtp': {
          const transporter = createSmtpTransport(notification.data as SMTPData)
          return sendSmtpMail(transporter, {
            // TODO: Read from ENV Variables
            from: 'http-probe@hyperjump.tech',
            to: (notification?.data as SMTPData)?.recipients?.join(','),
            subject: message.subject,
            html: message.body,
          })
        }
        default:
          return Promise.resolve({
            notification: '',
            alert: validation.alert,
            url,
          })
      }
    })
  )

  return sent
}
