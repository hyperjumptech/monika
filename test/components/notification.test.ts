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

import chai, { expect } from 'chai'
import spies from 'chai-spies'
import { sendAlerts } from '../../src/components/notification'
import * as discord from '../../src/components/notification/channel/discord'
import * as mailgun from '../../src/components/notification/channel/mailgun'
import * as monikaNotif from '../../src/components/notification/channel/monika-notif'
import * as slack from '../../src/components/notification/channel/slack'
import * as smtp from '../../src/components/notification/channel/smtp'
import * as telegram from '../../src/components/notification/channel/telegram'
import * as webhook from '../../src/components/notification/channel/webhook'
import * as whatsapp from '../../src/components/notification/channel/whatsapp'
import * as lark from '../../src/components/notification/channel/lark'
import * as googlechat from '../../src/components/notification/channel/googlechat'
import {
  MailgunData,
  MonikaNotifData,
  TelegramData,
  WebhookData,
  WhatsappData,
  LarkData,
  GoogleChatData,
} from '../../src/interfaces/data'

chai.use(spies)

describe('send alerts', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  it('should send UP alert', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: false,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
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
      probeState: 'UP',
    })
    expect(mailgun.sendMailgun).to.have.been.called.exactly(1)
  })

  it('should send DOWN alert', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
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
      probeState: 'DOWN',
    })
    expect(mailgun.sendMailgun).to.have.been.called.exactly(1)
  })

  it('should send mailgun notification', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'mailgun',
          data: {
            recipients: ['xx@xx'],
            apiKey: 'xx',
            domain: 'xxx',
            username: 'xxxx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })
    expect(mailgun.sendMailgun).to.have.been.called.exactly(1)
  })

  it('should send mailgun notification without username', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
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
      probeState: 'DOWN',
    })
    expect(mailgun.sendMailgun).to.have.been.called.exactly(1)
  })

  it('should send webhook & slack notifications', async () => {
    chai.spy.on(webhook, 'sendWebhook', () => Promise.resolve())
    chai.spy.on(slack, 'sendSlack', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
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
      probeState: 'DOWN',
    })

    expect(webhook.sendWebhook).to.have.been.called.exactly(1)
    expect(slack.sendSlack).to.have.been.called.exactly(1)
  })

  it('should send SMTP notification', async () => {
    chai.spy.on(smtp, 'sendSmtpMail', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'smtp',
          data: {
            recipients: ['example@example.com'],
            hostname: 'example',
            port: 100,
            username: 'example',
            password: 'example',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })
    expect(smtp.sendSmtpMail).to.have.been.called.exactly(1)
  })

  it('should send whatsapp notifications', async () => {
    chai.spy.on(whatsapp, 'sendWhatsapp', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
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
      probeState: 'DOWN',
    })

    expect(whatsapp.sendWhatsapp).to.have.been.called.exactly(1)
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
    expect(whatsapp.sendTextMessage).to.have.been.called.exactly(1)
  })

  it('should send telegram notifications', async () => {
    chai.spy.on(telegram, 'sendTelegram', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'telegram',
          data: {
            group_id: '123',
            bot_token: '123',
            body: `url: 'https://hyperjump.tech'`,
          } as TelegramData,
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(telegram.sendTelegram).to.have.been.called.exactly(1)
  })

  it('should send webhook discord', async () => {
    chai.spy.on(discord, 'sendDiscord', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'discord',
          data: {
            url: 'xx',
          } as WebhookData,
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(discord.sendDiscord).to.have.been.called.exactly(1)
  })

  it('should send webhook monika-notif', async () => {
    chai.spy.on(monikaNotif, 'sendMonikaNotif', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'monika-notif',
          data: {
            url: 'xx',
          } as MonikaNotifData,
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(monikaNotif.sendMonikaNotif).to.have.been.called.exactly(1)
  })

  it('should send larksuite notification ', async () => {
    chai.spy.on(lark, 'sendLark', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'lark',
          data: {
            url: 'xx',
          } as LarkData,
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(lark.sendLark).to.have.been.called.exactly(1)
  })

  it('should send google chat notification ', async () => {
    chai.spy.on(googlechat, 'sendGoogleChat', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { query: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          status: 500,
          responseTime: 0,
          headers: {},
        },
      },
      notifications: [
        {
          id: 'googlechat-test',
          type: 'google-chat',
          data: {
            url: 'xx',
          } as GoogleChatData,
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(googlechat.sendGoogleChat).to.have.been.called.exactly(1)
  })
})
