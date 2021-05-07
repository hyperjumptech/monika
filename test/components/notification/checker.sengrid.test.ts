import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { SendgridData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - sendgridNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'sendgrid',
    type: 'sendgrid',
  } as Notification

  it('should handle validation error - without apiKey', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {} as SendgridData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Sendgrid API Key" is required'
      const { message } = errorMessage('Sendgrid', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
