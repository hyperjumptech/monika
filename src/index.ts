import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import { Config } from './interfaces/config'
import {
  MailData,
  MailgunData,
  SendgridData,
  SMTPData,
  WebhookData,
} from './interfaces/data'
import { Validation } from './interfaces/validation'
import { looper } from './utils/looper'
import { parseConfig } from './utils/parse-config'
import { validateConfig } from './utils/validate-config'
import { printAllLogs } from './utils/logger'

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
    }),

    logs: flags.boolean({
      char: 'l', // l shorthand for logs
      description: 'print all logs.',
    }),

    flush: flags.boolean({
      description: 'flush logs',
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
        this.log('Records flushed, thank you.')
      } else {
        this.log('Cancelled. Thank you.')
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
      // If config is valid, print the configuration
      this.log('Parsed configuration\n====================')
      this.log(`Notifications: `)
      config.notifications.forEach((item) => {
        this.log(`Notification ID: ${item.id}`)
        this.log(`Notification Type: ${item.type}`)
        // Only show recipients if type is mailgun, smtp, or sendgrid
        if (['mailgun', 'smtp', 'sendgrid'].indexOf(item.type) >= 0) {
          this.log(
            `Notification Recipients: ${(item.data as MailData).recipients.toString()}\n`
          )
        }
        this.log(`Notifications Details:`)
        switch (item.type) {
          case 'smtp':
            this.log(`Hostname: ${(item.data as SMTPData).hostname}`)
            this.log(`Port: ${(item.data as SMTPData).port}`)
            this.log(`Username: ${(item.data as SMTPData).username}`)
            this.log(`Password: ${(item.data as SMTPData).password}`)
            break
          case 'mailgun':
            this.log(`API key: ${(item.data as MailgunData).apiKey}`)
            this.log(`Domain: ${(item.data as MailgunData).domain}`)
            break
          case 'sendgrid':
            this.log(`API key: ${(item.data as SendgridData).apiKey}`)
            break
          case 'webhook':
            this.log(`URL: ${(item.data as WebhookData).url}`)
            break
          case 'slack':
            this.log(`URL: ${(item.data as WebhookData).url}`)
            break
        }
      })
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
