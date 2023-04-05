import { channels, Notification, NotificationMessage } from './channel'

export async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage
): Promise<void> {
  await Promise.all(
    notifications.map(async ({ data, type }) => {
      const channel = channels[type]

      try {
        if (!channel) {
          throw new Error('Notification channel is not available')
        }

        await channel.send(data, message)
      } catch (error: any) {
        throw new Error(
          `Failed to send message using ${type}, please check your ${type} notification config.\nMessage: ${error?.message}`
        )
      }
    })
  )
}
