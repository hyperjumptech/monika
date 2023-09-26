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
import { sendHttpRequest } from '../utils/http'
import type { NotificationMessage } from '.'

type NotificationData = {
  token: string
  deviceID?: string
}

type Content = {
  title: string
  body: string
  type: 'note'
}

export const validator = Joi.object().keys({
  token: Joi.string().required().label('Pushbullet token'),
  deviceID: Joi.string()
    .optional()
    .label('Pushbullet device identifier (optional)'),
})

export const send = async (
  { deviceID, token }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const content = getContent(message, notificationType)
  const url = deviceID
    ? `https://api.pushbullet.com/v2/pushes?device_iden=${deviceID}`
    : 'https://api.pushbullet.com/v2/pushes'

  await sendHttpRequest({
    method: 'POST',
    url,
    headers: {
      'Access-Token': token,
      'Content-Type': 'application/json',
    },
    data: content,
  })
}

function getContent(
  { body, meta }: NotificationMessage,
  notificationType: string
): Content {
  const { type, url } = meta
  switch (type) {
    case 'start': {
      return {
        body,
        title: url ? `Monika is starting [${url}]` : 'Monika is starting',
        type: 'note',
      }
    }

    case 'termination': {
      return {
        body,
        title: url ? `Monika is terminating [${url}]` : 'Monika is terminating',
        type: 'note',
      }
    }

    case 'status-update': {
      return {
        body,
        title: url
          ? `New Monika Status Update [${url}]`
          : 'New Monika Status Update',
        type: 'note',
      }
    }

    case 'incident':
    case 'recovery': {
      return {
        body,
        title: url
          ? `New ${notificationType} from Monika [${url}]`
          : `New ${notificationType} from Monika`,
        type: 'note',
      }
    }

    default: {
      return {
        body,
        title: url ? `[${url}]` : '',
        type: 'note',
      }
    }
  }
}
