import { parseAlertStringTime } from '../../utils/alert'

export function getMessageForAlert({
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
} {
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
