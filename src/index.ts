/* eslint-disable complexity */
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
import format from 'date-fns/format'
import fs from 'fs'
import cron, { ScheduledTask } from 'node-cron'
import { hostname } from 'os'
import { createConfig, getConfig, getConfigIterator } from './components/config'
import {
  printAllLogs,
  printProbeLog,
  setNotificationLog,
} from './components/logger'
import {
  closeLog,
  flushAllLogs,
  getSummary,
  saveNotificationLog,
} from './components/logger/history'
import { sendAlerts, sendNotifications } from './components/notification'
import { getMessageForTerminate } from './components/notification/alert-message'
import { notificationChecker } from './components/notification/checker'
import { resetProbeStatuses } from './components/notification/process-server-status'
import { getLogsAndReport } from './components/reporter'
import { checkTLS } from './components/tls-checker'
import {
  CONFIG_SANITIZED,
  PROBE_ALERTS_READY,
  PROBE_LOGS_BUILT,
  PROBE_RESPONSE_RECEIVED,
  PROBE_RESPONSE_VALIDATED,
} from './constants/event-emitter'
import { Config } from './interfaces/config'
import { LogObject } from './interfaces/logs'
import { Notification } from './interfaces/notification'
import { Probe } from './interfaces/probe'
import { ProbeStateDetails } from './interfaces/probe-status'
import { AxiosResponseWithExtraData } from './interfaces/request'
import { idFeeder, isIDValid, sanitizeProbe } from './looper'
import validateResponse, { ValidateResponse } from './plugins/validate-response'
import { getEventEmitter } from './utils/events'
import getIp from './utils/ip'
import { log } from './utils/pino'
import { publicIpAddress } from './utils/public-ip'
import initLoaders from './loaders'

const em = getEventEmitter()

