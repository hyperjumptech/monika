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

import sgMail from '@sendgrid/mail'
import Joi from 'joi'
import Mailgen from 'mailgen'
import type { NotificationMessage } from '.'

type NotificationData = {
  apiKey: string
  sender: string
  recipients: string[]
}

export const validator = Joi.object().keys({
  apiKey: Joi.string().required().label('SendGrid API Key'),
  sender: Joi.string().required().label('SendGrid sender email'),
  recipients: Joi.array()
    .required()
    .items(Joi.string().required().email().label('SendGrid email recipients'))
    .label('SendGrid recipients'),
})

export const send = async (
  { apiKey, recipients, sender }: NotificationData,
  { body, subject }: NotificationMessage
): Promise<void> => {
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
  const msg = {
    to,
    from: sender,
    subject,
    html,
    text,
  }

  sgMail.setApiKey(apiKey)
  await sgMail.send(msg)
}

export function additionalStartupMessage({
  recipients,
}: NotificationData): string {
  return `    Recipients: ${recipients.join(', ')}\n`
}
