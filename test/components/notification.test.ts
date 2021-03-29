import chai, { expect } from 'chai'
import {
  MailgunData,
  WebhookData,
  WhatsappData,
} from '../../src/interfaces/data'
import * as mailgun from '../../src/components/notification/channel/mailgun'
import * as webhook from '../../src/components/notification/channel/webhook'
import * as slack from '../../src/components/notification/channel/slack'
import * as smtp from '../../src/components/notification/channel/smtp'
import * as whatsapp from '../../src/components/notification/channel/whatsapp'
import { sendAlerts } from '../../src/components/notification'

describe('send alerts', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  it('should send UP alert', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: false,
      },
      notifications: [
        {
          id: 'one',
          type: 'mailgun',
          data: {
            recipients: ['xx@xx'],
            apiKey: 'xx',
            domain: 'xxx',
          } as MailgunData,
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'UP',
      incidentThreshold: 3,
    })
    expect(sent).to.have.length(1)
  })

  it('should send DOWN alert', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: 'one',
          type: 'mailgun',
          data: {
            recipients: ['xx@xx'],
            apiKey: 'xx',
            domain: 'xxx',
          } as MailgunData,
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })
    expect(sent).to.have.length(1)
  })

  it('should send mailgun notification', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: 'one',
          type: 'mailgun',
          data: {
            recipients: ['xx@xx'],
            apiKey: 'xx',
            domain: 'xxx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })
    expect(mailgun.sendMailgun).to.have.been.called()
    expect(sent).to.have.length(1)
  })

  it('should send webhook & slack notifications', async () => {
    chai.spy.on(webhook, 'sendWebhook', () => Promise.resolve())
    chai.spy.on(slack, 'sendSlack', () => Promise.resolve())

    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: 'one',
          type: 'webhook',
          data: {
            url: 'xx',
          } as WebhookData,
        },
        {
          id: 'one',
          type: 'slack',
          data: {
            url: 'xx',
          } as WebhookData,
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })

    expect(webhook.sendWebhook).to.have.been.called()
    expect(slack.sendSlack).to.have.been.called()
    expect(sent).to.have.length(2)
  })

  it('should send SMTP notification', async () => {
    chai.spy.on(smtp, 'sendSmtpMail', () => Promise.resolve())
    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: 'one',
          type: 'smtp',
          data: {
            recipients: ['xx@xx'],
            hostname: 'xx',
            port: 100,
            username: 'xxx',
            password: 'xxxx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })
    expect(smtp.sendSmtpMail).to.have.been.called()
    expect(sent).to.have.length(1)
  })

  it('should send whatsapp notifications', async () => {
    chai.spy.on(whatsapp, 'sendWhatsapp', () => Promise.resolve())

    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: '1',
          type: 'whatsapp',
          data: {
            recipients: ['0348959382457'],
            url: 'xx',
            username: 'someusername',
            password: 'somepassword',
          } as WhatsappData,
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })

    expect(whatsapp.sendWhatsapp).to.have.been.called()
    expect(sent).to.have.length(1)
  })

  it('should send whatsapp notifications', async () => {
    chai.spy.on(whatsapp, 'loginUser', () => Promise.resolve('token'))
    chai.spy.on(whatsapp, 'sendTextMessage', () => Promise.resolve())

    await whatsapp.sendWhatsapp(
      {
        recipients: ['6254583425894'],
        url: 'https://somewhere.com',
        username: 'someusername',
        password: 'somepassword',
      },
      'some alert message'
    )

    expect(whatsapp.loginUser).to.have.been.called()
    expect(whatsapp.sendTextMessage).to.have.been.called()
  })
})
