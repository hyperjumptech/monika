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
  url: string
}

type Content = { title: string; message: string }

export const validator = Joi.object().keys({
  token: Joi.string().required().label('Gotify token'),
  url: Joi.string().required().label('Gotify url'),
})

export const send = async (
  { token, url }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)
  const content = getContent(message, notificationType)

  await sendHttpRequest({
    method: 'POST',
    url: `${url}/message?token=${token}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: content,
  })
}

function getContent(
  notificationMessage: NotificationMessage,
  notificationType: string
): Content {
  const { body, meta } = notificationMessage
  const title = getTitle(notificationMessage)
  const message =
    meta.type === 'incident' || meta.type === 'recovery'
      ? `New ${notificationType} event from Monika\n\n${body}`
      : body

  return { title, message }
}

function getTitle({ meta, summary }: NotificationMessage): string {
  const { type, url } = meta
  let title =
    type === 'incident' || type === 'recovery' ? `${type.toUpperCase()}: ` : ''

  if (url) {
    title += `[${url}] `
  }

  title += summary

  return title
}
