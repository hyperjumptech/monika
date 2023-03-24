import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  validateNotification,
} from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - teamsNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'teams',
    type: 'teams' as const,
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
      const originalErrorMessage = '"Teams URL" is not allowed to be empty'
      const { message } = errorMessage('Teams', originalErrorMessage)

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
      const originalErrorMessage = '"Teams URL" must be a valid uri'
      const { message } = errorMessage('Teams', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
