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

export const dataBaseEmailSchemaValidator = (type: string) => {
  return Joi.object().keys({
    recipients: Joi.array()
      .items(Joi.string().email().label(`${type} Recipients`))
      .label(`${type} Recipients`),
  })
}

export const dataSMTPSchemaValidator = dataBaseEmailSchemaValidator(
  'SMTP'
).keys({
  hostname: Joi.string().required().label('SMTP Hostname'),
  port: Joi.number().port().required().label('SMTP Port'),
  username: Joi.string().required().label('SMTP Username'),
  password: Joi.string().required().label('SMTP Password'),
})

export const dataMailgunSchemaValidator = dataBaseEmailSchemaValidator(
  'Mailgun'
).keys({
  apiKey: Joi.string().required().label('Mailgun API Key'),
  domain: Joi.string().required().label('Mailgun Domain'),
  username: Joi.string().label('Mailgun Username'),
})

export const dataSendgridSchemaValidator = dataBaseEmailSchemaValidator(
  'Sendgrid'
).keys({
  apiKey: Joi.string().required().label('Sendgrid API Key'),
  sender: Joi.string().required().label('Sendgrid sender email'),
})

export const dataWebhookSchemaValidator = dataBaseEmailSchemaValidator(
  'Webhook'
).keys({
  url: Joi.string().uri().required().label('Webhook URL'),
})

export const dataSlackSchemaValidator = dataBaseEmailSchemaValidator(
  'Slack'
).keys({
  url: Joi.string().uri().required().label('Slack URL'),
})

export const dataTelegramSchemaValidator = dataBaseEmailSchemaValidator(
  'Telegram'
).keys({
  group_id: Joi.string().required().label('Telegram Group ID'),
  bot_token: Joi.string().required().label('Telegram Bot Token'),
})

export const dataWhatsappSchemaValidator = dataBaseEmailSchemaValidator(
  'WhatsApp'
).keys({
  url: Joi.string().uri().required().label('WhatsApp URL'),
  username: Joi.string().required().label('WhatsApp Username'),
  password: Joi.string().required().label('WhatsApp Password'),
  recipients: Joi.array()
    .items(Joi.string().label(`WhatsApp Recipients`))
    .label(`WhatsApp Recipients`),
})

export const dataTeamsSchemaValidator = dataBaseEmailSchemaValidator(
  'Teams'
).keys({
  url: Joi.string().uri().required().label('Teams URL'),
})

export const dataDiscordSchemaValidator = dataBaseEmailSchemaValidator(
  'Discord'
).keys({
  url: Joi.string().uri().required().label('Discord URL'),
})

export const dataMonikaNotifSchemaValidator = dataBaseEmailSchemaValidator(
  'MonikaNotif'
).keys({
  url: Joi.string().uri().required().label('Monika Notification URL'),
})

export const dataWorkplaceSchemaValidator = dataBaseEmailSchemaValidator(
  'Workplace'
).keys({
  thread_id: Joi.string().required().label('Workplace Thread ID'),
  access_token: Joi.string().required().label('Workplace Access Token'),
})

export const dataLarkSchemaValidator = dataBaseEmailSchemaValidator(
  'lark'
).keys({
  url: Joi.string().uri().required().label('Lark URL'),
})

export const dataGoogleChatSchemaValidator = dataBaseEmailSchemaValidator(
  'google-chat'
).keys({
  url: Joi.string().uri().required().label('Google URL'),
})
