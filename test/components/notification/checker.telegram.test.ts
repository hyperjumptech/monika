import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { TelegramData } from '../../../src/interfaces/data'

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
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            // eslint-disable-next-line camelcase
            bot_token: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          } as TelegramData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Telegram Group ID" is required'
      const { message } = errorMessage('Telegram', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - without Bot Token', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            // eslint-disable-next-line camelcase
            group_id: 'ABC-EFG-HIJ-KLM-NOP-QRS-TUV-WXY-Z',
          } as TelegramData,
        },
      ])
    } catch (error) {
      const originalErrorMessage = '"Telegram Bot Token" is required'
      const { message } = errorMessage('Telegram', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
