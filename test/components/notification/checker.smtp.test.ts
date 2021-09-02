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

import * as smtp from '../../../src/components/notification/channel/smtp'
import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { SMTPData } from '../../../src/interfaces/data'

chai.use(spies)

describe('notificationChecker - smtpNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const smtpNotificationConfig = {
    id: 'smtp',
    type: 'smtp' as const,
  }

  it('should handle success', async () => {
    chai.spy.on(smtp, 'createSmtpTransport', () => ({
      sendMail: () => true,
    }))

    const fn = () =>
      notificationChecker([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'hostname',
            port: 1000,
            username: 'username',
            password: 'password',
          } as SMTPData,
        },
      ])

    expect(fn).not.to.throws()
  })

  it('should handle validation error - without hostname', async () => {
    try {
      await notificationChecker([
        {
          ...smtpNotificationConfig,
          data: {
            port: 1000,
            username: 'username',
            password: 'password',
          } as SMTPData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"SMTP Hostname" is required'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without port', async () => {
    try {
      await notificationChecker([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            username: 'username',
            password: 'password',
          } as SMTPData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"SMTP Port" is required'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - invalid port', async () => {
    try {
      await notificationChecker([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 65536, // valid port 0 - 65535
            username: 'username',
            password: 'password',
          } as SMTPData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"SMTP Port" must be a valid port'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without username', async () => {
    try {
      await notificationChecker([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 1000,
            password: 'password',
          } as SMTPData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"SMTP Username" is required'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without password', async () => {
    try {
      await notificationChecker([
        {
          ...smtpNotificationConfig,
          data: {
            hostname: 'localhost',
            port: 1000,
            username: 'username',
          } as SMTPData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"SMTP Password" is required'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
