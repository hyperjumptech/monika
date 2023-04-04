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

/* eslint-disable camelcase */
import Joi from 'joi'
import type { NotificationMessage } from './'
import { sendHttpRequest } from '../../../utils/http'

type NotificationData = {
  url: string
}

type Content = {
  msg_type: string
  content: {
    post: {
      en_us: {
        title: string
        content: {
          tag?: string
          text: string
          href?: string
        }[][]
      }
    }
  }
}

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Lark URL'),
})

export const send = async (
  { url }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const larkMessage = getContent(message, notificationType)

  await sendHttpRequest({
    method: 'POST',
    url,
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
    data: larkMessage,
  })
}

export function additionalStartupMessage({ url }: NotificationData): string {
  return `    URL: ${url}\n`
}

function getContent(
  { meta, summary }: NotificationMessage,
  notificationType: string
): Content {
  const {
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    monikaInstance,
    numberOfIncidents,
    numberOfProbes,
    numberOfRecoveries,
    numberOfSentNotifications,
    responseTimelogLifeTimeInHour,
    time,
    url,
    version,
  } = meta

  switch (meta.type) {
    case 'start':
    case 'termination':
      return {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Notification',
              content: [
                [
                  {
                    tag: 'text',
                    text: `New ${notificationType} from Monika\n`,
                  },
                  {
                    tag: 'text',
                    text: `${summary}\n`,
                  },
                ],
              ],
            },
          },
        },
      }
    case 'incident':
    case 'recovery':
      return {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Notification',
              content: [
                [
                  {
                    tag: 'text',
                    text: `New ${notificationType} from Monika\n`,
                  },
                  {
                    tag: 'text',
                    text: `Message: ${summary}\n`,
                  },
                  {
                    tag: 'a',
                    text: `URL: ${url}\n`,
                    href: `${url}`,
                  },
                  {
                    tag: 'text',
                    text: `Time: ${time}\n`,
                  },
                  {
                    tag: 'text',
                    text: `From: ${monikaInstance}`,
                  },
                  {
                    tag: 'text',
                    text: `Version: ${version}`,
                  },
                ],
              ],
            },
          },
        },
      }
    case 'status-update':
      return {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Status Update',
              content: [
                [
                  {
                    tag: 'a',
                    text: `${monikaInstance}`,
                    href: `${monikaInstance}`,
                  },
                  {
                    tag: 'text',
                    text: `${numberOfProbes}`,
                  },
                  {
                    tag: 'text',
                    text: `${maxResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours`,
                  },
                  {
                    tag: 'text',
                    text: `${minResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours`,
                  },
                  {
                    tag: 'text',
                    text: `${averageResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours`,
                  },
                  {
                    tag: 'text',
                    text: `${numberOfIncidents} in the last 24 hours`,
                  },
                  {
                    tag: 'text',
                    text: `${numberOfRecoveries} in the last 24 hours`,
                  },
                  {
                    tag: 'text',
                    text: `${numberOfSentNotifications}`,
                  },
                ],
              ],
            },
          },
        },
      }
    default:
      return {
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: 'Monika Notification',
              content: [
                [
                  {
                    tag: 'text',
                    text: summary,
                  },
                ],
              ],
            },
          },
        },
      }
  }
}
