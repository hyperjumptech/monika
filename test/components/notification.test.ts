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
import {
  MailgunData,
  TelegramData,
  WebhookData,
  WhatsappData,
  DiscordData,
} from '../../src/interfaces/data'
import * as mailgun from '../../src/components/notification/channel/mailgun'
import * as webhook from '../../src/components/notification/channel/webhook'
import * as slack from '../../src/components/notification/channel/slack'
import * as smtp from '../../src/components/notification/channel/smtp'
import * as whatsapp from '../../src/components/notification/channel/whatsapp'
import * as telegram from '../../src/components/notification/channel/telegram'
import * as discord from '../../src/components/notification/channel/discord'
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

  it('should send telegram notifications', async () => {
    chai.spy.on(telegram, 'sendTelegram', () => Promise.resolve())

    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: 'one',
          type: 'telegram',
          data: {
            group_id: '123',
            bot_token: '123',
            body: {
              url: 'https://hyperjump.tech',
            },
          } as TelegramData,
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })

    expect(telegram.sendTelegram).to.have.been.called()
    expect(sent).to.have.length(1)
  })

  it('should send webhook discord', async () => {
    chai.spy.on(discord, 'sendDiscordWebhook', () => Promise.resolve())

    const sent = await sendAlerts({
      validation: {
        alert: 'status-not-2xx',
        status: true,
      },
      notifications: [
        {
          id: 'one',
          type: 'discordWebhook',
          data: {
            url: 'xx',
          } as DiscordData,
        },
      ],
      url: 'https://hyperjump.tech',
      status: 'DOWN',
      incidentThreshold: 3,
    })

    expect(discord.sendDiscordWebhook).to.have.been.called()
    expect(sent).to.have.length(1)
  })
})
