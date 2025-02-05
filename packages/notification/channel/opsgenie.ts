/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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
  geniekey: string
}

type Content = {
  message: string
  description: string
}

export const validator = Joi.object().keys({
  geniekey: Joi.string().required().label('Opsgenie geniekey'),
})

export const send = async (
  { geniekey }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const content = getContent(message, notificationType)

  await sendHttpRequest({
    method: 'POST',
    url: `https://api.opsgenie.com/v2/alerts`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `GenieKey ${geniekey}`,
    },
    data: content,
  })
}

function getContent(
  { body, meta }: NotificationMessage,
  notificationType: string
): Content {
  switch (meta.type) {
    case 'incident':
    case 'recovery': {
      const message = `New ${notificationType} event from Monika`
      const description = `New ${notificationType} event from Monika\n\n${body}`

      return {
        message,
        description,
      }
    }

    case 'status-update': {
      const message = `Monika status update`
      const description = `New ${notificationType} event from Monika\n\n${body}`

      return {
        message,
        description,
      }
    }

    default: {
      const message = `Monika ${meta.type}`
      const description = body

      return {
        message,
        description,
      }
    }
  }
}
