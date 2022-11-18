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

import { WebhookData } from '../../../interfaces/data'
import { NotificationMessage } from '../../../interfaces/notification'
import { sendHttpRequest } from '../../../utils/http'
import { log } from '../../../utils/pino'

export const sendDiscord = async (
  data: WebhookData,
  message: NotificationMessage
): Promise<any> => {
  try {
    const notificationType =
      message.meta.type[0].toUpperCase() + message.meta.type.substring(1)
    let content
    switch (message.meta.type) {
      case 'incident':
      case 'recovery': {
        content = `New *\`${notificationType}\`* event from Monika\n${message.body}`
        content = content.replaceAll('\n\n', '\n')
        break
      }

      default:
        content = message.body
        break
    }

    const res = await sendHttpRequest({
      method: 'POST',
      url: data.url,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      data: {
        content: content,
      },
    })
    return res
  } catch (error: any) {
    log.error(
      "Couldn't send notification to Discord. Got this error: " + error.message
    )
  }
}
