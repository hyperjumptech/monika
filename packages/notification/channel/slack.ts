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
import type { NotificationMessage } from '.'
import { sendHttpRequest } from '../utils/http'

type NotificationData = {
  url: string
}

type ContentBlock = {
  type: string
  text?: string | ContentBlock
}

type Content = {
  text: string
  blocks: ContentBlock[]
}

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Slack URL'),
})

export const send = async (
  { url }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const content = getContent(message, notificationType)

  if (!content) {
    return
  }

  await sendHttpRequest({
    method: 'POST',
    url,
    data: content,
  })
}

export function additionalStartupMessage({ url }: NotificationData): string {
  return `    URL: ${url}\n`
}

function getContent(
  { body, meta, summary }: NotificationMessage,
  notificationType: string
): Content {
  switch (meta.type) {
    case 'start':
    case 'termination': {
      return {
        text: `New '${notificationType}' event from Monika`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: body,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
    }

    case 'incident':
    case 'recovery': {
      return {
        text: `New '${notificationType}' event from Monika`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `New *\`${notificationType}\`* from Monika`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message*: ${summary}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*URL*: <${meta.url}|${meta.url}>`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Time*: ${meta.time}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*From*: ${meta.hostname}`,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
    }

    case 'status-update': {
      return {
        text: `New '${notificationType}' from Monika`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Monika Status`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Host*: ${meta.monikaInstance}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Number of Probes*: ${meta.numberOfProbes}>`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Maximum Response Time*: ${meta.maxResponseTime} ms in the last ${meta.responseTimelogLifeTimeInHour} hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Minimum Response Time*: ${meta.minResponseTime} ms in the last ${meta.responseTimelogLifeTimeInHour} hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Average Response Time*: ${meta.averageResponseTime} ms in the last ${meta.responseTimelogLifeTimeInHour} hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*From*: ${meta.hostname}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Incidents*: ${meta.numberOfIncidents} in the last 24 hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Recoveries*: ${meta.numberOfRecoveries} in the last 24 hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Notifications*: ${meta.numberOfSentNotifications}`,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
    }

    default: {
      return {
        text: `New notification from Monika`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: summary,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
    }
  }
}
