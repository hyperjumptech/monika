/* eslint-disable camelcase */
import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { validateNotification } from '../../validator/notification'

chai.use(spies)

describe('notificationChecker - telegramNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'telegram',
    type: 'telegram' as const,
  }

  it('should handle validation error - without Group ID', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            bot_token: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
            group_id: '',
          },
        },
      ])
    } catch (error) {
      const message = '"Telegram Group ID" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without Bot Token', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            bot_token: '',
            group_id: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          },
        },
      ])
    } catch (error) {
      const message = '"Telegram Bot Token" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
