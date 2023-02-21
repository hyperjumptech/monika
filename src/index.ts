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

import isUrl from 'is-url'
import cron, { ScheduledTask } from 'node-cron'
import path from 'path'

import {
  CliUx,
  Command,
  Errors,
  Flags,
  Interfaces,
  loadHelpClass,
  toCached,
} from '@oclif/core'

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
import { generateStartupMessage } from './components/logger/startup-message'
import { notificationChecker } from './components/notification/checker'
import { setContext } from './context'
import events from './events'
import { Config } from './interfaces/config'
import { Probe } from './interfaces/probe'
import {
  getSummaryAndSendNotif,
  printSummary,
  savePidFile,
} from './jobs/summary-notification'
import initLoaders from './loaders'
import { sanitizeProbe, startProbing } from './looper'
import { monikaFlagsDefaultValue } from './context/monika-flags'
import type { MonikaFlags } from './context/monika-flags'
import SymonClient from './symon'
import { checkProbeId } from './utils/check-probe-id'
import { getEventEmitter } from './utils/events'
import { log } from './utils/pino'

const em = getEventEmitter()
let symonClient: SymonClient

class Monika extends Command {
  static id = 'monika'

  static description = 'Monika command line monitoring tool'

  static examples = [
    'monika',
    'monika --logs',
    'monika -r 1 --id "weather, stocks, 5, 7"',
    'monika --create-config',
    'monika --config https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml --config-interval 900',
  ]

  static flags = {
    version: Flags.version({ char: 'v' }),
    help: Flags.boolean({ char: 'h' }),

    symonUrl: Flags.string({
      hidden: false,
      description: 'URL of Symon',
      dependsOn: ['symonKey'],
    }),

    symonKey: Flags.string({
      description: 'API Key for Symon',
      dependsOn: ['symonUrl'],
    }),

    symonLocationId: Flags.string({
      description: 'Location ID for Symon (optional)',
      dependsOn: ['symonKey', 'symonUrl'],
      required: false,
    }),

    symonMonikaId: Flags.string({
      description: 'Monika ID for Symon (optional)',
      dependsOn: ['symonKey', 'symonUrl'],
      required: false,
    }),

    symonReportInterval: Flags.integer({
      description: 'Interval for reporting to Symon in milliseconds (optional)',
      dependsOn: ['symonKey', 'symonUrl'],
      required: false,
    }),

    symonReportLimit: Flags.integer({
      description: 'Data limit to be reported to Symon (optional)',
      dependsOn: ['symonKey', 'symonUrl'],
      required: false,
    }),

    config: Flags.string({
      char: 'c',
      description:
        'JSON configuration filename or URL. If none is supplied, will look for monika.yml in the current directory',
      default: monikaFlagsDefaultValue.config,
      env: 'MONIKA_JSON_CONFIG',
      multiple: true,
    }),

    'create-config': Flags.boolean({
      description:
        'Create config from HAR (-H), postman (-p), insomnia (-I), sitemap (--sitemap), textfile (--text) export file, or open Monika Configuration Generator using default browser',
    }),

    'config-interval': Flags.integer({
      description:
        'The interval (in seconds) for periodic config checking if url is used as config source',
      default: monikaFlagsDefaultValue['config-interval'],
      dependsOn: ['config'],
    }),

    'config-filename': Flags.string({
      description:
        'The configuration filename for config file created if there is no config file found ',
      default: monikaFlagsDefaultValue['config-filename'],
      dependsOn: ['config'],
    }),

    sitemap: Flags.string({
      description: 'Run Monika using a Sitemap xml file.',
      multiple: false,
      exclusive: ['har', 'insomnia', 'postman', 'text'],
    }),

    'one-probe': Flags.boolean({
      description: 'One Probe',
      dependsOn: ['sitemap'],
    }),

    postman: Flags.string({
      char: 'p', // (p)ostman
      description: 'Run Monika using a Postman json file.',
      multiple: false,
      exclusive: ['har', 'insomnia', 'sitemap', 'text'],
    }),

    har: Flags.string({
      char: 'H', // (H)ar file to
      description: 'Run Monika using a HAR file',
      multiple: false,
      exclusive: ['postman', 'insomnia', 'sitemap', 'text'],
    }),

    insomnia: Flags.string({
      char: 'I', // (I)nsomnia file to
      description: 'Run Monika using an Insomnia json/yaml file',
      multiple: false,
      exclusive: ['har', 'postman', 'sitemap', 'text'],
    }),

    text: Flags.string({
      description: 'Run Monika using a Simple text file',
      multiple: false,
      exclusive: ['postman', 'insomnia', 'sitemap', 'har'],
    }),

    logs: Flags.boolean({
      char: 'l', // prints the (l)ogs
      description: 'Print all logs.',
    }),

    flush: Flags.boolean({
      description: 'Flush logs',
    }),

    verbose: Flags.boolean({
      description: 'Show verbose log messages',
      default: false,
    }),

    prometheus: Flags.integer({
      description:
        'Specifies the port the Prometheus metric server is listening on. e.g., 3001. (EXPERIMENTAL)',
      exclusive: ['r'],
    }),

    repeat: Flags.integer({
      char: 'r', // (r)epeat
      description: 'Repeats the test run n times',
      multiple: false,
      default: 0,
    }),

    stun: Flags.integer({
      char: 's', // (s)stun
      description: 'Interval in seconds to check STUN server',
      multiple: false,
      default: monikaFlagsDefaultValue.stun,
    }),

    id: Flags.string({
      char: 'i', // (i)ds to run
      description: 'Define specific probe ids to run',
      multiple: false,
    }),

    output: Flags.string({
      char: 'o', // (o)utput file to write config to
      description: 'Write monika config file to this file',
      multiple: false,
    }),

    force: Flags.boolean({
      description: 'Force commands with a yes whenever Y/n is prompted.',
      default: false,
    }),

    summary: Flags.boolean({
      description: 'Display a summary of monika running stats',
      default: false,
    }),

    'status-notification': Flags.string({
      description: 'Cron syntax for status notification schedule',
    }),

    'keep-verbose-logs': Flags.boolean({
      description: 'Store all requests logs to database',
      default: false,
    }),

    'auto-update': Flags.string({
      description:
        'Enable auto-update for Monika. Available options: major, minor, patch. This will make Monika terminate itself on successful update but does not restart',
    }),

    'max-start-delay': Flags.integer({
      default: monikaFlagsDefaultValue['max-start-delay'],
      description:
        'The maximum delay (in milliseconds) to start probing when there are many probes. When this is set to value greater than zero, all of the probes will start at slightly different time but within the value set here.',
    }),

    'follow-redirects': Flags.integer({
      default: monikaFlagsDefaultValue['follow-redirects'],
      description:
        'Monika will follow redirects as many times as the specified value here. By default, Monika will follow redirects once. To disable redirects following, set the value to zero.',
    }),
  }

