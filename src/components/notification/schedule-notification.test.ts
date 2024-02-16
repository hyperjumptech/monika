import cron from 'node-cron'
import sinon from 'sinon'
import chai, { expect } from 'chai'
import spies from 'chai-spies'
import { scheduleSummaryNotification } from './schedule-notification.js'

chai.use(spies)

let cronScheduleStub: sinon.SinonStub
let cronExpression: string
let taskStopCalledTotal = 0

describe('Schedule notification', () => {
  beforeEach(() => {
    cronScheduleStub = sinon
      .stub(cron, 'schedule')
      .callsFake((ce, _callback, _options) => {
        cronExpression = ce

        return {
          stop() {
            taskStopCalledTotal++
          },
        } as cron.ScheduledTask
      })
  })

  afterEach(() => {
    sinon.restore()
    cronExpression = ''
    taskStopCalledTotal = 0
  })

  describe('Schedule summary notification', () => {
    it('should not schedule notification on Symon mode', () => {
      // act
      scheduleSummaryNotification({
        config: {},
        flags: { symonKey: 'secret-key', symonUrl: 'https://example.com' },
      })

      // assert
      sinon.assert.notCalled(cronScheduleStub)
    })

    it('should not schedule notification if status notification flag is false', () => {
      // act
      scheduleSummaryNotification({
        config: {},
        flags: { 'status-notification': 'false' },
      })

      // assert
      sinon.assert.notCalled(cronScheduleStub)
    })

    it('should schedule notification based on notification flag value', () => {
      // act
      scheduleSummaryNotification({
        config: { 'status-notification': '0 0 0 0 0' },
        flags: {
          'status-notification': '* * * * *',
        },
      })

      // assert
      sinon.assert.calledOnce(cronScheduleStub)
      expect(cronExpression).eq('* * * * *')
    })

    it('should schedule notification based on notification config value', () => {
      // act
      scheduleSummaryNotification({
        config: { 'status-notification': '0 0 0 0 0' },
        flags: {},
      })

      // assert
      sinon.assert.calledOnce(cronScheduleStub)
      expect(cronExpression).eq('0 0 0 0 0')
    })

    it('should schedule notification use default schedule', () => {
      // act
      scheduleSummaryNotification({ config: {}, flags: {} })

      // assert
      sinon.assert.calledOnce(cronScheduleStub)
      expect(cronExpression).eq('0 6 * * *')
    })
  })

  describe('Reset schedule notification', () => {
    it('should stop all running scheduled notification', () => {
      // act
      scheduleSummaryNotification({ config: {}, flags: {} })
      scheduleSummaryNotification({ config: {}, flags: {} })

      // arrange
      expect(taskStopCalledTotal).eq(2)
    })
  })
})
