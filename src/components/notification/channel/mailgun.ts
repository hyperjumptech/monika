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

import Mailgun from 'mailgun.js'
import formData from 'form-data'
import { convertTextToHTML } from '../../../utils/text'
import { NotificationMessage } from '.'

type MailgunData = {
  apiKey: string
  domain: string
  recipients: string[]
  username?: string
}

export type MailgunNotification = {
  id: string
  type: 'mailgun'
  data: MailgunData
}

export const send = async (
  { apiKey: key, domain, recipients, username = 'api' }: MailgunData,
  { body, subject }: NotificationMessage
): Promise<void> => {
  // TODO: Read from ENV Variables
  const DEFAULT_EMAIL = 'monika@hyperjump.tech'
  const DEFAULT_SENDER_NAME = 'Monika'
  const to = recipients?.join(',')
  const html = convertTextToHTML(body)
  const mailgun = new Mailgun(formData)
  const mg = mailgun.client({ username, key })
  const data = {
    from: `${DEFAULT_SENDER_NAME} <${DEFAULT_EMAIL}>`,
    to,
    subject,
    html,
  }

  await mg.messages.create(domain, data)
}
