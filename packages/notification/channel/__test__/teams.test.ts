import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { validateNotification } from '../../validator/notification.js'

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
    } catch (error: unknown) {
      const message = '"Teams URL" is not allowed to be empty'

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
    } catch (error: unknown) {
      const message = '"Teams URL" must be a valid uri'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})
