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

import { SlackData } from '../../../interfaces/data'
import { NotificationMessage } from '../../../interfaces/notification'

export const sendSlack = async (
  data: SlackData,
  message: NotificationMessage
) => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.substring(1)

  let content
  switch (message.meta.type) {
    case 'start':
    case 'termination': {
      content = {
        text: `New '${notificationType}' event from Monika`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${message.body}`,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
      break
    }
    case 'incident':
    case 'recovery': {
      content = {
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
              text: `*Message*: ${message.summary}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*URL*: <${message.meta.url}|${message.meta.url}>`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Time*: ${message.meta.time}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*From*: ${message.meta.hostname}`,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
      break
    }
    case 'status-update': {
      content = {
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
              text: `*Host*: ${message.meta.monikaInstance}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Number of Probes*: ${message.meta.numberOfProbes}>`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Maximum Response Time*: ${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Minimum Response Time*: ${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Average Response Time*: ${message.meta.averageResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*From*: ${message.meta.hostname}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Incidents*: ${message.meta.numberOfIncidents} in the last 24 hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Recoveries*: ${message.meta.numberOfRecoveries} in the last 24 hours`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Notifications*: ${message.meta.numberOfSentNotifications}`,
            },
          },
          {
            type: 'divider',
          },
        ],
      }
      break
    }
    default:
      break
  }

  if (content) {
    await axios({
      method: 'POST',
      url: data.url,
      data: content,
    })
  }
}
