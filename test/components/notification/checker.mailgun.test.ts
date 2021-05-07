import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { MailgunData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - mailgunNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'mailgun',
    type: 'mailgun',
  } as Notification

  it('should handle validation error - without apiKey', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            domain: 'mailgun.com',
          } as MailgunData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Mailgun API Key" is required'
      const { message } = errorMessage('Mailgun', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without domain', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            apiKey: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          } as MailgunData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Mailgun Domain" is required'
      const { message } = errorMessage('Mailgun', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
