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
  token: string
  user: string
  message: string
}

export const validator = Joi.object().keys({
  token: Joi.string().required().label('Pushover token'),
  user: Joi.string().required().label('Pushover user'),
})

export const send = async (
  { token, user }: NotificationData,
  { body, meta }: NotificationMessage
): Promise<void> => {
  const notificationType = meta.type[0].toUpperCase() + meta.type.slice(1)
  const content =
    meta.type === 'incident' || meta.type === 'recovery'
      ? `New ${notificationType} event from Monika\n\n${body}`
      : body

  await sendHttpRequest({
    method: 'POST',
    url: `https://api.pushover.net/1/messages.json`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      user,
      token,
      message: content,
      html: 1,
    },
  })
}
