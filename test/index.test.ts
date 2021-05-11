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

import { expect, test } from '@oclif/test'
import { resolve } from 'path'
import chai from 'chai'
import spies from 'chai-spies'
import cmd from '../src'

chai.use(spies)

describe('monika', () => {
  // General Test
  test
    .stdout()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/fullConfig.json')])
    )
    .it('runs with full config', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stdout()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/noInterval.json')])
    )
    .it('runs with config without interval', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/invalidNotificationType.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Notifications type is not allowed')
    })
    .it('runs with config with invalid notification type')

  // Probes Test
  test
    .stderr()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/probes/noProbes.json')])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probes object does not exists or has length lower than 1!'
      )
    })
    .it('runs with config without probes')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/noProbeName.json'),
      ])
    )
    .it('runs with config without probe name', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/noProbeRequest.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probe requests does not exists or has length lower than 1!'
      )
    })
    .it('runs with config without probe request')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/noProbeAlerts.json'),
      ])
    )
    .it('runs with config without probe alerts', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/invalidProbeRequestMethod.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probe request method should be GET or POST only'
      )
    })
    .it('runs with config with invalid probe request method')

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/invalidProbeRequestURL.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probe request URL should start with http:// or https://'
      )
    })
    .it('runs with config with invalid probe request URL')

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/invalidProbeRequestAlert.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        "Probe alert should be 'status-not-2xx' or 'response-time-greater-than-<number>-(m)s"
      )
    })
    .it('runs with config with invalid probe request alert')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/multipleProbeRequests.json'),
      ])
    )
    .it('runs with multiple probe requests config', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/chainingRequests.json'),
      ])
    )
    .it('runs with chaining probe requests config', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  // Mailgun Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/mailgun/mailgunconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with mailgun config', (ctx) => {
      expect(ctx.stdout).to.contain('Type: mailgun')
      expect(ctx.stdout).to.contain('Domain:')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/mailgun/mailgunconfigNoRecipients.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Recipients does not exists or has length lower than 1!'
      )
    })
    .it('runs with mailgun config but without recipients')

  // Sendgrid Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/sendgrid/sendgridconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with sendgrid config', (ctx) => {
      expect(ctx.stdout).to.contain('Type: sendgrid')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/sendgrid/sendgridconfigNoRecipients.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Recipients does not exists or has length lower than 1!'
      )
    })
    .it('runs with sendgrid config but without recipients')

  // SMTP Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/smtp/smtpconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with SMTP config', (ctx) => {
      expect(ctx.stdout).to.contain('Type: smtp')
      expect(ctx.stdout).to.contain('Hostname:')
      expect(ctx.stdout).to.contain('Port:')
      expect(ctx.stdout).to.contain('Username:')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/smtp/smtpconfigNoRecipients.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Recipients does not exists or has length lower than 1!'
      )
    })
    .it('runs with SMTP config but without recipients')

  // Webhook Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/webhook/webhookconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with Webhook config', (ctx) => {
      expect(ctx.stdout).to.contain('URL:')
      expect(ctx.stdout).to.contain('Method:')
    })

  // Discord Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/discord/discordconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with Discord config', (ctx) => {
      expect(ctx.stdout).to.contain('URL:')
    })

  // Teams Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/teams/teamsconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with Teams config', (ctx) => {
      expect(ctx.stdout).to.contain('URL:')
      expect(ctx.stdout).to.contain('Method:')
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/teams/teamsconfigNoURL.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Teams Webhook URL not found')
    })
    .it('runs with teams config but without webhook url')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/monika-notif/monikaNotifconfig.json'),
        '--verbose',
      ])
    )
    .it('runs with Monika-Notif config', (ctx) => {
      expect(ctx.stdout).to.contain('URL:')
    })
})
