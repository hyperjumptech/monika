/* eslint-disable no-console */
import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { Config } from './interfaces/config'
import { MailData, MailgunData, SMTPData, WebhookData } from './interfaces/data'
import { Validation } from './interfaces/validation'
import { looper } from './utils/looper'
import { parseConfig } from './utils/parse-config'
import { validateConfig } from './utils/validate-config'
import { printAllLogs } from './utils/logger'
import { log } from './utils/log'

import { closeLog, openLogfile, flushAllLogs } from './utils/history'

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

    // Read the config
    const file = flags.config
    const config: Config = await parseConfig(file)
    // Check if config is valid
    const isConfigValid: Validation = await validateConfig(config)
    if (isConfigValid.valid) {
      console.log(
        `Starting Monika. Probes: ${config.probes.length}. Notifications: ${config.notifications?.length}\n`
      )
      if (flags.verbose) {
        console.log('Probes:')
        config.probes.forEach(async (probe) => {
          console.log(`- Probe ID: ${probe.id}`)
          console.log(`    Name: ${probe.name}`)
          console.log(`    Description: ${probe.description}`)
          console.log(`    Interval: ${probe.interval}`)
          console.log(`    Request Method: ${probe.request.method}`)
          console.log(`    Request URL: ${probe.request.url}`)
          console.log(
            `    Request Headers: ${JSON.stringify(probe.request.headers)}`
          )
          console.log(`    Request Body: ${JSON.stringify(probe.request.body)}`)
          console.log(`    Alerts: ${probe.alerts.join(', ')}`)
        })
        console.log('')

        console.log(`Notifications:`)
        config.notifications?.forEach((item) => {
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
    } else {
      closeLog()
      // If config is invalid, throw error
      this.error(isConfigValid.message, { exit: 100 })
    }
  }
}
export = Monika