  /* eslint-disable complexity */
  async run(): Promise<void> {
    const monika = await this.parse(Monika)
    const _flags: MonikaFlags = monika.flags
    setContext({ flags: _flags })

    try {
      if (_flags.help) {
        const Help = await loadHelpClass(this.config)
        const help = new Help(this.config)
        const cmd = await toCached(
          this.ctor as unknown as Interfaces.Command.Class
        )
        await help.showCommandHelp(cmd, [])
        return
      }

      if (_flags['create-config']) {
        await createConfig(_flags)
        return
      }

      await openLogfile()

      if (_flags.logs) {
        await printAllLogs()
        await closeLog()
        return
      }

      if (_flags.flush) {
        let ans

        if (!_flags.force) {
          ans = await CliUx.ux.prompt(
            'Are you sure you want to flush all logs in monika-logs.db (Y/n)?'
          )
        }

        if (ans === 'Y' || _flags.force) {
          await flushAllLogs()
          log.warn('Records flushed, thank you.')
        } else {
          log.info('Cancelled. Thank you.')
        }

        await closeLog()

        return
      }

      if (_flags.summary) {
        printSummary(this.config)
        return
      }

      await initLoaders(_flags, this.config)

      const isSymonMode = Boolean(_flags.symonUrl) && Boolean(_flags.symonKey)
      if (isSymonMode) {
        symonClient = new SymonClient({
          url: _flags.symonUrl as string,
          apiKey: _flags.symonKey as string,
          locationId: _flags.symonLocationId as string,
          monikaId: _flags.symonMonikaId as string,
          reportInterval: _flags.symonReportInterval,
          reportLimit: _flags.symonReportLimit,
        })
        await symonClient.initiate()
        symonClient.onConfig((config) => updateConfig(config, false))
      }

      let scheduledTasks: ScheduledTask[] = []
      let abortCurrentLooper: (() => void) | undefined

      for await (const config of getConfigIterator(isSymonMode)) {
        if (!config) continue
        if (abortCurrentLooper) {
          abortCurrentLooper()
        }

        // Stop, destroy, and clear all previous cron tasks
        for (const task of scheduledTasks) {
          task.stop()
        }

        scheduledTasks = []

        if (process.env.NODE_ENV !== 'test') {
          await notificationChecker(config.notifications ?? [])
        }

        await this.deprecationHandler(config)

        const startupMessage = generateStartupMessage({
          config,
          isFirstRun: !abortCurrentLooper,
          isSymonMode,
          isVerbose: _flags.verbose,
        })

        // Display config files being used
        if (isSymonMode) {
          log.info(startupMessage)
        } else {
          for (const x in _flags.config) {
            // eslint-disable-next-line max-depth
            if (isUrl(_flags.config[x])) {
              this.log('Using remote config:', _flags.config[x])
            } else if (_flags.config[x].length > 0) {
              this.log('Using config file:', path.resolve(_flags.config[x]))
            }
          }

          this.log(startupMessage)
        }

        // config probes to be run by the looper
        // default sequence for Each element
        let probesToRun = config.probes
        if (_flags.id) {
          if (!checkProbeId(probesToRun, _flags.id)) {
            throw new Error('Input error') // can't continue, exit from app
          }

          // doing custom sequences if list of ids is declared
          const idSplit = new Set(
            _flags.id.split(',').map((item: string) => item.trim())
          )
          probesToRun = config.probes.filter((probe) => idSplit.has(probe.id))
        }

        const sanitizedProbe = probesToRun.map((probe: Probe) => {
          const sanitized = sanitizeProbe(probe, probe.id)
          if (isSymonMode) {
            sanitized.alerts = []
          }

          return sanitized
        })

        // save some data into files for later
        savePidFile(_flags.config, config)

        // emit the sanitized probe
        if (sanitizedProbe.length > 0) {
          em.emit(events.config.sanitized, sanitizedProbe)
        }

        // schedule status update notification
        if (
          process.env.NODE_ENV !== 'test' &&
          _flags['status-notification'] !== 'false' &&
          !isSymonMode
        ) {
          // defaults to 6 AM
          // default value is not defined in flag configuration,
          // because the value can also come from config file
          const schedule =
            _flags['status-notification'] ||
            config['status-notification'] ||
            '0 6 * * *'

          const scheduledStatusUpdateTask = cron.schedule(
            schedule,
            getSummaryAndSendNotif
          )

          scheduledTasks.push(scheduledStatusUpdateTask)
        }

        abortCurrentLooper = startProbing({
          probes: sanitizedProbe,
          notifications: config.notifications ?? [],
        })
      }
    } catch (error) {
      await closeLog()
      this.error((error as any)?.message, { exit: 1 })
    }
  }
  /* eslint-enable complexity */

