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
import axios from 'axios'

import { NotificationMessage } from '../../../interfaces/notification'
import { LarkData } from '../../../interfaces/data'
import { log } from '../../../utils/pino'

export const sendLark = async (
  data: LarkData,
  message: NotificationMessage
) => {
  const notifType =
    message.meta.type[0].toUpperCase() + message.meta.type.substring(1)
  let larkMessage

  switch (message.meta.type) {
    case 'start':
    case 'termination':
      larkMessage = {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Notification',
              content: [
                [
                  {
                    tag: 'text',
                    text: `New ${notifType} from Monika\n`,
                  },
                  {
                    tag: 'text',
                    text: `${message.summary}\n`,
                  },
                ],
              ],
            },
          },
        },
      }
      break
    case 'incident':
    case 'recovery':
      larkMessage = {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Notification',
              content: [
                [
                  {
                    tag: 'text',
                    text: `New ${notifType} from Monika\n`,
                  },
                  {
                    tag: 'text',
                    text: `Message: ${message.summary}\n`,
                  },
                  {
                    tag: 'a',
                    text: `URL: ${message.meta.url}\n`,
                    href: `${message.meta.url}`,
                  },
                  {
                    tag: 'text',
                    text: `Time: ${message.meta.time}\n`,
                  },
                  {
                    tag: 'text',
                    text: `From: ${message.meta.monikaInstance}`,
                  },
                  {
                    tag: 'text',
                    text: `Version: ${message.meta.version}`,
                  },
                ],
              ],
            },
          },
        },
      }
      break
    case 'status-update':
      larkMessage = {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Status Update',
              content: [
                {
                  tag: 'a',
                  text: `${message.meta.monikaInstance}`,
                  href: `${message.meta.monikaInstance}`,
                },
                {
                  tag: 'text',
                  value: `${message.meta.numberOfProbes}`,
                },
                {
                  tag: 'text',
                  value: `${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                },
                {
                  tag: 'text',
                  value: `${message.meta.minResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                },
                {
                  tag: 'text',
                  value: `${message.meta.averageResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                },
                {
                  tag: 'text',
                  value: `${message.meta.numberOfIncidents} in the last 24 hours`,
                },
                {
                  tag: 'text',
                  value: `${message.meta.numberOfRecoveries} in the last 24 hours`,
                },
                {
                  tag: 'text',
                  value: message.meta.numberOfSentNotifications,
                },
              ],
            },
          },
        },
      }
      break
    default:
      break
  }

  try {
    const res = await axios({
      method: 'POST',
      url: data.url,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      data: larkMessage,
    })

    return res
  } catch (error) {
    log.error(
      "Couldn't send notification to Lark Suite. Got this error: " +
        error.message
    )
  }
}