function getDefaultConfig() {
  const filesArray = fs.readdirSync('./')
  const monikaDotJsonFile = filesArray.find((x) => x === 'monika.json')
  const configDotJsonFile = filesArray.find((x) => x === 'config.json')
  const monikaDotYamlFile = filesArray.find(
    (x) => x === 'monika.yml' || x === 'monika.yaml'
  )

  return monikaDotJsonFile
    ? `./${monikaDotJsonFile}`
    : configDotJsonFile
    ? `./${configDotJsonFile}`
    : monikaDotYamlFile
    ? `./${monikaDotYamlFile}`
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
      description: 'Open Monika Configuration Generator using default browser',
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
      exclusive: ['config', 'har'],
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
      description: 'Specific probe ids to run',
      multiple: false,
    }),

    har: flags.string({
      char: 'H', // (H)ar file to
      description: 'Run Monika using a HAR file',
      multiple: false,
      exclusive: ['config', 'postman'],
    }),

    output: flags.string({
      char: 'o', // (o)utput file to write config to
      description: 'Write monika config file to this file',
      multiple: false,
    }),

    force: flags.boolean({
      description: 'Force command',
      default: false,
    }),

    'status-notification': flags.string({
      description: 'Cron syntax for status notification schedule',
    }),

    notification: flags.string({
      description:
        'Override notification(s) provided by config (-c/--config) with a separate file',
      dependsOn: ['config'],
    }),
  }

  async run() {
    const { flags } = this.parse(Monika)

    try {
      if (flags['create-config']) {
        await createConfig(flags)
        return
      }

      await initLoaders(flags)

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

      let scheduledTasks: ScheduledTask[] = []
      let abortCurrentLooper: (() => void) | undefined

      for await (const config of getConfigIterator()) {
        if (abortCurrentLooper) {
          resetProbeStatuses()
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
          !abortCurrentLooper
        )
        this.log(startupMessage)

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

        // sanitize the probe
        const sanitizedProbe = probesToRun.map((probe: Probe) =>
          sanitizeProbe(probe, probe.id)
        )

        // emit the sanitized probe
        if (sanitizedProbe) {
          em.emit(CONFIG_SANITIZED, sanitizedProbe)
        }

        // run TLS checker
        if (config?.certificate && config.certificate.domains.length > 0) {
          config.certificate?.domains.forEach((domain) => {
            // TODO: Remove probe below
            // probe is used because probe detail is needed to save the notification log
            const probe = {
              id: '',
              name: '',
              requests: [],
              incidentThreshold: 0,
              recoveryThreshold: 0,
              alerts: [],
            }
            // check TLS when Monika starts
            this.checkTLSAndSaveNotifIfFail(
              domain,
              config.certificate?.reminder ?? 30,
              probe,
              config?.notifications
            )

            // schedule TLS checker every day at 00:00
            const scheduledTlsCheckTask = cron.schedule('0 0 * * *', () => {
              log.info(`Running TLS check for ${domain} every day at 00:00`)

              this.checkTLSAndSaveNotifIfFail(
                domain,
                config.certificate?.reminder ?? 30,
                probe,
                config?.notifications
              )
            })

            scheduledTasks.push(scheduledTlsCheckTask)
          })
        }

        // schedule status update notification
        if (
          process.env.NODE_ENV !== 'test' &&
          flags['status-notification'] !== 'false'
        ) {
          // defaults to 6 AM
          // default value is not defined in flag configuration,
          // because the value can also come from config file
          const schedule =
            flags['status-notification'] ||
            config['status-notification'] ||
            '0 6 * * *'

          const scheduledStatusUpdateTask = cron.schedule(schedule, () => {
            this.getSummaryAndSendNotif(config)
          })

          scheduledTasks.push(scheduledStatusUpdateTask)
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
              startupMessage += `    URL: ${item.data.url}\n`
              break
            case 'slack':
              startupMessage += `    URL: ${item.data.url}\n`
              break
          }
        })
      }
    }

    return startupMessage
  }

  async checkTLSAndSaveNotifIfFail(
    domain: string,
    reminder: number,
    probe: Probe,
    notifications?: Notification[]
  ) {
    try {
      await checkTLS(domain, reminder)
    } catch (error) {
      log.error(error.message)

      if (notifications && notifications?.length > 0) {
        notifications.map(async (notification: Notification) => {
          saveNotificationLog(
            probe,
            notification,
            'NOTIFY-TLS',
            error.message
          ).catch((err) => log.error(err.message))

          // TODO: invoke sendNotifications function instead
          // looks like the sendAlerts function does not handle this
          sendAlerts({
            url: domain,
            probeState: 'invalid',
            notifications: notifications ?? [],
            validation: {
              alert: { query: '', message: '' },
              hasSomethingToReport: true,
              response: {
                status: 500,
                config: {
                  extraData: {
                    responseTime: 0,
                  },
                },
                headers: {},
              } as AxiosResponseWithExtraData,
            },
          }).catch((err) => log.error(err.message))
        })
      }
    }
  }

  async getSummaryAndSendNotif(config: Config) {
    const { notifications } = config
    const summary = await getSummary()
    if (!notifications) return

    await sendNotifications(notifications, {
      subject: `Monika Status`,
      body: `Status Update ${format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX')}
            Host: ${hostname()} (${[publicIpAddress, getIp()]
        .filter(Boolean)
        .join('/')})
            Number of probes: ${summary.numberOfProbes}
            Average response time: ${
              summary.averageResponseTime
            } ms in the last 24 hours
            Incidents: ${summary.numberOfIncidents} in the last 24 hours
            Recoveries: ${summary.numberOfRecoveries} in the last 24 hours
            Notifications: ${summary.numberOfSentNotifications}`,
      summary: `There are ${summary.numberOfIncidents} incidents and ${summary.numberOfRecoveries} recoveries in the last 24 hours.`,
      meta: {
        type: 'status-update' as const,
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
        hostname: hostname(),
        privateIpAddress: getIp(),
        publicIpAddress,
        ...summary,
      },
    })
  }
}

