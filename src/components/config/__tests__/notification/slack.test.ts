import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  validateNotification,
} from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - slackNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'slack',
    type: 'slack' as const,
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
      const originalErrorMessage = '"Slack URL" is not allowed to be empty'
      const { message } = errorMessage('Slack', originalErrorMessage)

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
      const originalErrorMessage = '"Slack URL" must be a valid uri'
      const { message } = errorMessage('Slack', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
