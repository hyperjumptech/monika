import { Probe } from '../interfaces/probe'
import { AxiosResponseWithExtraData } from '../interfaces/request'

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

export const getMessageForAlert = ({
  alert,
  url,
  ipAddress,
  status,
  incidentThreshold,
}: {
  alert: string
  url: string
  ipAddress: string
  status: string
  incidentThreshold: number
}): {
  subject: string
  body: string
} => {
  const getSubject = (url: string, status: string) => {
    const statusAlert = `Target ${url} is not OK`
    if (alert === 'status-not-2xx' && status === 'UP')
      return `[RECOVERY] ${statusAlert}`
    if (alert === 'status-not-2xx' && status === 'DOWN')
      return `[INCIDENT] ${statusAlert}`

    const responseAlert = `Target ${url} takes long to respond`
    if (alert.includes('response-time-greater-than-') && status === 'UP')
      return `[RECOVERY] ${responseAlert}`

    return `[INCIDENT] ${responseAlert}`
  }

  const getBody = (status: string) => {
    if (alert === 'status-not-2xx' && status === 'DOWN')
      return `Target ${url} is not healthy. It has not been returning status code 2xx ${incidentThreshold} times in a row.`

    if (alert.includes('response-time-greater-than-') && status === 'DOWN') {
      const alertTime = parseAlertStringTime(alert)
      return `Target ${url} is not healthy. The response time has been greater than ${alertTime} ${incidentThreshold} times in a row`
    }

    return `Target ${url} is back to healthy.`
  }

  const today = new Date().toUTCString()
  const message = {
    subject: getSubject(url, status),
    body: `
      ${getBody(status)}\n\n
      Time: ${today}\n
      Target URL: ${url}\n
      From server: ${ipAddress}
    `,
  }

  return message
}
