import mailgun = require('mailgun-js')
import { MailgunData } from '../interfaces/data'
import { SendInput } from '../interfaces/mailgun'
import { Notification } from '../interfaces/notification'

export const sendMailgun = async (
  inputData: SendInput,
  notifConfigItem: Notification
) => {
  const { subject, body, sender, recipients } = inputData
  const { data: mailgunConfigData } = notifConfigItem
  const DOMAIN = (mailgunConfigData as MailgunData)?.domain
  const API_KEY = (mailgunConfigData as MailgunData)?.apiKey

  const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN })
  const data = {
    from: `${sender.name} <${sender.email}>`,
    to: recipients,
    subject: subject,
    text: body,
  }
  return mg.messages().send(data)
}
