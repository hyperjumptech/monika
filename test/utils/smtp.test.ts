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

import { expect } from '@oclif/test'
import {
  createSmtpTransport,
  sendSmtpMail,
} from '../../src/components/notification/channel/smtp'
import Mail from 'nodemailer/lib/mailer'
import { SMTPData } from '../../src/interfaces/data'

const mailMock = require('nodemailer-mock')

const transport: Mail = mailMock.createTransport({
  host: '127.0.0.1',
  port: 2323,
})
const opt: Mail.Options = {
  from: 'me@example.com',
  to: 'symontest@example.com',
  subject: 'unit test',
  html: '<p>A unit test</p>',
}

describe('Smtp test', () => {
  describe('createSmtpTransport test', () => {
    it('should return transporter', async function () {
      const mockCfg: SMTPData = {
        hostname: 'smtp.symon.org',
        port: 587,
        username: 'me@symon.org',
        password: 'symonPass',
        recipients: ['symon@example.com'],
      }

      const res = createSmtpTransport(mockCfg)
      expect(res).instanceOf(Mail)
    })

    it('should throw hostname Error', async function () {
      const mockCfg: SMTPData = {
        hostname: '',
        port: 587,
        username: 'me@symon.org',
        password: 'symonPass',
        recipients: ['symon@example.com'],
      }

      expect(() => createSmtpTransport(mockCfg)).to.throw(
        'Smtp host is not provided!'
      )
    })

    it('should throw port Error', async function () {
      const mockCfg: SMTPData = {
        hostname: 'smtp.symon.org',
        port: 0,
        username: 'me@symon.org',
        password: 'symonPass',
        recipients: ['symon@example.com'],
      }

      expect(() => createSmtpTransport(mockCfg)).to.throw(
        `Smtp port is not provided!`
      )
    })

    it('should throw username Error', async function () {
      const mockCfg: SMTPData = {
        hostname: 'smtp.symon.org',
        port: 587,
        username: '',
        password: 'symonPass',
        recipients: ['symon@example.com'],
      }

      expect(() => createSmtpTransport(mockCfg)).to.throw(
        `Smtp user is not provided!`
      )
    })

    it('should throw password Error', async function () {
      const mockCfg = {
        hostname: 'smtp.symon.org',
        port: 587,
        username: 'me@symon.org',
        password: '',
        recipients: ['symon@example.com'],
      }

      expect(() => createSmtpTransport(mockCfg)).to.throw(
        `Smtp password is not provided!`
      )
    })
  })

  describe('sendSmtp test', () => {
    it('should return success info', async function () {
      transport.sendMail(opt, function () {
        return {
          accepted: ['successEmail'],
        }
      })

      const res = await sendSmtpMail(transport, {
        from: 'me@example.com',
        to: 'symontest@example.com',
        subject: 'unit test',
        html: '<p>A unit test</p>',
      })

      expect(res.accepted).length(1)
    })
  })
})
