import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { TeamsData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - teamsNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'teams',
    type: 'teams',
  } as Notification

  it('should handle validation error - without URL', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {} as TeamsData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Teams URL" is required'
      const { message } = errorMessage('Teams', originalErrorMessage)

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
          } as TeamsData,
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
