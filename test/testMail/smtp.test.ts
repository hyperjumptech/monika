import { expect } from '@oclif/test'
import { createSmtpTransport, sendSmtpMail } from '../../src/utils/smtp'
import Mail from 'nodemailer/lib/mailer'
import { SMTPData } from '../../src/interfaces/data'

const mailMock = require('nodemailer-mock')

const transport: Mail = mailMock.createTransport({
  host: '127.0.0.1',
  port: 2323,
})
const opt: Mail.Options = {
  from: 'me@mail.com',
  to: 'symontest@mailinator.com',
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
        recipients: ['symon@mailinator.com'],
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
        recipients: ['symon@mailinator.com'],
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
        recipients: ['symon@mailinator.com'],
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
        recipients: ['symon@mailinator.com'],
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
        recipients: ['symon@mailinator.com'],
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
        from: 'me@mail.com',
        to: 'symontest@mailinator.com',
        subject: 'unit test',
        html: '<p>A unit test</p>',
      })

      expect(res.accepted).length(1)
    })
  })
})
