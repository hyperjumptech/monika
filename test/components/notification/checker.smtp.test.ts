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

  it('should handle success', async () => {
    chai.spy.on(smtp, 'createSmtpTransport', () => ({
      sendMail: () => true,
    }))

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
            port: 65_536, // valid port 0 - 65535
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
            recipients: ['recipient@example.com'],
          } as SMTPData,
        },
      ])
    } catch (error) {
      // note: the expected is success, but since smtp at port 1000 does not exit, error is connection error
      const originalErrorMessage = 'connect ECONNREFUSED 127.0.0.1:1000'
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
            recipients: ['recipient@example.com'],
          } as SMTPData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = 'connect ECONNREFUSED 127.0.0.1:1000'
      const { message } = errorMessage('SMTP', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