// Subscribe to Sanitize Config
em.addListener(CONFIG_SANITIZED, function () {
  // TODO: Add function here
})

em.addListener(PROBE_LOGS_BUILT, async (mLog: LogObject) => {
  printProbeLog(mLog)
})

// EVENT EMITTER - PROBE_RESPONSE_RECEIVED
interface ProbeResponseReceived {
  probe: Probe
  requestIndex: number
  response: AxiosResponseWithExtraData
}

// 1. PROBE_RESPONSE_READY - probing done, validate response
em.on(PROBE_RESPONSE_RECEIVED, function (data: ProbeResponseReceived) {
  const res = validateResponse(data.probe.alerts, data.response)

  // 2. responses processed, and validated
  em.emit(PROBE_RESPONSE_VALIDATED, res)
})

// TODO: move this to interface file?
interface ProbeStatusProcessed {
  probe: Probe
  statuses?: ProbeStateDetails[]
  notifications?: Notification[]
  validatedResponseStatuses: ValidateResponse[]
  totalRequests: number
}

// TODO: move this to interface file?
interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  probeState?: ProbeStateDetails
}

// TODO: move this to interface file?
interface ProbeSaveLogToDatabase
  extends Omit<
    ProbeStatusProcessed,
    'statuses' | 'totalRequests' | 'validatedResponseStatuses'
  > {
  index: number
  probeState?: ProbeStateDetails
}

const probeSendNotification = async (data: ProbeSendNotification) => {
  const {
    index,
    probe,
    probeState,
    notifications,
    totalRequests,
    validatedResponseStatuses,
  } = data

  const statusString = probeState?.isDown ? 'DOWN' : 'UP'
  const url = probe.requests[totalRequests - 1].url ?? ''

  if ((notifications?.length ?? 0) > 0) {
    await sendAlerts({
      url: url,
      probeState: statusString,
      notifications: notifications ?? [],
      validation:
        validatedResponseStatuses.find(
          (validateResponse: ValidateResponse) =>
            validateResponse.alert.query === probeState?.alertQuery
        ) || validatedResponseStatuses[index],
    })
  }
}

const createNotificationLog = (
  data: ProbeSaveLogToDatabase,
  mLog: LogObject
): LogObject => {
  const { index, probe, probeState, notifications } = data

  const type =
    probeState?.probeState === 'UP_TRUE_EQUALS_THRESHOLD'
      ? 'NOTIFY-INCIDENT'
      : 'NOTIFY-RECOVER'

  if ((notifications?.length ?? 0) > 0) {
    Promise.all(
      notifications?.map((notification) => {
        const alert = probe.alerts[index]

        mLog = setNotificationLog(
          {
            type,
            probe,
            alert,
            notification,
          },
          mLog
        )
      })!
    )
  }
  return mLog
}

// 3. Probes Thresholds processed, Send out notifications/alerts.
em.on(
  PROBE_ALERTS_READY,
  async (data: ProbeStatusProcessed, mLog: LogObject) => {
    const {
      probe,
      statuses,
      notifications,
      totalRequests,
      validatedResponseStatuses,
    } = data

    statuses
      ?.filter((probeState) => probeState.shouldSendNotification)
      ?.forEach((probeState, index) => {
        probeSendNotification({
          index,
          probe,
          probeState,
          notifications,
          totalRequests,
          validatedResponseStatuses,
        }).catch((error: Error) => log.error(error.message))

        mLog = createNotificationLog(
          {
            index,
            probe,
            probeState,
            notifications,
          },
          mLog
        )
        em.emit(PROBE_LOGS_BUILT, mLog)
        getLogsAndReport()
      })
  }
)

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

  if (process.env.NODE_ENV !== 'test') {
    const message = await getMessageForTerminate(hostname(), getIp())
    await sendNotifications(getConfig().notifications ?? [], message)
  }

  process.exit(process.exitCode)
})

export = Monika
