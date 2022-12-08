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

import { AxiosResponse } from 'axios'
import format from 'date-fns/format'
import { DingtalkData } from '../../../interfaces/data'
import { NotificationMessage } from '../../../interfaces/notification'
import { sendHttpRequest } from '../../../utils/http'

export const sendDingtalk = async (
  data: DingtalkData,
  message: NotificationMessage
): Promise<AxiosResponse> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)

  let content
  let bodyJson
  switch (message.meta.type) {
    case 'incident':
    case 'recovery': {
      content = `New ${notificationType} event from Monika\n\n${message.body}`
      bodyJson = {
        msgtype: 'text',
        text: {
          content: content,
        },
      }
      break
    }

    case 'status-update': {
      content = `Status Update ${format(
        new Date(),
        'yyyy-MM-dd HH:mm:ss XXX'
      )}\n
Host: ${message.meta.monikaInstance}\n
Number of Probes: ${message.meta.numberOfProbes}\n
Maximum Response Time: ${message.meta.maxResponseTime} ms in the last ${
        message.meta.responseTimelogLifeTimeInHour
      } hours\n
Minimum Response Time: ${message.meta.minResponseTime} ms in the last ${
        message.meta.responseTimelogLifeTimeInHour
      } hours\n
Average Response Time: ${message.meta.averageResponseTime} ms in the last ${
        message.meta.responseTimelogLifeTimeInHour
      } hours\n
Incidents: ${message.meta.numberOfIncidents} in the last 24 hours\n
Recoveries: ${message.meta.numberOfRecoveries} in the last 24 hours\n
Notifications: ${message.meta.numberOfSentNotifications}\n
 \n
`
      const indexTweet = message.body.indexOf('<a href')
      let tweet = message.body.slice(indexTweet)
      tweet = tweet.replace('<a href=', '[Tweet this status!](')
      tweet = tweet.replace('Tweet this status!</a>', ')')

      bodyJson = {
        msgtype: 'markdown',
        markdown: {
          title: message.meta.type,
          text: content + tweet,
        },
      }
      break
    }

    default:
      content = message.body
      bodyJson = {
        msgtype: 'text',
        text: {
          content: content,
        },
      }
      break
  }

  const res = await sendHttpRequest({
    method: 'POST',
    url: `https://oapi.dingtalk.com/robot/send?access_token=${data.access_token}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: bodyJson,
  })

  return res
}
