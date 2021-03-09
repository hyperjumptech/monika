import * as nodemailer from 'nodemailer'
import { SMTPData } from '../interfaces/data'
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
    html: opt.html,
  })
}
