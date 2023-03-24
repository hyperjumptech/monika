import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { validateNotification } from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - sendgridNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'sendgrid',
    type: 'sendgrid' as const,
  }

  it('should handle validation error - without apiKey', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            apiKey: '',
            sender: 'name@example.com',
            recipients: ['john@example.com'],
          },
        },
      ])
    } catch (error) {
      const message = '"SendGrid API Key" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
