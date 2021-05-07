import chai, { expect } from 'chai'
import spies from 'chai-spies'

import * as smtp from '../../../src/components/notification/channel/smtp'
import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { SMTPData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - smtpNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const smtpNotificationConfig = {
    id: 'smtp',
    type: 'smtp',
  } as Notification

  it('should handle success', async () => {
    chai.spy.on(smtp, 'createSmtpTransport', () => ({
      sendMail: () => true,
    }))

    const checker = await notificationChecker([
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

    expect(checker[0][0]).to.equal('success')
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
