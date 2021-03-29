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
import { LoginUserSuccessResponse } from '../../../interfaces/whatsapp'
import { authorize } from '../../../utils/authorization'
import { log } from 'console'
import { WhatsappData } from '../../../interfaces/data'

export const loginUser = async (data: WhatsappData) => {
  try {
    const auth = authorize('basic', {
      username: data.username,
      password: data.password,
    })

    const url = `${data.url}/v1/users/login`
    const resp = await axios.request({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    })
    const loginResp: LoginUserSuccessResponse = resp?.data

    if (loginResp.users?.length > 0) return loginResp.users[0].token
  } catch (error) {
    log('Something wrong with your whatsapp config please check again.')
  }
}

export const sendTextMessage = async ({
  recipient,
  message,
  token,
  baseUrl,
}: {
  recipient: string
  message: string
  token: string
  baseUrl: string
}) => {
  try {
    const auth = authorize('bearer', token)
    const url = `${baseUrl}/v1/messages`

    return axios.request({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      data: {
        to: recipient,
        type: 'text',
        recipient_type: 'individual',
        text: {
          body: message,
        },
      },
    })
  } catch (error) {
    log(
      'Something wrong with your recipient no, Please check your country code: ',
      recipient
    )
  }
}

export const sendWhatsapp = async (data: WhatsappData, message: string) => {
  const token = await loginUser(data)
  if (token) {
    await Promise.all(
      data.recipients.map((recipient) => {
        return sendTextMessage({
          recipient,
          token,
          baseUrl: data.url,
          message,
        })
      })
    )
  }
}
