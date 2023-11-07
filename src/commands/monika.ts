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

import { Command, Errors, Flags } from '@oclif/core'
import { AbortController } from 'node-abort-controller'
import pEvent from 'p-event'

import type { Config } from '../interfaces/config'
import type { Probe } from '../interfaces/probe'

import { createConfig, getConfig, isSymonModeFrom } from '../components/config'
import { sortProbes } from '../components/config/sort'
import { printAllLogs } from '../components/logger'
import { flush } from '../components/logger/flush'
import { closeLog, openLogfile } from '../components/logger/history'
import { logStartupMessage } from '../components/logger/startup-message'
import { scheduleSummaryNotification } from '../components/notification/schedule-notification'
import { sendMonikaStartMessage } from '../components/notification/start-message'
import { setContext } from '../context'
import events from '../events'
import {
  type MonikaFlags,
  monikaFlagsDefaultValue,
  retryInitialDelayMs,
  retryMaxDelayMs,
  symonAPIVersion,
} from '../flag'
import { printSummary, savePidFile } from '../jobs/summary-notification'
import initLoaders from '../loaders'
import { sanitizeProbe, startProbing } from '../looper'
import SymonClient from '../symon'
import { getEventEmitter } from '../utils/events'
import { log } from '../utils/pino'

type GetProbesParams = {
  config: Config
  flags: MonikaFlags
}

const em = getEventEmitter()
let symonClient: SymonClient

export default class Monika extends Command {
  static description = 'Monika command line monitoring tool'

  static examples = [
    'monika',
    'monika --logs',
    'monika -r 1 --id "weather, stocks, 5, 7"',
    'monika --create-config',
    'monika --config https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml --config-interval 900',
  ]

  static flags = {
    'auto-update': Flags.string({
      description:
        'Enable auto-update for Monika. Available options: major, minor, patch. This will make Monika terminate itself on successful update but does not restart',
    }),
    config: Flags.string({
      char: 'c',
      default: monikaFlagsDefaultValue.config,
      description:
        'JSON configuration filename or URL. If none is supplied, will look for monika.yml in the current directory',
      env: 'MONIKA_JSON_CONFIG',
      multiple: true,
    }),

    'config-filename': Flags.string({
      default: monikaFlagsDefaultValue['config-filename'],
      dependsOn: ['config'],
      description:
        'The configuration filename for config file created if there is no config file found ',
    }),

    'config-interval': Flags.integer({
      default: monikaFlagsDefaultValue['config-interval'],
      dependsOn: ['config'],
      description:
        'The interval (in seconds) for periodic config checking if url is used as config source',
    }),

    'create-config': Flags.boolean({
      description:
        'Create config from HAR (-H), postman (-p), insomnia (-I), sitemap (--sitemap), textfile (--text) export file, or open Monika Configuration Generator using default browser',
    }),

    flush: Flags.boolean({
      description: 'Flush logs',
    }),

    'follow-redirects': Flags.integer({
      default: monikaFlagsDefaultValue['follow-redirects'],
      description:
        'Monika will follow redirects as many times as the specified value here. By default, Monika will follow redirects once. To disable redirects following, set the value to zero.',
    }),

    force: Flags.boolean({
      default: false,
      description: 'Force commands with a yes whenever Y/n is prompted.',
    }),

    har: Flags.string({
      char: 'H', // (H)ar file to
      description: 'Run Monika using a HAR file',
      exclusive: ['postman', 'insomnia', 'sitemap', 'text'],
      multiple: false,
    }),

    help: Flags.help({ char: 'h' }),

    id: Flags.string({
      char: 'i', // (i)ds to run
      description: 'Define specific probe ids to run',
      multiple: false,
    }),

    insomnia: Flags.string({
      char: 'I', // (I)nsomnia file to
      description: 'Run Monika using an Insomnia json/yaml file',
      exclusive: ['har', 'postman', 'sitemap', 'text'],
      multiple: false,
    }),

    'keep-verbose-logs': Flags.boolean({
      default: false,
      description: 'Store all requests logs to database',
    }),

    logs: Flags.boolean({
      char: 'l', // prints the (l)ogs
      description: 'Print all logs.',
    }),

    'one-probe': Flags.boolean({
      dependsOn: ['sitemap'],
      description: 'One Probe',
    }),

    output: Flags.string({
      char: 'o', // (o)utput file to write config to
      description: 'Write monika config file to this file',
      multiple: false,
    }),

    postman: Flags.string({
      char: 'p', // (p)ostman
      description: 'Run Monika using a Postman json file.',
      exclusive: ['har', 'insomnia', 'sitemap', 'text'],
      multiple: false,
    }),

    prometheus: Flags.integer({
      description:
        'Specifies the port the Prometheus metric server is listening on. e.g., 3001. (EXPERIMENTAL)',
      exclusive: ['r'],
    }),

    repeat: Flags.integer({
      char: 'r', // (r)epeat
      default: 0,
      description: 'Repeats the test run n times',
      multiple: false,
    }),

    retryInitialDelayMs,

    retryMaxDelayMs,

    sitemap: Flags.string({
      description: 'Run Monika using a Sitemap xml file.',
      exclusive: ['har', 'insomnia', 'postman', 'text'],
      multiple: false,
    }),

    'status-notification': Flags.string({
      description: 'Cron syntax for status notification schedule',
    }),

    stun: Flags.integer({
      char: 's', // (s)stun
      default: monikaFlagsDefaultValue.stun,
      description: 'Interval in seconds to check STUN server',
      multiple: false,
    }),

    summary: Flags.boolean({
      default: false,
      description: 'Display a summary of monika running stats',
    }),

    'symon-api-version': symonAPIVersion(),

    symonKey: Flags.string({
      dependsOn: ['symonUrl'],
      description: 'API Key for Symon',
    }),

    symonLocationId: Flags.string({
      dependsOn: ['symonKey', 'symonUrl'],
      description: 'Location ID for Symon (optional)',
      required: false,
    }),

    symonMonikaId: Flags.string({
      dependsOn: ['symonKey', 'symonUrl'],
      description: 'Monika ID for Symon (optional)',
      required: false,
    }),

    symonReportInterval: Flags.integer({
      dependsOn: ['symonKey', 'symonUrl'],
      description: 'Interval for reporting to Symon in milliseconds (optional)',
      required: false,
    }),

    symonReportLimit: Flags.integer({
      dependsOn: ['symonKey', 'symonUrl'],
      description: 'Data limit to be reported to Symon (optional)',
      required: false,
    }),

    symonUrl: Flags.string({
      dependsOn: ['symonKey'],
      description: 'URL of Symon',
      hidden: false,
    }),

    text: Flags.string({
      description: 'Run Monika using a Simple text file',
      exclusive: ['postman', 'insomnia', 'sitemap', 'har'],
      multiple: false,
    }),

    verbose: Flags.boolean({
      default: false,
      description: 'Show verbose log messages',
    }),

    version: Flags.version({ char: 'v' }),
  }

