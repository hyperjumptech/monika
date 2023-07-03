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
import path from 'path'
import chai from 'chai'
import spies from 'chai-spies'
import cmd from '../src'
import sinon from 'sinon'
import * as IpUtil from '../src/utils/public-ip'

const { resolve } = path

chai.use(spies)

describe('monika', () => {
  let getPublicIPStub: any
  let getPublicNetworkInfoStub: any
  beforeEach(() => {
    getPublicIPStub = sinon.stub(IpUtil, 'getPublicIp' as never)
    getPublicNetworkInfoStub = sinon.stub(
      IpUtil,
      'getPublicNetworkInfo' as never
    )
  })
  afterEach(() => {
    getPublicIPStub.restore()
    getPublicNetworkInfoStub.restore()
  })

  test
    .stderr()
    .do(() => cmd.run(['--config', 'https://example.com/monika.yaml']))
    .catch((error) => {
      expect(error.message).to.contain(
        'The configuration file in https://example.com/monika.yaml is unreachable.'
      )
    })
    .it('detects invalid remote config')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        'https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml',
      ])
    )
    .it('detects valid remote config', (ctx) => {
      expect(ctx.stdout).to.contain(
        'Starting Monika. Probes: 1. Notifications: 0'
      )
    })

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/invalidNotificationType.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Notifications type is not allowed')
    })
    .it('runs with config with invalid notification type')

  // Probes Test`
  test
    .stderr()
    .do(() =>
      cmd.run([
        '--verbose',
        '--config',
        resolve('./test/testConfigs/probes/noProbes.yml'),
      ])
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
        resolve('./test/testConfigs/probes/noProbeName.yml'),
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
        resolve('./test/testConfigs/probes/noProbeRequest.yml'),
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
        resolve('./test/testConfigs/probes/noProbeAlerts.yml'),
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
        resolve('./test/testConfigs/probes/invalidProbeRequestMethod.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probe request method is invalid! Valid methods are GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, PURGE, LINK, and UNLINK'
      )
    })
    .it('runs with config with invalid probe request method')

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/invalidProbeRequestURL.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probe request URL (something/something) should start with http:// or https://'
      )
    })
    .it('runs with config with invalid probe request URL')

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/invalidProbeRequestAlert.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Probe alert format is invalid!')
    })
    .it('runs with config with invalid probe request alert')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/stringProbeRequestAlert.yml'),
      ])
    )
    .it(
      'runs with config with probe request alert in defined strings',
      (ctx) => {
        expect(ctx.stdout).to.contain('Starting Monika.')
      }
    )

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/objectProbeRequestAlert.yml'),
      ])
    )
    .it(
      'runs with config with probe request alert in object format with flexible query',
      (ctx) => {
        expect(ctx.stdout).to.contain('Starting Monika.')
      }
    )

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/multipleProbeRequests.yml'),
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
        resolve('./test/testConfigs/probes/chainingRequests.yml'),
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
        resolve('./test/testConfigs/mailgun/mailgunconfig.yml'),
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
        resolve('./test/testConfigs/mailgun/mailgunconfigNoRecipients.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('"Mailgun Recipients" is required')
    })
    .it('runs with mailgun config but without recipients')

  // Sendgrid Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/sendgrid/sendgridconfig.yml'),
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
        resolve('./test/testConfigs/sendgrid/sendgridconfigNoRecipients.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('"SendGrid recipients" is required')
    })
    .it('runs with sendgrid config but without recipients')

  // SMTP Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/smtp/smtpconfig.yml'),
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
        resolve('./test/testConfigs/smtp/smtpconfigNoRecipients.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('"Email Recipients" is required')
    })
    .it('runs with SMTP config but without recipients')

  // Webhook Tests
  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/webhook/webhookconfig.yml'),
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
        resolve('./test/testConfigs/discord/discordconfig.yml'),
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
        resolve('./test/testConfigs/teams/teamsconfig.yml'),
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
        resolve('./test/testConfigs/teams/teamsconfigNoURL.yml'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('"Teams URL" is required')
    })
    .it('runs with teams config but without webhook url')

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/monika-notif/monikaNotifconfig.yml'),
        '--verbose',
      ])
    )
    .it('runs with Monika-Notif config', (ctx) => {
      expect(ctx.stdout).to.contain('URL:')
    })

  // Test positively valid configuration on the bottom
  // If we place these at the top, somehow the "probes" are still dangling, causes other tests fail
  test
    .stdout()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/fullConfig.yml')])
    )
    .it('runs with full config', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/simple-1p-1n.yaml'),
        resolve('./test/testConfigs/simple-1p-2n.yaml'),
      ])
    )
    .it('runs multiple config override', (ctx) => {
      expect(ctx.stdout).to.contain('Probes: 1.')
      expect(ctx.stdout).to.contain('Notifications: 2')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '-c',
        resolve('./test/testConfigs/manyNotif.yml'),
        resolve('./test/testConfigs/simple-1p-1n.yaml'),
      ])
    )
    .it(
      'run with multiple config override: no probes on the second config',
      (ctx) => {
        expect(ctx.stdout)
          .to.contain('Notifications: 1')
          .and.contain('Probes: 1')
      }
    )

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/fullConfig.yml'),
        resolve('./test/testConfigs/manyNotif.yml'),
      ])
    )
    .it('runs multiple config override', (ctx) => {
      expect(ctx.stdout).to.contain('Probes: 1.')
      expect(ctx.stdout).to.contain('Notifications: 2')
    })

  test
    .stdout()
    .do(() => cmd.run(['--har', resolve('./test/testConfigs/harTest.har')]))
    .it('runs with har file config', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--insomnia',
        resolve('./src/components/config/__tests__/petstore.insomnia.yaml'),
      ])
    )
    .it('runs with insomnia file config', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--postman',
        resolve('./test/testConfigs/simple.postman_collection.json'),
      ])
    )
    .it('runs with postman file', (ctx) => {
      expect(ctx.stdout).to.contain('Starting Monika.')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '-c',
        resolve('./test/testConfigs/manyNotif.yml'),
        resolve('./test/testConfigs/manyProbes.yml'),
        '--har',
        resolve('./test/testConfigs/harTest.har'),
      ])
    )
    .it('merge har file with other config', (ctx) => {
      expect(ctx.stdout).to.contain('Notifications: 2').and.contain('Probes: 2')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--har',
        resolve('./test/testConfigs/harTest.har'),
        '-c',
        resolve('./test/testConfigs/manyNotif.yml'),
        resolve('./test/testConfigs/manyProbes.yml'),
      ])
    )
    .it('probes from har file will override regardless flag order', (ctx) => {
      expect(ctx.stdout).to.contain('Notifications: 2').and.contain('Probes: 2')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '-c',
        resolve('./test/testConfigs/manyNotif.yml'),
        resolve('./test/testConfigs/manyProbes.yml'),
        '--postman',
        resolve('./test/testConfigs/simple.postman_collection.json'),
      ])
    )
    .it('merge postman file with other config', (ctx) => {
      expect(ctx.stdout).to.contain('Notifications: 2').and.contain('Probes: 2')
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--postman',
        resolve('./test/testConfigs/simple.postman_collection.json'),
        '-c',
        resolve('./test/testConfigs/manyNotif.yml'),
        resolve('./test/testConfigs/manyProbes.yml'),
      ])
    )
    .it(
      'probes from postman file will override regardless flag order',
      (ctx) => {
        expect(ctx.stdout)
          .to.contain('Notifications: 2')
          .and.contain('Probes: 2')
      }
    )
})
