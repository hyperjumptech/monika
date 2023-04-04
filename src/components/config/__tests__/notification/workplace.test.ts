/* eslint-disable camelcase */
import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { validateNotification } from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - workplaceNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'workplace',
    type: 'workplace' as const,
  }

  it('should handle validation error - without Thread ID', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            access_token: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
            thread_id: '',
          },
        },
      ])
    } catch (error) {
      const message = '"Workplace Thread ID" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without Access Token', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            access_token: '',
            thread_id: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          },
        },
      ])
    } catch (error) {
      const message = '"Workplace Access Token" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
