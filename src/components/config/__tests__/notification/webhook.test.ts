import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { validateNotification } from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - webhookNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'webhook',
    type: 'webhook' as const,
  }

  it('should handle validation error - without URL', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: { url: '' },
        },
      ])
    } catch (error) {
      const message = '"Webhook URL" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - invalid URL', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            url: 'example',
          },
        },
      ])
    } catch (error) {
      const message = '"Webhook URL" must be a valid uri'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
