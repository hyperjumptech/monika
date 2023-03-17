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

import * as nodemailer from 'nodemailer'
import Mailgen from 'mailgen'
import Joi from 'joi'

import { convertTextToHTML } from '../../../utils/text'
import { dataBaseEmailSchemaValidator, type NotificationMessage } from '.'

type SMTPData = {
  hostname: string
  port: number
  username: string
  password: string
  recipients: string[]
}

export type SMTPNotification = {
  id: string
  type: 'smtp'
  data: SMTPData
}

const createSmtpTransport = ({
  hostname,
  password,
  port,
  username,
}: Omit<SMTPData, 'recipients'>): any => {
  return nodemailer.createTransport({
    host: hostname,
    port: port,
    auth: { user: username, pass: password },
  })
}

export const validator = dataBaseEmailSchemaValidator('SMTP').keys({
  hostname: Joi.string().required().label('SMTP Hostname'),
  port: Joi.number().port().required().label('SMTP Port'),
  username: Joi.string().required().label('SMTP Username'),
  password: Joi.string().required().label('SMTP Password'),
  recipients: Joi.array()
    .required()
    .items(Joi.string().label('Email recipients'))
    .label('Email recipients'),
})

export const send = async (
  data: SMTPData,
  { body, subject }: NotificationMessage
): Promise<void> => {
  // TODO: Read from ENV Variables
  const DEFAULT_EMAIL = 'monika@hyperjump.tech'
  const transporter = createSmtpTransport(data)
  const opt = {
    from: DEFAULT_EMAIL,
    to: data?.recipients?.join(','),
    subject,
    text: body,
  }
  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Monika',
      link: 'https://monika.hyperjump.tech/',
      logo: 'https://raw.githubusercontent.com/hyperjumptech/monika/main/docs/public/monika.svg',
    },
  })

  const toNew = (opt.to as string).replace(',', ', ')
  const email = {
    body: {
      name: `${toNew}`,
      intro: [`${opt.subject}`, convertTextToHTML(`${opt.text}`)],
    },
  }

  const emailTemplate = mailGenerator.generate(email)
  const to = (opt.to as string).split(',')

  await transporter.sendMail({
    from: opt.from,
    to: to,
    subject: opt.subject,
    html: emailTemplate,
  })
}
