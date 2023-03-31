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

import path from 'path'
import isUrl from 'is-url'
import boxen from 'boxen'
import chalk from 'chalk'
import type { Config } from '../../interfaces/config'
import type { Notification } from '../notification/channel'
import { channels } from '../notification/channel'
import type { Probe, ProbeAlert } from '../../interfaces/probe'
import type { RequestConfig } from '../../interfaces/request'
import { log } from '../../utils/pino'

type LogStartupMessage = {
  config: Config
  configFlag: string[]
  isFirstRun: boolean
  isSymonMode: boolean
  isVerbose: boolean
}

export function logStartupMessage({
  config,
  configFlag,
  isFirstRun,
  isSymonMode,
  isVerbose,
}: LogStartupMessage): void {
  const startupMessage = generateStartupMessage({
    config,
    isFirstRun,
    isSymonMode,
    isVerbose,
  })

  if (isSymonMode) {
    log.info(startupMessage)
    return
  }

  for (const x in configFlag) {
    if (isUrl(configFlag[x])) {
      log.info('Using remote config:', configFlag[x])
    } else if (configFlag[x].length > 0) {
      log.info(`Using config file: ${path.resolve(configFlag[x])}`)
    }
  }

  console.log(startupMessage)
}

type GenerateStartupMessageParams = {
  config: Config
  isFirstRun: boolean
  isVerbose: boolean
  isSymonMode: boolean
}

function generateStartupMessage({
  config,
  isFirstRun,
  isVerbose,
  isSymonMode,
}: GenerateStartupMessageParams): string {
  if (isSymonMode) {
    return 'Running in Symon mode'
  }

  const { notifications = [], probes } = config
  const notificationTotal = notifications.length
  const probeTotal = probes.length
  const hasNotification = notificationTotal > 0

  let startupMessage = ''

  // warn if config is empty
  if (!hasNotification) {
    startupMessage += generateEmptyNotificationMessage()
  }

  startupMessage += generateConfigInfoMessage({
    isFirstRun,
    notificationTotal,
    probeTotal,
  })

  if (isVerbose) {
    startupMessage += generateProbeMessage(probes)
    startupMessage += generateNotificationMessage(notifications || [])
  }

  return startupMessage
}

function generateEmptyNotificationMessage(): string {
  const NO_NOTIFICATIONS_MESSAGE = `Notifications has not been set. We will not be able to notify you when an INCIDENT occurs!
  Please refer to the Monika documentations on how to how to configure notifications (e.g., Telegram, Slack, Desktop notification, etc.) at https://monika.hyperjump.tech/guides/notifications.`

  return boxen(chalk.yellow(NO_NOTIFICATIONS_MESSAGE), {
    padding: 1,
    margin: {
      top: 2,
      right: 1,
      bottom: 2,
      left: 1,
    },
    borderStyle: 'bold',
    borderColor: 'yellow',
  })
}

type GenerateConfigInfoMessageParams = {
  isFirstRun: boolean
  notificationTotal: number
  probeTotal: number
}

function generateConfigInfoMessage({
  isFirstRun,
  notificationTotal,
  probeTotal,
}: GenerateConfigInfoMessageParams) {
  return `${
    isFirstRun ? 'Starting' : 'Restarting'
  } Monika. Probes: ${probeTotal}. Notifications: ${notificationTotal}\n\n`
}

function generateProbeMessage(probes: Probe[]): string {
  let startupMessage = 'Probes:\n'

  for (const probe of probes) {
    const { alerts, description, id, interval, name, requests } = probe

    startupMessage += `- Probe ID: ${id}
Name: ${name}
Description: ${description || '-'}
Interval: ${interval}
`
    startupMessage += `    Requests:\n`
    startupMessage += generateProbeRequestMessage(requests)
    startupMessage += generateAlertMessage(alerts)
  }

  return startupMessage
}

function generateProbeRequestMessage(requests: RequestConfig[]): string {
  let startupMessage = ''

  for (const request of requests) {
    const { body, headers, method, url } = request

    startupMessage += `      - Request Method: ${method || `GET`}
  Request URL: ${url}
  Request Headers: ${JSON.stringify(headers) || `-`}
  Request Body: ${JSON.stringify(body) || `-`}
`
  }

  return startupMessage
}

function generateAlertMessage(alerts: ProbeAlert[]): string {
  const hasAlert = alerts.length > 0
  const defaultAlertsInString =
    '[{ "assertion": "response.status < 200 or response.status > 299", "message": "HTTP Status is not 200"}, { "assertion": "response.time > 2000", "message": "Response time is more than 2000ms" }]'
  const alertsInString = JSON.stringify(alerts)

  return `    Alerts: ${hasAlert ? alertsInString : defaultAlertsInString}\n`
}

function generateNotificationMessage(notifications: Notification[]): string {
  const hasNotification = notifications.length > 0

  if (!hasNotification) {
    return ''
  }

  let result = '`\nNotifications:\n`'

  for (const notification of notifications) {
    result += getIDMessage(notification)
    result += getAdditionalMessage(notification)
  }

  return result
}

function getIDMessage({ id, type }: Notification) {
  return `- Notification ID: ${id}
Type: ${type}
`
}

function getAdditionalMessage(notification: Notification) {
  const { data, type } = notification
  const channel = channels[type]

  if (!channel?.additionalStartupMessage) {
    return ''
  }

  return channel.additionalStartupMessage(data)
}
