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
import { TeamsData } from './../../../interfaces/data'

export const sendTeams = async (
  data: TeamsData,
  message: NotificationMessage
) => {
  switch (message.meta.type) {
    case 'start':
    case 'termination': {
      await axios({
        method: 'POST',
        url: data.url,
        data: {
          '@type': 'MessageCard',
          themeColor: '3BAFDA',
          summary: message.summary,
          sections: [
            {
              activityTitle: message.subject,
              markdown: true,
              facts: [
                {
                  name: 'Message',
                  value: message.body,
                },
              ],
            },
          ],
        },
      })
      break
    }
    case 'incident':
    case 'recovery': {
      const notifType =
        message.meta.type[0].toUpperCase() + message.meta.type.substring(1)
      const notifColor = message.meta.type === 'incident' ? 'DF202E' : '8CC152'

      await axios({
        method: 'POST',
        url: data.url,
        data: {
          '@type': 'MessageCard',
          themeColor: notifColor,
          summary: `New ${notifType} from Monika`,
          sections: [
            {
              activityTitle: `New ${notifType} from Monika`,
              facts: [
                {
                  name: 'Message',
                  value: message.summary,
                },
                {
                  name: 'URL',
                  value: `[${message.meta.url}](${message.meta.url})`,
                },
                {
                  name: 'Time',
                  value: message.meta.time,
                },
                {
                  name: 'From',
                  value: message.meta.monikaInstance,
                },
                { name: 'Version', value: message.meta.version },
              ],
              markdown: true,
            },
          ],
        },
      })
      break
    }
    case 'status-update': {
      await axios({
        method: 'POST',
        url: data.url,
        data: {
          '@type': 'MessageCard',
          summary: message.summary,
          sections: [
            {
              activityTitle: 'Monika Status',
              activitySubtitle: message.subject,
              facts: [
                {
                  name: 'Host',
                  value: message.meta.monikaInstance,
                },
                {
                  name: 'Number of Probes',
                  value: message.meta.numberOfProbes,
                },
                {
                  name: 'Maximum Response Time',
                  value: `${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                },
                {
                  name: 'Minimum Response Time',
                  value: `${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                },
                {
                  name: 'Average Response Time',
                  value: `${message.meta.averageResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                },
                {
                  name: 'Incidents',
                  value: `${message.meta.numberOfIncidents} in the last 24 hours`,
                },
                {
                  name: 'Recoveries',
                  value: `${message.meta.numberOfRecoveries} in the last 24 hours`,
                },
                {
                  name: 'Notifications',
                  value: message.meta.numberOfSentNotifications,
                },
              ],
            },
          ],
        },
      })
      break
    }

    default:
      break
  }
}
