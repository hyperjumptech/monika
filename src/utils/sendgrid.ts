import sgMail from '@sendgrid/mail'
import { SendgridData } from '../interfaces/data'
import { SendInput } from '../interfaces/mailgun'
import { Notification } from '../interfaces/notification'

export const sendSendgrid = async (
  inputData: SendInput,
  notifConfigItem: Notification
) => {
  const { subject, body, sender, recipients } = inputData
  const { data: sendgridConfigData } = notifConfigItem
  const API_KEY = (sendgridConfigData as SendgridData)?.apiKey

  sgMail.setApiKey(API_KEY)
  const msg = {
    to: recipients,
    from: sender.email,
    subject,
    text: body,
  }

  return sgMail.send(msg)
}
