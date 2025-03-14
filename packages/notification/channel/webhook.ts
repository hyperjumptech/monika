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

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Webhook URL'),
})

export const send = async (
  { url }: NotificationData,
  { meta }: NotificationMessage
): Promise<void> => {
  if (meta.type !== 'incident' && meta.type !== 'recovery') {
    return
  }

  const { alertQuery, probeID, time } = meta

  await sendHttpRequest({
    method: 'POST',
    url,
    data: {
      body: {
        url: meta.url || probeID,
        time,
        alert: alertQuery,
      },
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export function additionalStartupMessage({ url }: NotificationData): string {
  return `    URL: ${url}\n`
}
