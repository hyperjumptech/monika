import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { SlackData } from '../../../src/interfaces/data'

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
      await notificationChecker([
        {
          ...notificationConfig,
          data: {} as SlackData,
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
          } as SlackData,
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
