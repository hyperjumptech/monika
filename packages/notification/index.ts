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

import {
  channels,
  type Notification,
  type NotificationMessage,
} from './channel/index.js'
import { getErrorMessage } from './utils/catch-error-handler.js'
import { type InputSender, updateSender } from './utils/default-sender.js'

async function sendNotifications(
  notifications: Notification[],
  message: NotificationMessage,
  sender?: InputSender
): Promise<{ type: string; success: boolean }[]> {
  if (sender) {
    updateSender(sender)
  }

  // Map notifications to an array of results
  const results = await Promise.all(
    notifications.map(async ({ data, type }) => {
      const channel = channels[type]
      try {
        if (!channel) {
          throw new Error('Notification channel is not available')
        }

        await channel.send(data, message)
        return { type, success: true }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error)
        console.error(
          `Failed to send message using ${type}, please check your ${type} notification config.\nMessage: ${errorMessage}`
        )
        return { type, success: false }
      }
    })
  )

  return results
}

export { sendNotifications }

export { channels, Notification, NotificationMessage } from './channel/index.js'
export { validateNotification } from './validator/notification.js'
