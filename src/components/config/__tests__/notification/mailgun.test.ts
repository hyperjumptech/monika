import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  validateNotification,
} from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - mailgunNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'mailgun',
    type: 'mailgun' as const,
  }

  it('should handle validation error - without apiKey', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            apiKey: '',
            domain: 'mailgun.com',
            recipients: [],
          },
        },
      ])
    } catch (error) {
      const originalErrorMessage =
        '"Mailgun API Key" is not allowed to be empty'
      const { message } = errorMessage('Mailgun', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without domain', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            apiKey: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
            domain: '',
            recipients: [],
          },
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Mailgun Domain" is not allowed to be empty'
      const { message } = errorMessage('Mailgun', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
