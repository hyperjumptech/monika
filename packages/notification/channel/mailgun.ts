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
import Joi from 'joi'
import type { NotificationMessage } from '.'
import Mailgen from 'mailgen'

type NotificationData = {
  apiKey: string
  domain: string
  recipients: string[]
  username?: string
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
  { apiKey: key, domain, recipients, username = 'api' }: NotificationData,
  { body, subject }: NotificationMessage
): Promise<void> => {
  // TODO: Read from ENV Variables
  const DEFAULT_EMAIL = 'monika@hyperjump.tech'
  const DEFAULT_SENDER_NAME = 'Monika'
  const to = recipients?.join(',')
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
  const mailgun = new Mailgun(formData)
  const mg = mailgun.client({ username, key })
  const data = {
    from: `${DEFAULT_SENDER_NAME} <${DEFAULT_EMAIL}>`,
    to,
    subject,
    html,
    text,
  }

  await mg.messages.create(domain, data)
}

export function additionalStartupMessage({
  domain,
  recipients,
}: NotificationData): string {
  return `    Recipients: ${recipients.join(', ')}\n    Domain: ${domain}\n`
}
