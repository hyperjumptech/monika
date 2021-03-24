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
    .do(() => cmd.run(['--config', resolve('./config.example.json')]))
    .it('runs with normal config', (ctx) => {
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
      cmd.run(['--config', resolve('./test/testConfigs/noNotifications.json')])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Notifications object does not exists or has length lower than 1!'
      )
    })
    .it('runs with config without notifications')

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
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/noProbeName.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Probe name should not be empty')
    })
    .it('runs with config without probe name')

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/noProbeRequest.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Probe request should not be empty')
    })
    .it('runs with config without probe request')

  test
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/noProbeAlerts.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Alerts does not exists or has length lower than 1!'
      )
    })
    .it('runs with config without probe alerts')

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
    .stderr()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/probes/duplicateProbeId.json'),
      ])
    )
    .catch((error) => {
      expect(error.message).to.contain('Probe should have unique id')
    })
    .it('runs with config with duplicate probe id')

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
})
