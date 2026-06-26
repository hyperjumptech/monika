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
  apiKey?: string
}

export const validator = Joi.object().keys({
  url: Joi.string().uri().required().label('Flowtriq Webhook URL'),
  apiKey: Joi.string().optional().allow('').label('Flowtriq API Key'),
})

export const send = async (
  { url, apiKey }: NotificationData,
  message: NotificationMessage
): Promise<void> => {
  const { meta, summary } = message

  if (meta.type !== 'incident' && meta.type !== 'recovery') {
    return
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }

  await sendHttpRequest({
    method: 'POST',
    url,
    headers,
    data: {
      source: 'monika',
      probe: meta.url || meta.probeID,
      status: meta.type,
      message: summary,
      timestamp: meta.time,
    },
  })
}

export function additionalStartupMessage({ url }: NotificationData): string {
  return `    URL: ${url}\n`
}
