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

/* eslint-disable no-console */
import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import chalk from 'chalk'
import boxen from 'boxen'
import open from 'open'
import fs from 'fs'
import { MailData, MailgunData, SMTPData, WebhookData } from './interfaces/data'
import { looper } from './looper'
import { printAllLogs } from './components/logger'
import { log } from './utils/pino'
import {
  closeLog,
  openLogfile,
  flushAllLogs,
} from './components/logger/history'
import { notificationChecker } from './components/notification/checker'
import { getConfig, setupConfigFromFile } from './components/config'

function getDefaultConfig() {
  const filesArray = fs.readdirSync('./')
  const monikaDotJsonFile = filesArray.find((x) => x === 'monika.json')
  const configDotJsonFile = filesArray.find((x) => x === 'config.json')

  return monikaDotJsonFile
    ? `./${monikaDotJsonFile}`
    : configDotJsonFile
    ? `./${configDotJsonFile}`
    : './monika.json'
}

class Monika extends Command {
  static description = 'Monika command line monitoring tool'

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

    config: flags.string({
      char: 'c',
      description:
        'JSON configuration filename. If none is supplied, will look for monika.json in the current directory.',
      default: () => getDefaultConfig(),
      env: 'MONIKA_JSON_CONFIG',
    }),

    'create-config': flags.boolean({
      description: 'open Monika Configuration Generator using default browser',
    }),

    logs: flags.boolean({
      char: 'l', // prints the logs
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
        'Are you sure you want to flush all logs in monika-logs.db (Y/n)?'
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

    if (flags['create-config']) {
      log.info(
        'Opening Monika Configuration Generator in your default browser...'
      )
      await open('https://hyperjumptech.github.io/monika-config-generator/')
      return
    }

    // Read the config
    const file = flags.config

    try {
      await setupConfigFromFile(file)
      const config = getConfig()

      const { notifications, probes } = config

      // warn if config is empty
      if ((notifications?.length ?? 0) === 0) {
        const NO_NOTIFICATIONS_MESSAGE = `Notifications has not been set. We will not be able to notify you when an INCIDENT occurs!\nPlease refer to the Monika documentations on how to configure notifications at https://hyperjumptech.github.io/monika/guides/notifications.`

        log.warn(
          boxen(chalk.yellow(NO_NOTIFICATIONS_MESSAGE), {
            padding: 1,
            margin: 1,
            borderStyle: 'bold',
            borderColor: 'yellow',
          })
        )
      }

      if (process.env.NODE_ENV !== 'test') {
        await notificationChecker(notifications ?? [])
      }

      console.log(
        `Starting Monika. Probes: ${probes.length}. Notifications: ${
          notifications?.length ?? 0
        }\n`
      )
      if (flags.verbose) {
        console.log('Probes:')
        probes.forEach((probe) => {
          console.log(`- Probe ID: ${probe.id}`)
          console.log(`    Name: ${probe.name}`)
          console.log(`    Description: ${probe.description}`)
          console.log(`    Interval: ${probe.interval}`)
          probe.requests.forEach((request) => {
            console.log(`    Request Method: ${request.method}`)
            console.log(`    Request URL: ${request.url}`)
            console.log(
              `    Request Headers: ${JSON.stringify(request.headers)}`
            )
            console.log(`    Request Body: ${JSON.stringify(request.body)}`)
          })
          console.log(`    Alerts: ${probe.alerts.join(', ')}`)
        })
        console.log('')

        console.log(`Notifications:`)
        notifications?.forEach((item) => {
          console.log(`- Notification ID: ${item.id}`)
          console.log(`    Type: ${item.type}`)
          // Only show recipients if type is mailgun, smtp, or sendgrid
          if (['mailgun', 'smtp', 'sendgrid'].indexOf(item.type) >= 0) {
            console.log(
              `    Recipients: ${(item.data as MailData).recipients.join(', ')}`
            )
          }
          switch (item.type) {
            case 'smtp':
              console.log(`    Hostname: ${(item.data as SMTPData).hostname}`)
              console.log(`    Port: ${(item.data as SMTPData).port}`)
              console.log(`    Username: ${(item.data as SMTPData).username}`)
              break
            case 'mailgun':
              console.log(`    Domain: ${(item.data as MailgunData).domain}`)
              break
            case 'sendgrid':
              break
            case 'webhook':
              console.log(`    URL: ${(item.data as WebhookData).url}`)
              break
            case 'slack':
              console.log(`    URL: ${(item.data as WebhookData).url}`)
              break
          }
        })
        console.log('')
      }
      // Loop through all probes
      looper(config)
    } catch (error) {
      closeLog()
      this.error(error?.message, { exit: 1 })
    }
  }
}
export = Monika
