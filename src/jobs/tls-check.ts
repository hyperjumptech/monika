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

import {
  sendNotifications,
  type Notification,
  type NotificationMessage,
} from '@hyperjumptech/monika-notification'
import { format } from 'date-fns'

import { getValidatedConfig } from '../components/config/index.js'
import { saveNotificationLog } from '../components/logger/history.js'
import {
  getMonikaInstance,
  getOSName,
} from '../components/notification/alert-message.js'
import { checkTLS, getHostname } from '../components/tls-checker/index.js'
import { getContext } from '../context/index.js'
import { getErrorMessage } from '../utils/catch-error-handler.js'
import getIp from '../utils/ip.js'
import { log } from '../utils/pino.js'
import { publicIpAddress } from '../utils/public-ip.js'

export function tlsChecker(): void {
  const { certificate, notifications } = getValidatedConfig()

  if (!certificate) {
    return
  }

  const hasDomain = certificate.domains.length > 0

  if (!hasDomain) {
    return
  }

  const { domains, reminder } = certificate
  const hasNotification = notifications.length > 0

  for (const domain of domains) {
    const hostname = getHostname(domain)
    log.info(`Running TLS check for ${hostname} every day at 00:00`)

    checkTLS(domain, reminder).catch((error) => {
      const errorMessage = getErrorMessage(error)
      log.error(errorMessage)

      if (!hasNotification) {
        return
      }

      sendErrorNotification({
        errorMessage,
        hostname,
        notifications,
      }).catch((error) => log.error(getErrorMessage(error)))
    })
  }
}

type SendErrorNotificationParams = {
  errorMessage: string
  hostname: string
  notifications: Notification[]
}

async function sendErrorNotification({
  errorMessage,
  hostname,
  notifications,
}: SendErrorNotificationParams) {
  const probe = {
    id: '',
    alerts: [],
    interval: 10,
    name: '',
    requests: [],
  }

  await Promise.allSettled(
    notifications.map(async (notification) => {
      await sendNotifications(
        notifications,
        await getNotificationMessage({ hostname, errorMessage })
      )
      await saveNotificationLog(probe, notification, 'NOTIFY-TLS', errorMessage)
    })
  )
}

type GetMessageParams = {
  hostname: string
  errorMessage: string
}

async function getNotificationMessage({
  hostname,
  errorMessage,
}: GetMessageParams): Promise<NotificationMessage> {
  const privateIpAddress = getIp()
  const { userAgent } = getContext()
  const [monikaInstance, osName] = await Promise.all([
    getMonikaInstance(privateIpAddress),
    getOSName(),
  ])
  const time = format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX')
  const body = `Message: ${errorMessage}

  URL: ${hostname}

  Time: ${time}

  From: ${monikaInstance}

  OS: ${osName}

  Version: ${userAgent}`

  return {
    subject: 'New Incident from Monika',
    body,
    summary: errorMessage,
    meta: {
      hostname,
      privateIpAddress,
      probeID: '',
      publicIpAddress,
      time,
      type: 'incident',
      url: hostname,
      version: userAgent,
    },
  }
}
