import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { WorkplaceData } from '../../../src/interfaces/data'
import { Notification } from '../../../src/interfaces/notification'

chai.use(spies)

describe('notificationChecker - workplaceNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'workplace',
    type: 'workplace',
  } as Notification

  it('should handle validation error - without Thread ID', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            access_token: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          } as WorkplaceData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Workplace Thread ID" is required'
      const { message } = errorMessage('Workplace', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without Access Token', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            thread_id: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          } as WorkplaceData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Workplace Access Token" is required'
      const { message } = errorMessage('Workplace', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
