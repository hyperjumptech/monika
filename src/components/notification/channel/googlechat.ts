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
import { GoogleChatData } from '../../../interfaces/data'
import { log } from '../../../utils/pino'

export const sendGoogleChat = async (
  data: GoogleChatData,
  message: NotificationMessage
) => {
  const notifType =
    message.meta.type[0].toUpperCase() + message.meta.type.substring(1)
  let chatMessage

  switch (message.meta.type) {
    case 'start':
      chatMessage = {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `Monika is starting`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message:</b> New monika monitoring started`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${message.meta.time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${message.body}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
      break
    case 'termination':
    case 'incident':
      chatMessage = {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `New ${notifType} from Monika`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message: <font color=#ff0000>Alert!</font></b> ${message.summary}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>URL:</b> <a href>${message.meta.url}</a>`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${message.meta.time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${message.meta.monikaInstance}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
      break
    case 'recovery':
      chatMessage = {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `New ${notifType} from Monika`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message: <font color=#0000ff>Recovery</font></b> ${message.summary}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>URL:</b> <a href>${message.meta.url}<a>`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${message.meta.time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${message.meta.monikaInstance}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
      break
    case 'status-update':
      chatMessage = {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `Monika Status`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Host:</b> ${message.meta.monikaInstance}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Number of Probes:</b> ${message.meta.numberOfProbes}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Maximum Response Time:</b> ${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Minimum Response Time:</b> ${message.meta.maxResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Average Response Time:</b> ${message.meta.averageResponseTime} ms in the last ${message.meta.responseTimelogLifeTimeInHour} hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Incidents:</b> ${message.meta.numberOfIncidents} in the last 24 hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Recoveries:</b> ${message.meta.numberOfRecoveries} in the last 24 hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Notifications:</b> ${message.meta.numberOfSentNotifications}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
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
      data: chatMessage,
    })

    return res
  } catch (error) {
    log.error(
      "Couldn't send notification to Google Chat. Got this error: " +
        error.message
    )
  }
}
