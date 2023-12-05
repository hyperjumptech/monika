/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import { channels, Notification, NotificationMessage } from './channel'
import { getErrorMessage } from './utils/catch-error-handler'

async function sendNotifications(
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
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        throw new Error(
          `Failed to send message using ${type}, please check your ${type} notification config.\nMessage: ${message}`
        )
      }
    })
  )
}

export { sendNotifications }

export { channels, Notification, NotificationMessage } from './channel'
export { validateNotification } from './validator/notification'
