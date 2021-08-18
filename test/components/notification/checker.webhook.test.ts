import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { WebhookData } from '../../../src/interfaces/data'

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
      await notificationChecker([
        {
          ...notificationConfig,
          data: {} as WebhookData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Webhook URL" is required'
      const { message } = errorMessage('Webhook', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - invalid URL', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            url: 'example',
          } as WebhookData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Webhook URL" must be a valid uri'
      const { message } = errorMessage('Webhook', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
