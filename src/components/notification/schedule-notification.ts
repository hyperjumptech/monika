import cron from 'node-cron'
import type { ScheduledTask } from 'node-cron'
import { getSummaryAndSendNotif } from '../../jobs/summary-notification'

type scheduleSummaryNotification = {
  isSymonMode: boolean
  statusNotificationConfig?: string
  statusNotificationFlag?: string
}

let scheduledTasks: ScheduledTask[] = []

// Stop and clear all previous cron tasks
export function resetScheduledTasks(): void {
  for (const task of scheduledTasks) {
    task.stop()
  }

  scheduledTasks = []
}

export function scheduleSummaryNotification({
  isSymonMode,
  statusNotificationConfig,
  statusNotificationFlag,
}: scheduleSummaryNotification): void {
  if (isSymonMode || statusNotificationFlag === 'false') {
    return
  }

  // defaults to 6 AM
  // default value is not defined in flag configuration,
  // because the value can also come from config file
  const DEFAULT_SCHEDULE_CRON_EXPRESSION = '0 6 * * *'
  const schedule =
    statusNotificationFlag ||
    statusNotificationConfig ||
    DEFAULT_SCHEDULE_CRON_EXPRESSION

  const scheduledStatusUpdateTask = cron.schedule(
    schedule,
    getSummaryAndSendNotif
  )

  scheduledTasks.push(scheduledStatusUpdateTask)
}
