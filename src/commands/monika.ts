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

import { Command, Errors } from '@oclif/core'
import pEvent from 'p-event'
import type { ValidatedConfig } from '../interfaces/config'

import {
  getValidatedConfig,
  isSymonModeFrom,
  initConfig,
} from '../components/config'
import { createConfig } from '../components/config/create'
import { printAllLogs } from '../components/logger'
import { flush } from '../components/logger/flush'
import { closeLog } from '../components/logger/history'
import { logStartupMessage } from '../components/logger/startup-message'
import { scheduleSummaryNotification } from '../components/notification/schedule-notification'
import { sendMonikaStartMessage } from '../components/notification/start-message'
import { printSummary } from '../components/summary'
import { getContext, setContext } from '../context'
import events from '../events'
import { sanitizeFlags, flags } from '../flag'
import { savePidFile } from '../jobs/summary-notification'
import initLoaders from '../loaders'
import { startProbing } from '../looper'
import SymonClient from '../symon'
import { getEventEmitter } from '../utils/events'
import { log } from '../utils/pino'
import { fetchAndCacheNetworkInfo } from '../utils/public-ip'
import { initSentry } from '../plugins/sentry'
import {
  captureException,
  close as closeSentry,
  flush as flushSentry,
} from '@sentry/node'
import { getProbes } from '../components/config/probe'

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

  static flags = flags
  static id = 'monika'

  async catch(error: Error): Promise<unknown> {
    super.catch(error)

    if (getContext().flags.sentryDSN !== undefined) {
      captureException(error)
    }

    if (symonClient) {
      await symonClient.sendStatus({ isOnline: false })
    }

    if (error instanceof Errors.ExitError) {
      return Errors.handle(error)
    }

    if (error.message.includes('EEXIT: 0')) {
      // this is normal exit, for example after running with --version,
      // not an error so just quit immediately
      // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
      process.exit(0)
    }

    throw error
  }

  async finally(): Promise<void> {
    if (getContext().flags.sentryDSN !== undefined) {
      await flushSentry(2000)
      await closeSentry()
    }
  }

  async run(): Promise<void> {
    const cmd = await this.parse(Monika)
    const flags = sanitizeFlags(cmd.flags)

    setContext({ flags, userAgent: this.config.userAgent })

    try {
      if (flags.version) {
        this.log(this.config.userAgent)
        this.exit(0)
      }

      if (flags['create-config']) {
        await createConfig()
        return
      }

      if (flags.logs) {
        await printAllLogs()
        return
      }

      if (flags.flush) {
        await flush()
        return
      }

      if (flags.summary) {
        await printSummary()
        return
      }

      const isSymonMode = isSymonModeFrom(flags)
      if (!isSymonMode) {
        await initConfig()
      }

      await initLoaders(flags, this.config)
      if (flags['skip-start-message'] === false) {
        await logRunningInfo({ isSymonMode, isVerbose: flags.verbose })
      }

      if (isSymonMode) {
        symonClient = new SymonClient(flags)
        await symonClient.initiate()
      }

      if (flags.sentryDSN !== undefined) {
        log.info('Sentry is enabled for error reporting')
        initSentry({
          dsn: flags.sentryDSN,
          monikaVersion: this.config.version,
        })
      }

      let isFirstRun = true

      for (;;) {
        const config = getValidatedConfig()
        const probes = getProbes()

        // emit the sanitized probe
        em.emit(events.config.sanitized, probes)
        // save some data into files for later
        savePidFile(flags.config, config)
        deprecationHandler(config)

        logStartupMessage({
          config,
          flags,
          isFirstRun,
        })

        const controller = new AbortController()
        const { signal } = controller
        const { notifications } = config
        startProbing({
          notifications,
          probes,
          signal,
        })

        if (getContext().isTest) {
          break
        }

        if (flags['skip-start-message'] === false) {
          // if skipping, skip also startup notification
          sendMonikaStartMessage(notifications).catch((error) =>
            log.error(error.message)
          )
        }

        // schedule status update notification
        scheduleSummaryNotification({ config, flags })

        isFirstRun = false

        // block the loop until receives config updated event
        // eslint-disable-next-line no-await-in-loop
        await pEvent(em, events.config.updated)

        controller.abort('Monika configuration updated')
      }
    } catch (error: unknown) {
      this.error((error as Error)?.message, { exit: 1 })
    } finally {
      closeLog()
    }
  }
}

type RunningInfoParams = { isSymonMode: boolean; isVerbose: boolean }

async function logRunningInfo({ isVerbose, isSymonMode }: RunningInfoParams) {
  if (!isVerbose && !isSymonMode) {
    log.info('Monika is running.')
    return
  }

  try {
    const { city, hostname, isp, privateIp, publicIp } =
      await fetchAndCacheNetworkInfo()

    log.info(
      `Monika is running from: ${city} - ${isp} (${publicIp}) - ${hostname} (${privateIp})`
    )
  } catch (error) {
    log.warn(`Failed to obtain location/ISP info. Got: ${error}`)
  }
}

function deprecationHandler(config: ValidatedConfig): ValidatedConfig {
  const showDeprecateMsg: Record<'query', boolean> = {
    query: false,
  }

  const checkedConfig = {
    ...config,
    probes: config.probes?.map((probe) => ({
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
    })),
  }

  if (showDeprecateMsg.query) {
    log.warn('"alerts.query" is deprecated. Please use "alerts.assertion"')
  }

  return checkedConfig
}

/**
 * Show Exit Message
 */
process.on('SIGINT', async () => {
  log.info('Thank you for using Monika!')
  log.info('We need your help to make Monika better.')
  log.info(
    'Can you give us some feedback by clicking this link https://github.com/hyperjumptech/monika/discussions?\n'
  )

  if (symonClient) {
    await symonClient.sendStatus({ isOnline: false })
    await symonClient.stop()
  }

  await flushSentry(2000)

  em.emit(events.application.terminated)

  // eslint-disable-next-line n/no-process-exit
  process.exit(process.exitCode)
})
