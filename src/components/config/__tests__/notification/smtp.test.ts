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
      const message = '"SMTP Username" is not allowed to be empty'

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
      const message = '"SMTP Password" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
