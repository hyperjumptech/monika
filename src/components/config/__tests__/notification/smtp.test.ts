import chai, { expect } from 'chai'
import spies from 'chai-spies'

import * as smtp from '../../../notification/channel/smtp'
import {
  errorMessage,
  validateNotification,
} from '../../validation/validator/notification'

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
      const originalErrorMessage = '"SMTP Hostname" is not allowed to be empty'
      const { message } = errorMessage('SMTP', originalErrorMessage)

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
      const originalErrorMessage = '"SMTP Port" is not allowed to be empty'
      const { message } = errorMessage('SMTP', originalErrorMessage)

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
      const originalErrorMessage = '"SMTP Port" must be a valid port'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without username', async () => {
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
      const originalErrorMessage = '"SMTP Username" is not allowed to be empty'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without password', async () => {
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
      const originalErrorMessage = '"SMTP Password" is not allowed to be empty'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
