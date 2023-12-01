import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { validateNotification } from '../../validator/notification'

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
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error: unknown) {
      const message = '"Mailgun API Key" is not allowed to be empty'

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
            recipients: ['name@example.com'],
          },
        },
      ])
    } catch (error: unknown) {
      const message = '"Mailgun Domain" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
