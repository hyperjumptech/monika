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

import { v4 as uuid } from 'uuid'
import { getConfig } from '../components/config'
import { saveNotificationLog } from '../components/logger/history'
import { sendAlerts } from '../components/notification'
import { checkTLS, getHostname } from '../components/tls-checker'
import type { Notification } from '@hyperjumptech/monika-notification'
import type { ValidatedResponse } from '../plugins/validate-response'
import { log } from '../utils/pino'
import { probeRequestResult } from '../interfaces/request'

type SendTLSErrorNotificationProps = {
  hostname: string
  notifications: Notification[]
  errorMessage: string
}

export function tlsChecker(): void {
  const config = getConfig()
  const hasDomain = (config?.certificate?.domains?.length || 0) > 0

  if (!hasDomain) {
    return
  }

  const { certificate } = config
  const defaultExpiryReminder = 30

  for (const domain of certificate?.domains || []) {
    const hostname = getHostname(domain)
    const reminder = certificate?.reminder ?? defaultExpiryReminder

    log.info(`Running TLS check for ${hostname} every day at 00:00`)

    checkTLS(domain, reminder).catch((error) => {
      log.error(error.message)

      const { notifications } = config
      const hasNotification = (notifications?.length || 0) > 0

      if (!hasNotification) {
        return
      }

      sendTLSErrorNotification({
        hostname,
        notifications: notifications || [],
        errorMessage: error.message,
      })
    })
  }
}

function sendTLSErrorNotification({
  hostname,
  notifications,
  errorMessage,
}: SendTLSErrorNotificationProps) {
  // TODO: Remove probe below
  // probe is used because probe detail is needed to save the notification log
  const probe = {
    id: '',
    name: '',
    requests: [],
    interval: 10,
    incidentThreshold: 0,
    recoveryThreshold: 0,
    alerts: [],
  }

  for (const notification of notifications) {
    // TODO: Remove validation below
    // validation is used because it is needed to send alert
    const validation: ValidatedResponse = {
      alert: {
        id: uuid(),
        assertion: '',
        message: errorMessage,
      },
      isAlertTriggered: true,
      response: {
        status: 500,
        responseTime: 0,
        data: {},
        body: {},
        headers: {},
        result: probeRequestResult.success,
        isProbeResponsive: true,
      },
    }

    saveNotificationLog(probe, notification, 'NOTIFY-TLS', errorMessage).catch(
      (error) => log.error(error.message)
    )

    // TODO: invoke sendNotifications function instead
    // looks like the sendAlerts function does not handle this
    sendAlerts({
      probeID: '',
      url: hostname,
      probeState: 'invalid',
      notifications: notifications ?? [],
      validation,
    }).catch((error) => log.error(error.message))
  }
}
