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
import isUrl from 'is-url'
import open from 'open'
import {
  getConfig,
  getConfigIterator,
  setupConfigFromFile,
  setupConfigFromUrl,
} from './components/config'
import { notificationLog, printAllLogs } from './components/logger'
import {
  closeLog,
  flushAllLogs,
  openLogfile,
} from './components/logger/history'
import {
  validateResponse,
  ValidateResponseStatus,
} from './components/notification/alert'
import { notificationChecker } from './components/notification/checker'
import { terminationNotif } from './components/notification/termination'
import { resetProbeStatuses } from './components/notification/process-server-status'
import {
  PROBE_RESPONSE_RECEIVED,
  PROBE_RESPONSE_VALIDATED,
  PROBE_STATUS_PROCESSED,
} from './constants/event-emitter'
import { Config } from './interfaces/config'
import { MailData, MailgunData, SMTPData, WebhookData } from './interfaces/data'
import { Probe } from './interfaces/probe'
import { AxiosResponseWithExtraData } from './interfaces/request'
import { idFeeder, isIDValid, loopReport, sanitizeProbe } from './looper'
import {
  PrometheusCollector,
  startPrometheusMetricsServer,
} from './plugins/metrics/prometheus'
import { getEventEmitter } from './utils/events'
import { log } from './utils/pino'
import { StatusDetails } from './interfaces/probe-status'
import { Notification } from './interfaces/notification'
import { sendAlerts } from './components/notification'
import { getLogsAndReport } from './components/reporter'

const em = getEventEmitter()

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

  static examples = [
    'monika',
    'monika --logs',
    'monika -r 1 --id 1,2,5,7',
    'monika --create-config',
    'monika --config https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.json --config-interval 900',
  ]

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),

    config: flags.string({
      char: 'c',
      description:
        'JSON configuration filename or URL. If none is supplied, will look for monika.json in the current directory',
      default: () => getDefaultConfig(),
      env: 'MONIKA_JSON_CONFIG',
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
    }),

    logs: flags.boolean({
      char: 'l', // prints the (l)ogs
      description: 'print all logs.',
    }),

    flush: flags.boolean({
      description: 'flush logs',
    }),

    verbose: flags.boolean({
      description: 'show verbose log messages',
      default: false,
    }),

    prometheus: flags.integer({
      description:
        'Specifies the port the Prometheus metric server is listening on. e.g., 3001. (EXPERIMENTAL)',
      exclusive: ['r'],
    }),

    repeat: flags.string({
      char: 'r', // (r)epeat
      description: 'repeats the test run n times',
      multiple: false,
    }),

    id: flags.string({
      char: 'i', // (i)ds to run
      description: 'specific probe ids to run',
      multiple: false,
    }),

    har: flags.string({
      char: 'H', // (H)ar file to
      description: 'Run Monika using a HAR file',
      multiple: false,
    }),
  }

  async run() {
    const { flags } = this.parse(Monika)
    await openLogfile()

    if (flags.logs) {
      await printAllLogs()
      await closeLog()
      return
    }

    if (flags.flush) {
      const ans = await cli.prompt(
        'Are you sure you want to flush all logs in monika-logs.db (Y/n)?'
      )
      if (ans === 'Y') {
        await flushAllLogs()
        log.warn('Records flushed, thank you.')
      } else {
        log.info('Cancelled. Thank you.')
      }
      await closeLog()
      return
    }

    // start Promotheus server
    if (flags.prometheus) {
      const {
        registerCollectorFromProbes,
        collectProbeRequestMetrics,
      } = new PrometheusCollector()

      // register prometheus metric collectors
      em.on('SANITIZED_CONFIG', registerCollectorFromProbes)
      // collect prometheus metrics
      em.on(PROBE_RESPONSE_RECEIVED, collectProbeRequestMetrics)

      startPrometheusMetricsServer(flags.prometheus)
    }

    if (flags['create-config']) {
      log.info(
        'Opening Monika Configuration Generator in your default browser...'
      )
      await open('https://hyperjumptech.github.io/monika-config-generator/')
      return
    }

    try {
      if (isUrl(flags.config)) {
        await setupConfigFromUrl(flags.config, flags['config-interval'])
      } else {
        const watchConfigFile = !(
          process.env.CI ||
          process.env.NODE_ENV === 'test' ||
          flags.repeat
        )

        await setupConfigFromFile(flags, watchConfigFile)
      }

      // Run report on interval if symon configuration exists
      if (!(process.env.CI || process.env.NODE_ENV === 'test')) {
        loopReport(getConfig)
      }

      // run probes on interval
      let abortCurrentLooper: (() => void) | undefined

      for await (const config of getConfigIterator()) {
        if (abortCurrentLooper) {
          resetProbeStatuses()
          abortCurrentLooper()
        }

        if (process.env.NODE_ENV !== 'test') {
          await notificationChecker(config.notifications ?? [])
        }

        const startupMessage = this.buildStartupMessage(
          config,
          flags.verbose,
          !abortCurrentLooper
        )
        this.log(startupMessage)

        // config probes to be run by the looper
        // default sequence for Each element
        let probesToRun = config.probes
        if (flags.id) {
          if (!isIDValid(config, flags.id)) {
            em.emit('TERMINATE_EVENT', 'Monika is terminating')
            throw new Error('Input error') // can't continue, exit from app
          }
          // doing custom sequences if list of ids is declared
          const idSplit = flags.id.split(',').map((item: string) => item.trim())
          probesToRun = config.probes.filter((probe) =>
            idSplit.includes(probe.id)
          )
        }

        // sanitize the probe
        const sanitizedProbe = probesToRun.map((probe: Probe) =>
          sanitizeProbe(probe, probe.id)
        )

        // emit the sanitized probe
        if (sanitizedProbe) {
          em.emit('SANITIZED_CONFIG', sanitizedProbe)
        }

        abortCurrentLooper = idFeeder(
          sanitizedProbe,
          config.notifications ?? [],
          Number(flags.repeat)
        )
      }
    } catch (error) {
      await closeLog()
      this.error(error?.message, { exit: 1 })
    }
  }

  buildStartupMessage(config: Config, verbose = false, firstRun: boolean) {
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

// Subscribe FirstEvent
em.addListener('TERMINATE_EVENT', async (data) => {
  log.warn(data)
  const config = getConfig()
  if (process.env.NODE_ENV !== 'test') {
    await terminationNotif(config.notifications ?? [])
  }
})

// EVENT EMITTER - PROBE_RESPONSE_RECEIVED
interface ProbeResponseReceived {
  probe: Probe
  requestIndex: number
  response: AxiosResponseWithExtraData
}

// PROBE_RESPONSE_RECEIVED - VALIDATE RESPONSE
em.on(PROBE_RESPONSE_RECEIVED, function (data: ProbeResponseReceived) {
  const res = validateResponse(data.probe.alerts, data.response)

  em.emit(PROBE_RESPONSE_VALIDATED, res)
})

// EVENT EMITTER - PROBE_STATUS_PROCESSED
interface ProbeStatusProcessed {
  probe: Probe
  statuses?: StatusDetails[]
  notifications?: Notification[]
  validatedResponseStatuses: ValidateResponseStatus[]
  totalRequests: number
}

interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  status?: StatusDetails
}

