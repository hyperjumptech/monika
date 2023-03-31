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

import { getContext, setContext } from '../../context'
import type { Notification, NotificationMessage } from './channel'
import { ValidatedResponse } from '../../plugins/validate-response'
import getIp from '../../utils/ip'
import { getMessageForAlert } from './alert-message'
import { channels } from './channel'

export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
): Promise<void> {
  await Promise.all(
    notifications.map(async ({ data, type }) => {
      const channel = channels[type]

      try {
        if (!channel) {
          throw new Error('Notification channel is not available')
        }

        await channel.send(data, message)
      } catch (error: any) {
        throw new Error(
          `Failed to send message using ${type}, please check your ${type} notification config.\nMessage: ${error?.message}`
        )
      }
    })
  )
}

type SendAlertsProps = {
  probeID: string
  validation: ValidatedResponse
  notifications: Notification[]
  url: string
  probeState: string
}

export async function sendAlerts({
  probeID,
  validation,
  notifications,
  url,
  probeState,
}: SendAlertsProps): Promise<void> {
  const ipAddress = getIp()
  const isRecovery = probeState === 'UP'
  const message = await getMessageForAlert({
    probeID,
    alert: validation.alert,
    url,
    ipAddress,
    isRecovery,
    response: validation.response,
  })

  updateLastIncidentData(isRecovery, probeID, url)

  return sendNotifications(notifications, message)
}

function updateLastIncidentData(
  isRecovery: boolean,
  probeID: string,
  url: string
) {
  const { incidents } = getContext()

  if (isRecovery) {
    // delete last incident
    const newIncidents = incidents.filter(
      (incident) =>
        incident.probeID !== probeID && incident.probeRequestURL !== url
    )

    setContext({ incidents: newIncidents })
    return
  }

  // set incident date time to global context to be used later on recovery notification
  const newIncident = { probeID, probeRequestURL: url, createdAt: new Date() }

  setContext({ incidents: [...incidents, newIncident] })
}