  static id = 'monika'

  async catch(error: Error): Promise<unknown> {
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

  deprecationHandler(config: Config): Config {
    const showDeprecateMsg: Record<
      'query' | 'incidentThreshold' | 'recoveryThreshold',
      boolean
    > = {
      query: false,
      incidentThreshold: false,
      recoveryThreshold: false,
    }

    const checkedConfig = {
      ...config,
      probes: config.probes?.map((probe) => {
        if (probe?.recoveryThreshold) {
          showDeprecateMsg.recoveryThreshold = true
        }

        return {
          ...probe,
          requests: probe.requests?.map((request) => ({
            ...request,
            alert: request.alerts?.map((alert) => {
              if (alert.query) {
                showDeprecateMsg.query = true
                return { ...alert, assertion: alert.query }
              }

              return alert
            }),
          })),
          alerts: probe.alerts?.map((alert) => {
            if (alert.query) {
              showDeprecateMsg.query = true
              return { ...alert, assertion: alert.query }
            }

            return alert
          }),
        }
      }),
    }

    if (showDeprecateMsg.recoveryThreshold) {
      log.warn(
        'recoveryThreshold is deprecated. It will be managed internally by Monika.'
      )
    }

    if (showDeprecateMsg.query) {
      log.warn('"alerts.query" is deprecated. Please use "alerts.assertion"')
    }

    return checkedConfig
  }

  getProbes({ config, flags }: GetProbesParams): Probe[] {
    const sortedProbes = sortProbes(config.probes, flags.id)

    return sortedProbes.map((probe: Probe) =>
      sanitizeProbe(isSymonModeFrom(flags), probe)
    )
  }

  async run(): Promise<void> {
    const monika = await this.parse(Monika)
    const _flags: MonikaFlags = monika.flags
    setContext({ flags: _flags })

    try {
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
        await flush(_flags.force)
        await closeLog()
        return
      }

      if (_flags.summary) {
        printSummary(this.config)
        await closeLog()
        return
      }

      await initLoaders(_flags, this.config)

      if (isSymonModeFrom(_flags)) {
        symonClient = new SymonClient(_flags)
        await symonClient.initiate()
      }

      let isFirstRun = true

      for (;;) {
        const controller = new AbortController()
        const { signal } = controller
        const config = getConfig()
        const notifications = config.notifications || []
        const probes = this.getProbes({ config, flags: _flags })

        // emit the sanitized probe
        em.emit(events.config.sanitized, probes)

        // save some data into files for later
        savePidFile(_flags.config, config)

        this.deprecationHandler(config)

        logStartupMessage({
          config,
          flags: _flags,
          isFirstRun,
        })

        startProbing({
          notifications,
          probes,
          signal,
        })

        if (process.env.NODE_ENV === 'test') {
          break
        }

        sendMonikaStartMessage(notifications).catch((error) =>
          log.error(error.message)
        )

        // schedule status update notification
        scheduleSummaryNotification({ config, flags: _flags })

        isFirstRun = false

        // block the loop until receives config updated event
        // eslint-disable-next-line no-await-in-loop
        await pEvent(em, events.config.updated)
        controller.abort('Monika configuration updated')
      }
    } catch (error: unknown) {
      await closeLog()
      this.error((error as Error)?.message, { exit: 1 })
    }
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
    await symonClient.stopReport()
    await symonClient.sendStatus({ isOnline: false })
  }

  em.emit(events.application.terminated)

  // eslint-disable-next-line no-process-exit
  process.exit(process.exitCode)
})
