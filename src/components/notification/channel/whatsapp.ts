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
import { dataBaseEmailSchemaValidator, type NotificationMessage } from '.'
import { authorize } from '../../../utils/authorization'
import { sendHttpRequest } from '../../../utils/http'

type SendTextMessageParams = {
  recipient: string
  message: string
  token: string
  baseUrl: string
}

type WhatsappData = {
  url: string
  username: string
  password: string
  recipients: string[]
}

export type WhatsappBusinessNotification = {
  id: string
  type: 'whatsapp'
  data: WhatsappData
}

type User = {
  token: string
  // eslint-disable-next-line camelcase
  expires_after: string
}

type Meta = {
  version: string
  // eslint-disable-next-line camelcase
  api_status: string
}

type LoginUserSuccessResponse = {
  users: User[]
  meta: Meta
}

const loginUser = async ({
  password,
  url: baseURL,
  username,
}: WhatsappData): Promise<string> => {
  try {
    const auth = authorize('basic', {
      username,
      password,
    })

    const url = `${baseURL}/v1/users/login`
    const resp = await sendHttpRequest({
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    })
    const loginResp: LoginUserSuccessResponse = resp?.data
    const hasUser = loginResp.users?.length > 0

    if (!hasUser) {
      throw new Error('User not found')
    }

    return loginResp.users[0].token
  } catch (error) {
    throw new Error(
      `Something wrong with your whatsapp config please check again. error: ${error}`
    )
  }
}

const sendTextMessage = async ({
  recipient,
  message,
  token,
  baseUrl,
}: SendTextMessageParams): Promise<void> => {
  try {
    const auth = authorize('bearer', token)
    const url = `${baseUrl}/v1/messages`

    await sendHttpRequest({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      data: {
        to: recipient,
        type: 'text',
        // eslint-disable-next-line camelcase
        recipient_type: 'individual',
        text: {
          body: message,
        },
      },
    })
  } catch (error) {
    throw new Error(
      `Something wrong with your recipient number, Please check your country code: ${recipient} ${error}`
    )
  }
}

export const validator = dataBaseEmailSchemaValidator('WhatsApp').keys({
  url: Joi.string().uri().required().label('WhatsApp URL'),
  username: Joi.string().required().label('WhatsApp Username'),
  password: Joi.string().required().label('WhatsApp Password'),
  recipients: Joi.array()
    .items(Joi.string().label(`WhatsApp Recipients`))
    .label(`WhatsApp Recipients`),
})

export const send = async (
  data: WhatsappData,
  { body }: NotificationMessage
): Promise<void> => {
  const token = await loginUser(data)

  await Promise.all(
    data.recipients.map(async (recipient) => {
      await sendTextMessage({
        recipient,
        token,
        baseUrl: data.url,
        message: body,
      })
    })
  )
}
