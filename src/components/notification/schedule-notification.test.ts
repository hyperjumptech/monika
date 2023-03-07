import cron from 'node-cron'
import sinon from 'sinon'
import chai, { expect } from 'chai'
import spies from 'chai-spies'
import {
  resetScheduledTasks,
  scheduleSummaryNotification,
} from './schedule-notification'

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
          stop: () => {
            taskStopCalledTotal++
          },
        } as cron.ScheduledTask
      })
  })

  afterEach(() => {
    sinon.restore()
    cronExpression = ''
    resetScheduledTasks()
    taskStopCalledTotal = 0
  })

  describe('Schedule summary notification', () => {
    it('should not schedule notification on Symon mode', () => {
      // act
      scheduleSummaryNotification({ isSymonMode: true })

      // assert
      sinon.assert.notCalled(cronScheduleStub)
    })

    it('should not schedule notification if status notification flag is false', () => {
      // act
      scheduleSummaryNotification({
        isSymonMode: false,
        statusNotificationFlag: 'false',
      })

      // assert
      sinon.assert.notCalled(cronScheduleStub)
    })

    it('should schedule notification based on notification flag value', () => {
      // act
      scheduleSummaryNotification({
        isSymonMode: false,
        statusNotificationFlag: '* * * * *',
        statusNotificationConfig: '0 0 0 0 0',
      })

      // assert
      sinon.assert.calledOnce(cronScheduleStub)
      expect(cronExpression).eq('* * * * *')
    })

    it('should schedule notification based on notification config value', () => {
      // act
      scheduleSummaryNotification({
        isSymonMode: false,
        statusNotificationConfig: '0 0 0 0 0',
      })

      // assert
      sinon.assert.calledOnce(cronScheduleStub)
      expect(cronExpression).eq('0 0 0 0 0')
    })

    it('should schedule notification use default schedule', () => {
      // act
      scheduleSummaryNotification({
        isSymonMode: false,
      })

      // assert
      sinon.assert.calledOnce(cronScheduleStub)
      expect(cronExpression).eq('0 6 * * *')
    })
  })

  describe('Reset schedule notification', () => {
    it('should stop all running scheduled notification', () => {
      // arrange
      scheduleSummaryNotification({
        isSymonMode: false,
      })
      scheduleSummaryNotification({
        isSymonMode: false,
      })

      // act
      resetScheduledTasks()

      // arrange
      expect(taskStopCalledTotal).eq(2)
    })
  })
})
