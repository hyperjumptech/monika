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

import FormData from 'form-data'
import Joi from 'joi'
import type { NotificationMessage } from '.'
import Mailgen from 'mailgen'
import { sendHttpRequest } from '../utils/http'

export type NotificationData = {
  apiKey: string
  domain: string
  recipients: string[]
  username?: string
}

export type Content = {
  from: string
  subject: string
  html: string
  text: string
  headerReference?: string
}

export const validator = Joi.object().keys({
  recipients: Joi.array()
    .required()
    .items(Joi.string().required().email().label('Mailgun Email Recipients'))
    .label('Mailgun Recipients'),
  apiKey: Joi.string().required().label('Mailgun API Key'),
  domain: Joi.string().required().label('Mailgun Domain'),
  username: Joi.string().label('Mailgun Username'),
})

export const send = async (
  { apiKey, domain, recipients, username = 'api' }: NotificationData,
  { body, subject }: NotificationMessage
): Promise<void> => {
  const url = `https://api.mailgun.net/v3/${domain}/messages`
  const auth = Buffer.from(username + ':' + apiKey).toString('base64')
  const data = getContent({ body, subject, domain })

  const formData = new FormData()
  formData.append('from', data.from)
  formData.append('subject', data.subject)
  formData.append('html', data.html)
  formData.append('text', data.text)
  for (const email of recipients) formData.append('to', email)

  await sendHttpRequest({
    method: 'POST',
    url,
    headers: {
      Authorization: 'Basic ' + auth,
    },
    data: formData,
  })
}

export function getContent({
  body,
  subject,
  domain,
}: {
  body: string
  subject: string
  domain: string
}): Content {
  // TODO: Read from ENV Variables
  const DEFAULT_SENDER_NAME = 'Monika'
  const from = `${DEFAULT_SENDER_NAME} <mailgun@${domain}>`

  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Monika',
      link: 'https://monika.hyperjump.tech/',
      logo: 'https://raw.githubusercontent.com/hyperjumptech/monika/main/docs/public/monika.svg',
    },
  })
  const email = {
    body: {
      intro: [subject, ...body.split(/\r?\n/)],
    },
  }
  const html = mailGenerator.generate(email)
  const text = mailGenerator.generatePlaintext(email)

  return {
    from,
    subject,
    html,
    text,
  }
}

export const sendWithCustomContent = async (
  { apiKey, domain, recipients, username = 'api' }: NotificationData,
  content: Content
): Promise<void> => {
  const url = `https://api.mailgun.net/v3/${domain}/messages`
  const auth = Buffer.from(username + ':' + apiKey).toString('base64')
  const data = content

  const formData = new FormData()
  formData.append('from', data.from)
  formData.append('subject', data.subject)
  formData.append('html', data.html)
  formData.append('text', data.text)
  for (const email of recipients) formData.append('to', email)
  if (data.headerReference)
    formData.append('h:References', data.headerReference)

  await sendHttpRequest({
    method: 'POST',
    url,
    headers: {
      Authorization: 'Basic ' + auth,
    },
    data: formData,
  })
}

export function additionalStartupMessage({
  domain,
  recipients,
}: NotificationData): string {
  return `    Recipients: ${recipients.join(', ')}\n    Domain: ${domain}\n`
}
