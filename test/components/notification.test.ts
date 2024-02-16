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
import { sendAlerts } from '../../src/components/notification.js'
import { channels } from '@hyperjumptech/monika-notification'
import type { NotificationMessage } from '@hyperjumptech/monika-notification'
import { probeRequestResult } from '../../src/interfaces/request.js'

const { discord, mailgun, slack, smtp, telegram, webhook, whatsapp, lark } =
  channels

chai.use(spies)

describe('send alerts', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  it('should send UP alert', async () => {
    chai.spy.on(mailgun, 'send', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: false,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
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
      probeState: 'UP',
    })
    expect(mailgun.send).to.have.been.called.exactly(1)
  })

  it('should send DOWN alert', async () => {
    chai.spy.on(mailgun, 'send', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
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
    expect(mailgun.send).to.have.been.called.exactly(1)
  })

  it('should send mailgun notification', async () => {
    chai.spy.on(mailgun, 'send', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
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
    expect(mailgun.send).to.have.been.called.exactly(1)
  })

  it('should send mailgun notification without username', async () => {
    chai.spy.on(mailgun, 'send', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
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
    expect(mailgun.send).to.have.been.called.exactly(1)
  })

  it('should send webhook & slack notifications', async () => {
    chai.spy.on(webhook, 'send', () => Promise.resolve())
    chai.spy.on(slack, 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'webhook',
          data: {
            url: 'xx',
          },
        },
        {
          id: 'one',
          type: 'slack',
          data: {
            url: 'xx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(webhook.send).to.have.been.called.exactly(1)
    expect(slack.send).to.have.been.called.exactly(1)
  })

  it('should send SMTP notification', async () => {
    chai.spy.on(smtp, 'send', () => Promise.resolve())
    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
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
    expect(smtp.send).to.have.been.called.exactly(1)
  })

  it('should send whatsapp notifications', async () => {
    chai.spy.on(whatsapp, 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
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
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(whatsapp.send).to.have.been.called.exactly(1)
  })

  it('should send whatsapp notifications', async () => {
    chai.spy.on(whatsapp, 'loginUser', () => Promise.resolve('token'))
    chai.spy.on(whatsapp, 'send', () => Promise.resolve())

    await whatsapp.send(
      {
        recipients: ['6254583425894'],
        url: 'https://somewhere.com',
        username: 'someusername',
        password: 'somepassword',
      },
      { body: 'some alert message' } as NotificationMessage
    )

    expect(whatsapp.send).to.have.been.called.exactly(1)
  })

  it('should send telegram notifications', async () => {
    chai.spy.on(telegram, 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'telegram',
          data: {
            // eslint-disable-next-line camelcase
            group_id: '123',
            // eslint-disable-next-line camelcase
            bot_token: '123',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(telegram.send).to.have.been.called.exactly(1)
  })

  it('should send webhook discord', async () => {
    chai.spy.on(discord, 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'discord',
          data: {
            url: 'xx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(discord.send).to.have.been.called.exactly(1)
  })

  it('should send webhook monika-notif', async () => {
    chai.spy.on(channels['monika-notif'], 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'monika-notif',
          data: {
            url: 'xx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(channels['monika-notif'].send).to.have.been.called.exactly(1)
  })

  it('should send larksuite notification ', async () => {
    chai.spy.on(lark, 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
        },
      },
      notifications: [
        {
          id: 'one',
          type: 'lark',
          data: {
            url: 'xx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(lark.send).to.have.been.called.exactly(1)
  })

  it('should send google chat notification ', async () => {
    chai.spy.on(channels['google-chat'], 'send', () => Promise.resolve())

    await sendAlerts({
      probeID: 'c0ff807f-b326-49b7-9b47-7d15f07a90a0',
      validation: {
        alert: { id: 'fKBzx', assertion: 'status-not-2xx', message: '' },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          status: 500,
          responseTime: 0,
          headers: {},
          result: probeRequestResult.success,
        },
      },
      notifications: [
        {
          id: 'googlechat-test',
          type: 'google-chat',
          data: {
            url: 'xx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
      probeState: 'DOWN',
    })

    expect(channels['google-chat'].send).to.have.been.called.exactly(1)
  })
})
