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
import boxen from 'boxen'
import chalk from 'chalk'
import cli from 'cli-ux'
import fs from 'fs'
import cron, { ScheduledTask } from 'node-cron'
import {
  createConfig,
  getConfigIterator,
  updateConfig,
} from './components/config'
import { printAllLogs } from './components/logger'
import {
  closeLog,
  flushAllLogs,
  openLogfile,
} from './components/logger/history'
import { notificationChecker } from './components/notification/checker'
import { resetServerAlertStates } from './components/notification/process-server-status'
import events from './events'
import { Config } from './interfaces/config'
import { Probe } from './interfaces/probe'
import {
  printSummary,
  getSummaryAndSendNotif,
  savePidFile,
} from './jobs/summary-notification'
import initLoaders from './loaders'
import { idFeeder, isIDValid, sanitizeProbe } from './looper'
import { getEventEmitter } from './utils/events'
import { log } from './utils/pino'
import path from 'path'
import isUrl from 'is-url'
import SymonClient from './symon'

const em = getEventEmitter()
let symonClient: SymonClient

function getDefaultConfig(): Array<string> {
  const filesArray = fs.readdirSync('./')
  const monikaDotJsonFile = filesArray.find((x) => x === 'monika.json')
  const monikaDotYamlFile = filesArray.find(
    (x) => x === 'monika.yml' || x === 'monika.yaml'
  )
  const defaultConfig = monikaDotYamlFile || monikaDotJsonFile

  return defaultConfig ? [defaultConfig] : []
}

class Monika extends Command {
  static description = 'Monika command line monitoring tool'

  static examples = [
    'monika',
    'monika --logs',
    'monika -r 1 --id "weather, stocks, 5, 7"',
    'monika --create-config',
    'monika --config https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml --config-interval 900',
  ]

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

    symonUrl: flags.string({
      description: 'URL of Symon',
      dependsOn: ['symonKey'],
    }),

    symonKey: flags.string({
      description: 'API Key for Symon',
      dependsOn: ['symonUrl'],
    }),

    config: flags.string({
      char: 'c',
      description:
        'JSON configuration filename or URL. If none is supplied, will look for monika.json in the current directory',
      default: () => getDefaultConfig(),
      env: 'MONIKA_JSON_CONFIG',
      multiple: true,
    }),

    'create-config': flags.boolean({
      description: 'open Monika Configuration Generator using default browser',
    }),

    'config-interval': flags.integer({
      description:
        'The interval (in seconds) for periodic config checking if url is used as config source',
      default: 900,
      dependsOn: ['config'],
    }),

    postman: flags.string({
      char: 'p', // (p)ostman
      description: 'Run Monika using a Postman json file.',
      multiple: false,
      exclusive: ['har'],
    }),

    har: flags.string({
      char: 'H', // (H)ar file to
      description: 'Run Monika using a HAR file',
      multiple: false,
      exclusive: ['postman'],
    }),

    logs: flags.boolean({
      char: 'l', // prints the (l)ogs
      description: 'Print all logs.',
    }),

    flush: flags.boolean({
      description: 'Flush logs',
    }),

    verbose: flags.boolean({
      description: 'Show verbose log messages',
      default: false,
    }),

    prometheus: flags.integer({
      description:
        'Specifies the port the Prometheus metric server is listening on. e.g., 3001. (EXPERIMENTAL)',
      exclusive: ['r'],
    }),

    repeat: flags.string({
      char: 'r', // (r)epeat
      description: 'Repeats the test run n times',
      multiple: false,
    }),

    stun: flags.integer({
      char: 's', // (s)stun
      description: 'Interval in seconds to check STUN server',
      multiple: false,
      default: 20,
    }),

    id: flags.string({
      char: 'i', // (i)ds to run
      description: 'Define specific probe ids to run',
      multiple: false,
    }),

    output: flags.string({
      char: 'o', // (o)utput file to write config to
      description: 'Write monika config file to this file',
      multiple: false,
    }),

    force: flags.boolean({
      description: 'Force commands with a yes whenever Y/n is prompted.',
      default: false,
    }),

    summary: flags.boolean({
      description: 'Display a summary of monika running stats',
      default: false,
    }),

    'status-notification': flags.string({
      description: 'cron syntax for status notification schedule',
    }),

