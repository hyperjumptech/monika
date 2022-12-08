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

import { AxiosResponse } from 'axios'
import { OpsgenieData } from '../../../interfaces/data'
import { NotificationMessage } from '../../../interfaces/notification'
import { sendHttpRequest } from '../../../utils/http'

export const sendOpsgenie = async (
  data: OpsgenieData,
  message: NotificationMessage
): Promise<AxiosResponse> => {
  const notificationType =
    message.meta.type[0].toUpperCase() + message.meta.type.slice(1)

  let content
  let title
  switch (message.meta.type) {
    case 'incident':
    case 'recovery': {
      title = `New ${notificationType} event from Monika`
      content = `New ${notificationType} event from Monika\n\n${message.body}`
      break
    }

    case 'status-update': {
      title = `Monika status update`
      content = `New ${notificationType} event from Monika\n\n${message.body}`
      break
    }

    default:
      title = `Monika ${message.meta.type}`
      content = message.body
      break
  }

  const res = await sendHttpRequest({
    method: 'POST',
    url: `https://api.opsgenie.com/v2/alerts`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `GenieKey ${data.geniekey}`,
    },
    data: {
      message: title,
      description: content,
    },
  })

  return res
}
