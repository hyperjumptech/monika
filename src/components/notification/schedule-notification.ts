import { schedule as scheduleCron } from 'node-cron'
import type { ScheduledTask } from 'node-cron'
import type { MonikaFlags } from '../../flag'
import type { Config } from '../../interfaces/config'
import { getSummaryAndSendNotif } from '../../jobs/summary-notification'
import { isSymonModeFrom } from '../config'

type scheduleSummaryNotification = {
  config: Pick<Config, 'status-notification'>
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
  const DEFAULT_SCHEDULE_CRON_EXPRESSION = '0 6 * * *'
  const schedule =
    flags['status-notification'] ||
    config['status-notification'] ||
    DEFAULT_SCHEDULE_CRON_EXPRESSION

  const scheduledStatusUpdateTask = scheduleCron(
    schedule,
    getSummaryAndSendNotif
  )

  scheduledTasks.push(scheduledStatusUpdateTask)
}
