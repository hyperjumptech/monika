import chai, { expect } from 'chai'
import spies from 'chai-spies'
import {
  MailgunData,
  WebhookData,
  WhatsappData,
} from '../../src/interfaces/data'
import { AxiosResponseWithExtraData } from '../../src/interfaces/request'

chai.use(spies)

import {
  parseAlertStringTime,
  responseTimeGreaterThan,
  sendAlerts,
  statusNot2xx,
  validateResponse,
} from '../../src/utils/alert'
import * as mailgun from '../../src/utils/notifications/mailgun'
import * as webhook from '../../src/utils/notifications/webhook'
import * as slack from '../../src/utils/notifications/slack'
import * as smtp from '../../src/utils/notifications/smtp'
import * as whatsapp from '../../src/utils/whatsapp'
import * as notifier from 'node-notifier'
import NotificationCenter from 'node-notifier/notifiers/notificationcenter'

describe('check response status', () => {
  it('should trigger alert when response is within 4xx status', () => {
    const status400Alert = statusNot2xx({
      status: 400,
    } as AxiosResponseWithExtraData)
    expect(status400Alert).to.be.true
    const status401Alert = statusNot2xx({
      status: 401,
    } as AxiosResponseWithExtraData)
    expect(status401Alert).to.be.true
    const status403Alert = statusNot2xx({
      status: 403,
    } as AxiosResponseWithExtraData)
    expect(status403Alert).to.be.true
    const status404Alert = statusNot2xx({
      status: 404,
    } as AxiosResponseWithExtraData)
    expect(status404Alert).to.be.true
    const status405Alert = statusNot2xx({
      status: 405,
    } as AxiosResponseWithExtraData)
    expect(status405Alert).to.be.true
  })
  it('should trigger alert when response is within 5xx status', () => {
    const status500Alert = statusNot2xx({
      status: 500,
    } as AxiosResponseWithExtraData)
    expect(status500Alert).to.be.true
    const status501Alert = statusNot2xx({
      status: 501,
    } as AxiosResponseWithExtraData)
    expect(status501Alert).to.be.true
    const status502Alert = statusNot2xx({
      status: 502,
    } as AxiosResponseWithExtraData)
    expect(status502Alert).to.be.true
    const status503Alert = statusNot2xx({
      status: 503,
    } as AxiosResponseWithExtraData)
    expect(status503Alert).to.be.true
  })
  it('should not trigger alert when response is within 2xx status', () => {
    const status200Alert = statusNot2xx({
      status: 200,
    } as AxiosResponseWithExtraData)
    expect(status200Alert).to.be.false
    const status201Alert = statusNot2xx({
      status: 201,
    } as AxiosResponseWithExtraData)
    expect(status201Alert).to.be.false
    const status202Alert = statusNot2xx({
      status: 202,
    } as AxiosResponseWithExtraData)
    expect(status202Alert).to.be.false
    const status204Alert = statusNot2xx({
      status: 204,
    } as AxiosResponseWithExtraData)
    expect(status204Alert).to.be.false
  })
})

describe('parse alert string and get time in milliseconds', () => {
  it('should throw error when no number found', () => {
    expect(
      parseAlertStringTime.bind(null, 'response-time-greater-than-now')
    ).to.throw()
  })
  it('should throw error when pattern is invalid', () => {
    expect(
      parseAlertStringTime.bind(null, 'response-time-greater-than-200s')
    ).to.throw()
  })
  it('should parse string `response-time-greater-than-2-s`', () => {
    const time = parseAlertStringTime('response-time-greater-than-2-s')
    expect(time).to.equals(2000)
  })
  it('should parse string `response-time-greater-than-300-ms`', () => {
    const time = parseAlertStringTime('response-time-greater-than-300-ms')
    expect(time).to.equals(300)
  })
})

describe('check time to response', () => {
  it('should trigger alert when response time is greater than specified value', () => {
    const alert = responseTimeGreaterThan(200)({
      data: '',
      status: 200,
      statusText: 'OK',
      headers: '',
      config: {
        extraData: {
          requestStartedAt: 1,
          responseTime: 300,
        },
      },
    } as AxiosResponseWithExtraData)

    expect(alert).to.be.true
  })
  it('should not trigger alert when response time equals to specified value', () => {
    const alert = responseTimeGreaterThan(200)({
      data: '',
      status: 200,
      statusText: 'OK',
      headers: '',
      config: {
        extraData: {
          requestStartedAt: 1,
          responseTime: 200,
        },
      },
    } as AxiosResponseWithExtraData)
    expect(alert).to.be.false
  })
  it('should not trigger alert when response is less than to specified value', () => {
    const alert = responseTimeGreaterThan(200)({
      data: '',
      status: 200,
      statusText: 'OK',
      headers: '',
      config: {
        extraData: {
          requestStartedAt: 1,
          responseTime: 100,
        },
      },
    } as AxiosResponseWithExtraData)
    expect(alert).to.be.false
  })
})

describe('check response against list of alerts', () => {
  it('should ignore unknown alert string', () => {
    const alerts = validateResponse(['unknown'], {
      data: '',
      status: 200,
      statusText: 'OK',
      headers: '',
      config: {
        extraData: {
          requestStartedAt: 1,
          responseTime: 300,
        },
      },
    } as AxiosResponseWithExtraData)
    expect(alerts).to.have.length(0)
  })
  it('should recognize known alert strings', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200-ms'],
      {
        data: '',
        status: 200,
        statusText: 'OK',
        headers: '',
        config: {
          extraData: {
            requestStartedAt: 1,
            responseTime: 300,
          },
        },
      } as AxiosResponseWithExtraData
    )
    expect(alerts).to.have.length(2)
  })
  it('should not trigger any alert when no alert condition is true', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200-ms'],
      {
        data: '',
        status: 200,
        statusText: 'OK',
        headers: '',
        config: {
          extraData: {
            requestStartedAt: 1,
            responseTime: 100,
          },
        },
      } as AxiosResponseWithExtraData
    ).filter(({ status }) => status === true)
    expect(alerts).to.have.length(0)
  })
  it('should trigger one alert when one alert condition is true', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200-ms'],
      {
        data: '',
        status: 200,
        statusText: 'OK',
        headers: '',
        config: {
          extraData: {
            requestStartedAt: 1,
            responseTime: 500,
          },
        },
      } as AxiosResponseWithExtraData
    ).filter(({ status }) => status === true)
    expect(alerts).to.have.length(1)
  })
  it('should trigger more than one alert when more than one alert condition is true', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200-ms'],
      {
        data: '',
        status: 500,
        statusText: 'OK',
        headers: '',
        config: {
          extraData: {
            requestStartedAt: 1,
            responseTime: 900,
          },
        },
      } as AxiosResponseWithExtraData
    ).filter(({ status }) => status === true)
    expect(alerts).to.have.length(2)
  })
})

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
    })

    expect(whatsapp.sendWhatsapp).to.have.been.called()
    expect(sent).to.have.length(1)
  })

  it('should send default notification', async () => {
    chai.spy.on(notifier, 'notify', () => Promise.resolve())

    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      url: 'https://hyperjump.tech',
      status: 'DOWN',
    })

    expect(notifier.notify).to.have.been.called()
    expect(sent).to.have.length(1)
  })
})
