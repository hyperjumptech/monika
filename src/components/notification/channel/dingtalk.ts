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
import format from 'date-fns/format'
import Joi from 'joi'
import type { NotificationMessage } from './'
import { sendHttpRequest } from '../../../utils/http'

type NotificationData = {
  access_token: string
}

type TextContent = {
  content: string
}

type MarkdownContent = {
  title: string
  text: string
}

type Content = {
  msgtype: string
  text?: TextContent
  markdown?: MarkdownContent
}

export const validator = Joi.object().keys({
  access_token: Joi.string().required().label('Dingtalk access token'),
})

export const send = async (
  { access_token }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const content = getContent(message, notificationType)

  await sendHttpRequest({
    method: 'POST',
    url: `https://oapi.dingtalk.com/robot/send?access_token=${access_token}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: content,
  })
}

function getContent(
  { body, meta, summary }: NotificationMessage,
  notificationType: string
): Content {
  const {
    averageResponseTime,
    numberOfIncidents,
    numberOfProbes,
    numberOfRecoveries,
    numberOfSentNotifications,
    minResponseTime,
    maxResponseTime,
    responseTimelogLifeTimeInHour,
    type,
    monikaInstance,
  } = meta

  switch (type) {
    case 'incident':
    case 'recovery': {
      const content = `New ${notificationType} event from Monika\n\n${body}`

      return {
        msgtype: 'text',
        text: {
          content,
        },
      }
    }

    case 'status-update': {
      const content = `Status Update ${format(
        new Date(),
        'yyyy-MM-dd HH:mm:ss XXX'
      )}\n
Host: ${monikaInstance}\n
Number of Probes: ${numberOfProbes}\n
Maximum Response Time: ${maxResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours\n
Minimum Response Time: ${minResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours\n
Average Response Time: ${averageResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours\n
Incidents: ${numberOfIncidents} in the last 24 hours\n
Recoveries: ${numberOfRecoveries} in the last 24 hours\n
Notifications: ${numberOfSentNotifications}\n
 \n
`
      const indexTweet = body.indexOf('<a href')
      const tweet = body
        .slice(indexTweet)
        .replace('<a href=', '[Tweet this status!](')
        .replace('Tweet this status!</a>', ')')

      return {
        msgtype: 'markdown',
        markdown: {
          title: type,
          text: content + tweet,
        },
      }
    }

    default:
      return {
        msgtype: 'text',
        text: {
          content: summary,
        },
      }
  }
}