    'keep-verbose-logs': flags.boolean({
      description: 'store all requests logs to database',
      default: false,
    }),
  }

  /* eslint-disable complexity */
  async run() {
    const { flags } = this.parse(Monika)

    try {
      if (flags['create-config']) {
        await createConfig(flags)
        return
      }

      await openLogfile()

      if (flags.logs) {
        await printAllLogs()
        await closeLog()
        return
      }

      if (flags.flush) {
        let ans

        if (!flags.force) {
          ans = await cli.prompt(
            'Are you sure you want to flush all logs in monika-logs.db (Y/n)?'
          )
        }

        if (ans === 'Y' || flags.force) {
          await flushAllLogs()
          log.warn('Records flushed, thank you.')
        } else {
          log.info('Cancelled. Thank you.')
        }
        await closeLog()

        return
      }

      if (flags.summary) {
        printSummary(this.config)
        return
      }

      await initLoaders(flags, this.config)

      const isSymonMode = Boolean(flags.symonUrl) && Boolean(flags.symonKey)
      if (isSymonMode) {
        symonClient = new SymonClient(
          flags.symonUrl as string,
          flags.symonKey as string
        )
        await symonClient.initiate()
        symonClient.onConfig((config) => updateConfig(config, false))
      }

      let scheduledTasks: ScheduledTask[] = []
      let abortCurrentLooper: (() => void) | undefined

      for await (const config of getConfigIterator(isSymonMode)) {
        if (!config) continue
        if (abortCurrentLooper) {
          resetServerAlertStates()
          abortCurrentLooper()
        }

        // Stop, destroy, and clear all previous cron tasks
        scheduledTasks.forEach((task) => {
          task.stop()
        })
        scheduledTasks = []

        if (process.env.NODE_ENV !== 'test') {
          await notificationChecker(config.notifications ?? [])
        }

        const startupMessage = this.buildStartupMessage(
          config,
          flags.verbose,
          !abortCurrentLooper,
          isSymonMode
        )

        // Display config files being used
        if (isSymonMode) {
          log.info(startupMessage)
        } else {
          for (const x in flags.config) {
            // eslint-disable-next-line max-depth
            if (isUrl(flags.config[x])) {
              this.log('Using remote config:', flags.config[x])
            } else if (flags.config[x].length > 0) {
              this.log('Using config file:', path.resolve(flags.config[x]))
            }
          }
          this.log(startupMessage)
        }

        // config probes to be run by the looper
        // default sequence for Each element
        let probesToRun = config.probes
        if (flags.id) {
          if (!isIDValid(config, flags.id)) {
            throw new Error('Input error') // can't continue, exit from app
          }
          // doing custom sequences if list of ids is declared
          const idSplit = flags.id.split(',').map((item: string) => item.trim())
          probesToRun = config.probes.filter((probe) =>
            idSplit.includes(probe.id)
          )
        }

        const sanitizedProbe = probesToRun.map((probe: Probe) => {
          const sanitized = sanitizeProbe(probe, probe.id)
          if (isSymonMode) {
            sanitized.alerts = []
          }
          return sanitized
        })

        // save some data into files for later
        savePidFile(flags.config, config)

        // emit the sanitized probe
        if (sanitizedProbe.length > 0) {
          em.emit(events.config.sanitized, sanitizedProbe)
        }

        // schedule status update notification
        if (
          process.env.NODE_ENV !== 'test' &&
          flags['status-notification'] !== 'false' &&
          !isSymonMode
        ) {
          // defaults to 6 AM
          // default value is not defined in flag configuration,
          // because the value can also come from config file
          const schedule =
            flags['status-notification'] ||
            config['status-notification'] ||
            '0 6 * * *'

          const scheduledStatusUpdateTask = cron.schedule(
            schedule,
            getSummaryAndSendNotif
          )

          scheduledTasks.push(scheduledStatusUpdateTask)
        }

        const verboseLogs = isSymonMode || flags['keep-verbose-logs']

        abortCurrentLooper = idFeeder(
          sanitizedProbe,
          config.notifications ?? [],
          Number(flags.repeat),
          verboseLogs
        )
      }
    } catch (error) {
      await closeLog()
      this.error((error as any)?.message, { exit: 1 })
    }
  }

  buildStartupMessage(
    config: Config,
    verbose = false,
    firstRun: boolean,
    isSymonMode = false
  ) {
    if (isSymonMode) {
      return 'Running in Symon mode'
    }

    const { probes, notifications } = config

    let startupMessage = ''

    // warn if config is empty
    if ((config.notifications?.length ?? 0) === 0) {
      const NO_NOTIFICATIONS_MESSAGE = `Notifications has not been set. We will not be able to notify you when an INCIDENT occurs!
Please refer to the Monika documentations on how to how to configure notifications (e.g., Telegram, Slack, Desktop notification, etc.) at https://monika.hyperjump.tech/guides/notifications.`

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

    startupMessage += `${
      firstRun ? 'Starting' : 'Restarting'
    } Monika. Probes: ${probes.length}. Notifications: ${
      notifications?.length ?? 0
    }\n\n`

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
          // check one-by-one instead of using indexOf to avoid using type assertion
          if (
            item.type === 'mailgun' ||
            item.type === 'smtp' ||
            item.type === 'sendgrid'
          ) {
            startupMessage += `    Recipients: ${item.data.recipients.join(
              ', '
            )}\n`
          }

          switch (item.type) {
            case 'smtp':
              startupMessage += `    Hostname: ${item.data.hostname}
    Port: ${item.data.port}
    Username: ${item.data.username}
`
              break
            case 'mailgun':
              startupMessage += `    Domain: ${item.data.domain}\n`
              break
            case 'sendgrid':
              break
            case 'webhook':
            case 'slack':
            case 'lark':
            case 'google-chat':
              startupMessage += `    URL: ${item.data.url}\n`
              break
          }
        })
      }
    }

    return startupMessage
  }

  async catch(error: Error) {
    super.catch(error)

    if (symonClient) {
      await symonClient.sendStatus({ isOnline: false })
    }

    throw error
  }
}

/**
 * Show Exit Message
 */
process.on('SIGINT', async () => {
  if (!process.env.DISABLE_EXIT_MESSAGE) {
    log.info('Thank you for using Monika!')
    log.info('We need your help to make Monika better.')
    log.info(
      'Can you give us some feedback by clicking this link https://github.com/hyperjumptech/monika/discussions?\n'
    )
  }

  if (symonClient) {
    await symonClient.sendStatus({ isOnline: false })
  }

  em.emit(events.application.terminated)

  process.exit(process.exitCode)
})

export = Monika
