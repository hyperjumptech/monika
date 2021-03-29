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
import { SMTPData } from '../../../interfaces/data'
import Mail from 'nodemailer/lib/mailer'

export const createSmtpTransport = (cfg: SMTPData) => {
  if (!cfg.hostname) throw new Error(`Smtp host is not provided!`)
  if (!cfg.port) throw new Error(`Smtp port is not provided!`)
  if (!cfg.username) throw new Error(`Smtp user is not provided!`)
  if (!cfg.password) throw new Error(`Smtp password is not provided!`)

  return nodemailer.createTransport({
    host: cfg.hostname,
    port: cfg.port,
    auth: { user: cfg.username, pass: cfg.password },
  })
}

export const sendSmtpMail = async (transporter: Mail, opt: Mail.Options) => {
  return transporter.sendMail({
    from: opt.from,
    to: opt.to,
    subject: opt.subject,
    text: opt.text,
  })
}
