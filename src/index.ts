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

import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import chalk from 'chalk'
import boxen from 'boxen'
import { MailData, MailgunData, SMTPData, WebhookData } from './interfaces/data'
import { Config } from './interfaces/config'
import { loopProbes, loopReport } from './utils/looper'
import { printAllLogs } from './utils/logger'
import { log } from './utils/log'
import { closeLog, openLogfile, flushAllLogs } from './utils/history'
import { notificationChecker } from './components/notification/checker'
import {
  getConfig,
  getConfigIterator,
  setupConfigFromFile,
} from './components/config'

class Monika extends Command {
  static description = 'Monika command line monitoring tool'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

    config: flags.string({
      char: 'c',
      description:
        'JSON configuration filename. If none is supplied, will look for default in current path.',
      default: './config.json',
      env: 'MONIKA_JSON_CONFIG',
    }),

    logs: flags.boolean({
      char: 'l', // l shorthand for logs
      description: 'print all logs.',
    }),

    flush: flags.boolean({
      description: 'flush logs',
    }),

    verbose: flags.boolean({
      description: 'show verbose log messages',
      default: false,
    }),
  }

  async run() {
    const { flags } = this.parse(Monika)
    openLogfile()

    if (flags.logs) {
      printAllLogs()
      closeLog()
      return
    }

    if (flags.flush) {
      const ans = await cli.prompt(
        'Are you sure you want to flush all logs in history.db (Y/n)?'
      )
      if (ans === 'Y') {
        flushAllLogs()
        log.info('Records flushed, thank you.')
      } else {
        log.info('Cancelled. Thank you.')
      }
      closeLog()
      return
    }

    try {
      await setupConfigFromFile(flags.config)

      // Run report on interval if monikaHQ configuration exists
      if (!(process.env.CI || process.env.NODE_ENV === 'test')) {
        loopReport(getConfig)
      }

      // run probes on interval
      let abortCurrentLooper: (() => void) | undefined

      for await (const config of getConfigIterator()) {
        if (abortCurrentLooper) {
          abortCurrentLooper()
        }

        if (process.env.NODE_ENV !== 'test') {
          await notificationChecker(config.notifications ?? [])
        }

        const startupMessage = this.buildStartupMessage(config, flags.verbose)

        this.log(startupMessage)

        // Loop through all probes
        abortCurrentLooper = loopProbes(config)
      }
    } catch (error) {
      closeLog()
      this.error(error?.message, { exit: 1 })
    }
  }

  buildStartupMessage(config: Config, verbose = false) {
    const { probes, notifications } = config

    let startupMessage = ''

    // warn if config is empty
    if ((config.notifications?.length ?? 0) === 0) {
      const NO_NOTIFICATIONS_MESSAGE = `Notifications has not been set. We will not be able to notify you when an INCIDENT occurs!
Please refer to the Monika documentations on how to configure notifications at https://hyperjumptech.github.io/monika/guides/notifications.`

      startupMessage += boxen(chalk.yellow(NO_NOTIFICATIONS_MESSAGE), {
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

    startupMessage += `Starting Monika. Probes: ${
      probes.length
    }. Notifications: ${notifications?.length ?? 0}\n\n`

    if (verbose) {
      startupMessage += 'Probes:\n'

      probes.forEach((probe) => {
        startupMessage += `- Probe ID: ${probe.id}
    Name: ${probe.name}
    Description: ${probe.description}
    Interval: ${probe.interval}
`
        probe.requests.forEach((request) => {
          startupMessage += `    Request Method: ${request.method}
    Request URL: ${request.url}
    Request Headers: ${JSON.stringify(request.headers)}
    Request Body: ${JSON.stringify(request.body)}
`
        })

        startupMessage += `    Alerts: ${probe.alerts.join(', ')}\n`
      })

      if (notifications && notifications.length > 0) {
        startupMessage += `\nNotifications:\n`

        notifications.forEach((item) => {
          startupMessage += `- Notification ID: ${item.id}
    Type: ${item.type}      
`
          // Only show recipients if type is mailgun, smtp, or sendgrid
          if (['mailgun', 'smtp', 'sendgrid'].indexOf(item.type) >= 0) {
            startupMessage += `    Recipients: ${(item.data as MailData).recipients.join(
              ', '
            )}\n`
          }

          switch (item.type) {
            case 'smtp':
              startupMessage += `    Hostname: ${
                (item.data as SMTPData).hostname
              }
    Port: ${(item.data as SMTPData).port}
    Username: ${(item.data as SMTPData).username}
`
              break
            case 'mailgun':
              startupMessage += `    Domain: ${
                (item.data as MailgunData).domain
              }\n`
              break
            case 'sendgrid':
              break
            case 'webhook':
              startupMessage += `    URL: ${(item.data as WebhookData).url}\n`
              break
            case 'slack':
              startupMessage += `    URL: ${(item.data as WebhookData).url}\n`
              break
          }
        })
      }
    }

    return startupMessage
  }
}

export = Monika
