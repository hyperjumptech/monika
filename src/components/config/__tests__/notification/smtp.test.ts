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

import * as smtp from '../../../notification/channel/smtp'
import { validateNotification } from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - smtpNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const smtpNotificationConfig = {
    id: 'smtp',
    type: 'smtp' as const,
  }
  const fn = () =>
    validateNotification([
      {
        ...smtpNotificationConfig,
        data: {
          hostname: 'localhost',
          port: 25,
          username: 'username',
          password: 'password',
          recipients: ['name@example.com'],
        },
      },
    ])

  it('should handle success', async () => {
    chai.spy.on(smtp, 'createSmtpTransport', () => ({
      sendMail: () => true,
    }))

    expect(fn).not.to.throws()
  })

  it('should handle validation error - without hostname', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: '',
            port: 25,
            username: 'username',
            password: 'password',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = '"SMTP Hostname" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without port', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 0,
            username: 'username',
            password: 'password',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = '"SMTP Port" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - invalid port', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 65_536, // valid port 0 - 65535
            username: 'username',
            password: 'password',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = '"SMTP Port" must be a valid port'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - with empty username', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 25,
            username: '',
            password: 'password',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = '"SMTP Username" is not allowed to be empty'
      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - with empty password', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 25,
            username: 'username',
            password: '',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = '"SMTP Password" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should accept smtp - without username', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 25,
            password: 'password',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = 'should pass without error'
      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should accept smtp - without password', async () => {
    try {
      await validateNotification([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 25,
            username: 'username',
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = 'should pass without error'
      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
