import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  validateNotification,
} from '../../validation/validator/notification'

chai.use(spies)

describe('notificationChecker - pushbulletNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'pushbullet',
    type: 'pushbullet' as const,
  }
  const fn = () =>
    validateNotification([
      {
        ...notificationConfig,
        data: {
          token: 'qwertyuiop',
          deviceID: 'asdfghjkl',
        },
      },
    ])
  const notificationCheckerWithoutDeviceID = () =>
    validateNotification([
      {
        ...notificationConfig,
        data: {
          token: 'qwertyuiop',
        },
      },
    ])

  it('should handle correct config', async () => {
    expect(fn).not.to.throws()
  })

  it('should handle validation error - no token', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            token: '',
            deviceID: 'asdfghjkl',
          },
        },
      ])
    } catch (error) {
      const originalErrorMessage =
        '"Pushbullet token" is not allowed to be empty'
      const { message } = errorMessage('Pushbullet', originalErrorMessage)

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should proceed as usual without deviceID', async () => {
    expect(notificationCheckerWithoutDeviceID).not.to.throws()
  })
})
