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
import type { NotificationMessage } from './index.js'
import { sendHttpRequest } from '../utils/http.js'

type NotificationData = {
  url: string
}

type ContentHeader = {
  title: string
  subtitle: string
  imageUrl: string
}

type Widget = {
  textParagraph: {
    text: string
  }
}

type Section = {
  widgets: Widget[]
}

type Content = {
  cards: {
    header: ContentHeader
    sections: Section[]
  }[]
}

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Google URL'),
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
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
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
  const {
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    numberOfIncidents,
    numberOfProbes,
    numberOfRecoveries,
    numberOfSentNotifications,
    responseTimelogLifeTimeInHour,
    time,
    type,
    url,
    monikaInstance,
  } = meta

  switch (type) {
    case 'start': {
      return {
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
                      text: `<b>Time:</b> ${time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${body}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
    }

    case 'termination':
    case 'incident': {
      return {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `New ${notificationType} from Monika`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message: <font color=#ff0000>Alert!</font></b> ${summary}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>URL:</b> <a href>${url}</a>`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${monikaInstance}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
    }

    case 'recovery': {
      return {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: `New ${notificationType} from Monika`,
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: `<b>Message: <font color=#0000ff>Recovery</font></b> ${summary}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>URL:</b> <a href>${url}<a>`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Time:</b> ${time}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>From:</b> ${monikaInstance}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
    }

    case 'status-update': {
      return {
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
                      text: `<b>Host:</b> ${monikaInstance}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Number of Probes:</b> ${numberOfProbes}`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Maximum Response Time:</b> ${maxResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Minimum Response Time:</b> ${minResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Average Response Time:</b> ${averageResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Incidents:</b> ${numberOfIncidents} in the last 24 hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Recoveries:</b> ${numberOfRecoveries} in the last 24 hours`,
                    },
                  },
                  {
                    textParagraph: {
                      text: `<b>Notifications:</b> ${numberOfSentNotifications}`,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
    }

    default: {
      return {
        cards: [
          {
            header: {
              title: 'Monika Notification',
              subtitle: 'Monika Status',
              imageUrl: 'https://bit.ly/3kckaGO',
            },
            sections: [
              {
                widgets: [
                  {
                    textParagraph: {
                      text: summary,
                    },
                  },
                ],
              },
            ],
          },
        ],
      }
    }
  }
}
