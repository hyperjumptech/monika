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
import type { MonikaFlags } from '../../flag'
import type { ValidatedConfig } from '../../interfaces/config'
import type { Notification } from '@hyperjumptech/monika-notification'
import { channels } from '@hyperjumptech/monika-notification'
import type { Probe } from '../../interfaces/probe'
import { log } from '../../utils/pino'
import { isSymonModeFrom } from '../config'
import { createProber } from '../probe/prober/factory'

type LogStartupMessage = {
  config: ValidatedConfig
  flags: Pick<
    MonikaFlags,
    'config' | 'symonKey' | 'symonUrl' | 'verbose' | 'native-fetch'
  >
  isFirstRun: boolean
}

export function logStartupMessage({
  config,
  flags,
  isFirstRun,
}: LogStartupMessage): void {
  if (isSymonModeFrom(flags)) {
    log.info('Running in Symon mode')
    return
  }

  for (const configSource of flags.config) {
    if (isUrl(configSource)) {
      log.info(`Using remote config: ${configSource}`)
    } else if (configSource.length > 0) {
      log.info(`Using config file: ${path.resolve(configSource)}`)
    }
  }

  const startupMessage = generateStartupMessage({
    config,
    flags,
    isFirstRun,
  })
  console.log(startupMessage)
}

function generateStartupMessage({
  config,
  flags,
  isFirstRun,
}: LogStartupMessage): string {
  const { notifications, probes } = config
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

  if (flags.verbose) {
    startupMessage += generateProbeMessage(probes)
    startupMessage += generateNotificationMessage(notifications)
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
    const prober = createProber({
      probeConfig: probe,
      counter: 0,
      notifications: [],
    })

    startupMessage += prober.generateVerboseStartupMessage()
  }

  return startupMessage
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

  if (!channel?.additionalStartupMessage || !data) {
    return ''
  }

  return channel.additionalStartupMessage(data)
}
