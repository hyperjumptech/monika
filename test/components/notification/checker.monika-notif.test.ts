import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { MonikaNotifData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - MonikaNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'monika-notif',
    type: 'monika-notif',
  } as Notification

  it('should handle validation error - without URL', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {} as MonikaNotifData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Monika Notification URL" is required'
      const { message } = errorMessage('Monika-Notif', originalErrorMessage)

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
          } as MonikaNotifData,
        },
      ])
    } catch (error) {
      const originalErrorMessage =
        '"Monika Notification URL" must be a valid uri'
      const { message } = errorMessage('Monika-Notif', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
