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

import { getConfig } from '../components/config'
import { saveNotificationLog } from '../components/logger/history'
import { sendAlerts } from '../components/notification'
import { checkTLS, TLSHostArg } from '../components/tls-checker'
import { Notification } from '../interfaces/notification'
import type { ValidatedResponse } from '../plugins/validate-response'
import { log } from '../utils/pino'

export function tlsChecker() {
  const config = getConfig()
  const isCertificateConfigEmpty =
    config?.certificate && config?.certificate?.domains.length > 0

  if (isCertificateConfigEmpty) {
    const { certificate } = config
    const defaultExpiryReminder = 30

    certificate?.domains.forEach((domain: string | TLSHostArg) => {
      const host = (domain as TLSHostArg)?.domain ?? (domain as string)
      const reminder = certificate?.reminder ?? defaultExpiryReminder
      const notifications = config?.notifications

      log.info(`Running TLS check for ${host} every day at 00:00`)

      checkTLS(domain, reminder).catch((error) => {
        log.error(error.message)

        if (notifications && notifications?.length > 0) {
          // TODO: Remove probe below
          // probe is used because probe detail is needed to save the notification log
          const probe = {
            id: '',
            name: '',
            requests: [],
            incidentThreshold: 0,
            recoveryThreshold: 0,
            alerts: [],
          }

          notifications.forEach((notification: Notification) => {
            // TODO: Remove validation below
            // validation is used because it is needed to send alert
            const validation: ValidatedResponse = {
              alert: { query: '', message: error.message },
              isAlertTriggered: true,
              response: {
                status: 500,
                responseTime: 0,
                data: {},
                headers: {},
              },
            }

            saveNotificationLog(
              probe,
              notification,
              'NOTIFY-TLS',
              error.message
            ).catch((err) => log.error(err.message))

            // TODO: invoke sendNotifications function instead
            // looks like the sendAlerts function does not handle this
            sendAlerts({
              probeID: '',
              url: host,
              probeState: 'invalid',
              notifications: notifications ?? [],
              validation,
            }).catch((err) => log.error(err.message))
          })
        }
      })
    })
  }
}