interface ProbeSaveLogToDatabase
  extends Omit<
    ProbeStatusProcessed,
    'statuses' | 'totalRequests' | 'validatedResponseStatuses'
  > {
  index: number
  status?: StatusDetails
}

const probeSendNotification = async (data: ProbeSendNotification) => {
  const {
    index,
    probe,
    status,
    notifications,
    totalRequests,
    validatedResponseStatuses,
  } = data

  const statusString = status?.isDown ? 'DOWN' : 'UP'
  const url = probe.requests[totalRequests - 1].url ?? ''

  if ((notifications?.length ?? 0) > 0) {
    await sendAlerts({
      url: url,
      status: statusString,
      probeId: probe.id,
      probeName: probe.name,
      incidentThreshold: probe.incidentThreshold,
      notifications: notifications ?? [],
      validation: validatedResponseStatuses[index],
    })
  }
}

const probeSaveLogToDatabase = async (data: ProbeSaveLogToDatabase) => {
  const { index, probe, status, notifications } = data

  const type =
    status?.state === 'UP_TRUE_EQUALS_THRESHOLD'
      ? 'NOTIFY-INCIDENT'
      : 'NOTIFY-RECOVER'

  if ((notifications?.length ?? 0) > 0) {
    Promise.all(
      notifications?.map((notification) => {
        const alertMsg = probe.alerts[index]

        return notificationLog({
          type,
          probe,
          alertMsg,
          notification,
        })
      })!
    )
  }
}

// PROBE_STATUS_PROCESSED
em.on(PROBE_STATUS_PROCESSED, (data: ProbeStatusProcessed) => {
  const {
    probe,
    statuses,
    notifications,
    totalRequests,
    validatedResponseStatuses,
  } = data

  statuses
    ?.filter((status) => status.shouldSendNotification)
    ?.forEach((status, index) => {
      probeSendNotification({
        index,
        probe,
        status,
        notifications,
        totalRequests,
        validatedResponseStatuses,
      }).catch((error: Error) => log.error(error.message))

      probeSaveLogToDatabase({
        index,
        probe,
        status,
        notifications,
      })
        .then(getLogsAndReport)
        .catch((error: Error) => log.error(error.message))
    })
})

/**
 * Show Exit Message
 */
process.on('SIGINT', () => {
  if (!process.env.DISABLE_EXIT_MESSAGE) {
    log.info('Thank you for using Monika!')
    log.info('We need your help to make Monika better.')
    log.info(
      'Can you give us some feedback by clicking this link https://github.com/hyperjumptech/monika/discussions?\n'
    )
  }
  em.emit('TERMINATE_EVENT', 'Monika is terminating')
  process.exit(process.exitCode)
})

export = Monika
