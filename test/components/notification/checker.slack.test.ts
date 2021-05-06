import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { WebhookData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - slackNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'slack',
    type: 'slack',
  } as Notification

  it('should handle validation error - without URL', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {} as WebhookData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Slack URL" is required'
      const { message } = errorMessage('Slack', originalErrorMessage)

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
      const originalErrorMessage = '"Slack URL" must be a valid uri'
      const { message } = errorMessage('Slack', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
