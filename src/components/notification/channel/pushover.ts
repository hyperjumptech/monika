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

import { PushoverData } from '../../../interfaces/data'
import { NotificationMessage } from '../../../interfaces/notification'

export const sendPushover = async (
  data: PushoverData,
  message: NotificationMessage
) => {
  try {
    const notificationType =
      message.meta.type[0].toUpperCase() + message.meta.type.substring(1)

    let content
    switch (message.meta.type) {
      case 'incident':
      case 'recovery': {
        content = `New ${notificationType} event from Monika\n\n${message.body}`
        break
      }
      default:
        content = message.body
        break
    }

    const res = await axios.request({
      method: 'POST',
      url: `https://api.pushover.net/1/messages.json`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        user: data.user,
        token: data.token,
        message: content,
        html: 1,
      },
    })

    return res
  } catch (error) {
    throw error
  }
}
