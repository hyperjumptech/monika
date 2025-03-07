import cron from 'node-cron'
import type { ScheduledTask } from 'node-cron'
import type { MonikaFlags } from '../../flag.js'
import type { ValidatedConfig } from '../../interfaces/config.js'
import { getSummaryAndSendNotif } from '../../jobs/summary-notification.js'
import { isSymonModeFrom } from '../config/index.js'

const { schedule: scheduleCron } = cron

type scheduleSummaryNotification = {
  config: Pick<ValidatedConfig, 'status-notification'>
  flags: Pick<MonikaFlags, 'status-notification' | 'symonKey' | 'symonUrl'>
}

let scheduledTasks: ScheduledTask[] = []

// Stop and clear all previous cron tasks
function resetScheduledTasks(): void {
  for (const task of scheduledTasks) {
    task.stop()
  }

  scheduledTasks = []
}

export function scheduleSummaryNotification({
  config,
  flags,
}: scheduleSummaryNotification): void {
  if (isSymonModeFrom(flags) || flags['status-notification'] === 'false') {
    return
  }

  resetScheduledTasks()

  // defaults to 6 AM
  // default value is not defined in flag configuration,
  // because the value can also come from config file
  const schedule = flags['status-notification'] || config['status-notification']

  const scheduledStatusUpdateTask = scheduleCron(
    schedule,
    getSummaryAndSendNotif
  )

  scheduledTasks.push(scheduledStatusUpdateTask)
}
