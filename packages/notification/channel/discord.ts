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

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Discord URL'),
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
    data: {
      content,
    },
  })
}

function getContent(
  message: NotificationMessage,
  notificationType: string
): string {
  const { body, meta } = message

  if (meta.type === 'incident' || meta.type === 'recovery') {
    return `New *\`${notificationType}\`* event from Monika\n${body}`.replaceAll(
      '\n\n',
      '\n'
    )
  }

  return body
}