  async catch(error: Error): Promise<any> {
    super.catch(error)

    if (symonClient) {
      await symonClient.sendStatus({ isOnline: false })
    }

    if (error instanceof Errors.ExitError) {
      return Errors.handle(error)
    }

    if (error.message.includes('EEXIT: 0')) {
      // this is normal exit, for example after running with --version,
      // not an error so just quit immediately
      // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
      process.exit(0)
    }

    throw error
  }

  async deprecationHandler(config: Config): Promise<Config> {
    let showMessage = false

    const checkedConfig = {
      ...config,
      probes: config.probes?.map((probe) => ({
        ...probe,
        requests: probe.requests?.map((request) => ({
          ...request,
          alert: request.alerts?.map((alert) => {
            showMessage = true

            if (alert.query) {
              return { ...alert, assertion: alert.query }
            }

            return alert
          }),
        })),
        alerts: probe.alerts?.map((alert) => {
          showMessage = true

          if (alert.query) {
            return { ...alert, assertion: alert.query }
          }

          return alert
        }),
      })),
    }

    if (showMessage) {
      log.warn('"alerts.query" is deprecated. Please use "alerts.assertion"')
    }

    return checkedConfig
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

  // eslint-disable-next-line no-process-exit
  process.exit(process.exitCode)
})

export = Monika
