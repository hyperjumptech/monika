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

import Joi from 'joi'
import { sendHttpRequest } from '../../../utils/http'
import type { NotificationMessage } from './'

type NotificationData = {
  url: string
}

type Content = {
  '@type': string
  summary: string
  sections?: {
    activityTitle?: string
    facts?: {
      name?: string
      value?: any
    }[]
    activitySubtitle?: string
    markdown?: boolean
  }[]
  themeColor?: string
}

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Teams URL'),
})

export const send = async (
  { url }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const content = getContent(message, notificationType)

  await sendHttpRequest({
    method: 'POST',
    url,
    data: content,
  })
}

function getContent(
  { body, meta, subject, summary }: NotificationMessage,
  notificationType: string
): Content {
  switch (meta.type) {
    case 'start':
    case 'termination': {
      return {
        '@type': 'MessageCard',
        themeColor: '3BAFDA',
        summary,
        sections: [
          {
            activityTitle: subject,
            markdown: true,
            facts: [
              {
                name: 'Message',
                value: body,
              },
            ],
          },
        ],
      }
    }

    case 'incident':
    case 'recovery': {
      const themeColor = meta.type === 'incident' ? 'DF202E' : '8CC152'

      return {
        '@type': 'MessageCard',
        themeColor,
        summary: `New ${notificationType} from Monika`,
        sections: [
          {
            activityTitle: `New ${notificationType} from Monika`,
            facts: [
              {
                name: 'Message',
                value: summary,
              },
              {
                name: 'URL',
                value: `[${meta.url}](${meta.url})`,
              },
              {
                name: 'Time',
                value: meta.time,
              },
              {
                name: 'From',
                value: meta.monikaInstance,
              },
              { name: 'Version', value: meta.version },
            ],
            markdown: true,
          },
        ],
      }
    }

    case 'status-update': {
      return {
        '@type': 'MessageCard',
        summary: summary,
        sections: [
          {
            activityTitle: 'Monika Status',
            activitySubtitle: subject,
            facts: [
              {
                name: 'Host',
                value: meta.monikaInstance,
              },
              {
                name: 'Number of Probes',
                value: meta.numberOfProbes,
              },
              {
                name: 'Maximum Response Time',
                value: `${meta.maxResponseTime} ms in the last ${meta.responseTimelogLifeTimeInHour} hours`,
              },
              {
                name: 'Minimum Response Time',
                value: `${meta.minResponseTime} ms in the last ${meta.responseTimelogLifeTimeInHour} hours`,
              },
              {
                name: 'Average Response Time',
                value: `${meta.averageResponseTime} ms in the last ${meta.responseTimelogLifeTimeInHour} hours`,
              },
              {
                name: 'Incidents',
                value: `${meta.numberOfIncidents} in the last 24 hours`,
              },
              {
                name: 'Recoveries',
                value: `${meta.numberOfRecoveries} in the last 24 hours`,
              },
              {
                name: 'Notifications',
                value: meta.numberOfSentNotifications,
              },
            ],
          },
        ],
      }
    }

    default:
      return {
        '@type': 'MessageCard',
        summary,
      }
  }
}
