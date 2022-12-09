import chai, { expect } from 'chai'
import spies from 'chai-spies'

import {
  errorMessage,
  notificationChecker,
} from '../../../src/components/notification/checker'
import { PushbulletData } from '../../../src/interfaces/data'

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
    notificationChecker([
      {
        ...notificationConfig,
        data: {
          token: 'qwertyuiop',
          deviceID: 'asdfghjkl',
        } as PushbulletData,
      },
    ])
  const notificationCheckerWithoutDeviceID = () =>
    notificationChecker([
      {
        ...notificationConfig,
        data: {
          token: 'qwertyuiop',
        } as PushbulletData,
      },
    ])

  it('should handle correct config', async () => {
    expect(fn).not.to.throws()
  })

  it('should handle validation error - no token', async () => {
    try {
      await notificationChecker([
        {
          ...notificationConfig,
          data: {
            token: '',
            deviceID: 'asdfghjkl',
          } as PushbulletData,
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
