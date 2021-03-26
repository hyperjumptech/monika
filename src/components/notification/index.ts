import {
  SMTPData,
  WebhookData,
  MailgunData,
  WhatsappData,
} from '../../interfaces/data'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { sendMailgun } from '../../utils/notifications/mailgun'
import {
  createSmtpTransport,
  sendSmtpMail,
} from '../../utils/notifications/smtp'
import { sendWebhook } from '../../utils/notifications/webhook'
import { sendSlack } from '../../utils/notifications/slack'
import { sendWhatsapp } from '../../utils/whatsapp'
import { ValidateResponseStatus, getMessageForAlert } from '../../utils/alert'

export async function sendAlerts({
  validation,
  notifications,
  url,
  status,
  incidentThreshold,
}: {
  validation: ValidateResponseStatus
  notifications: Notification[]
  url: string
  status: string
  incidentThreshold: number
}): Promise<
  Array<{
    alert: string
    notification: string
    url: string
  }>
> {
  const ipAddress = getIp()
  const message = getMessageForAlert({
    alert: validation.alert,
    url,
    ipAddress,
    status,
    incidentThreshold,
  })
  const sent = await Promise.all<any>(
    notifications.map((notification) => {
      switch (notification.type) {
        case 'mailgun': {
          return sendMailgun(
            {
              subject: message.subject,
              body: message.body,
              sender: {
                // TODO: Read from ENV Variables
                name: 'Monika',
                email: 'Monika@hyperjump.tech',
              },
              recipients: (notification?.data as MailgunData)?.recipients?.join(
                ','
              ),
            },
            notification
          ).then(() => ({
            notification: 'mailgun',
            alert: validation.alert,
            url,
          }))
        }
        case 'webhook': {
          return sendWebhook({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as WebhookData).then(() => ({
            notification: 'webhook',
            alert: validation.alert,
            url,
          }))
        }
        case 'slack': {
          return sendSlack({
            ...notification.data,
            body: {
              url,
              alert: validation.alert,
              time: new Date().toLocaleString(),
            },
          } as WebhookData).then(() => ({
            notification: 'slack',
            alert: validation.alert,
            url,
          }))
        }
        case 'smtp': {
          const transporter = createSmtpTransport(notification.data as SMTPData)
          return sendSmtpMail(transporter, {
            // TODO: Read from ENV Variables
            from: 'http-probe@hyperjump.tech',
            to: (notification?.data as SMTPData)?.recipients?.join(','),
            subject: message.subject,
            text: message.body,
          }).then(() => ({
            notification: 'smtp',
            alert: validation.alert,
            url,
          }))
        }
        case 'whatsapp': {
          const data = notification.data as WhatsappData
          return sendWhatsapp(data, validation.alert).then(() => ({
            notification: 'whatsapp',
            alert: validation.alert,
            url,
          }))
        }
        default: {
          return Promise.resolve({
            notification: '',
            alert: validation.alert,
            url,
          })
        }
      }
    })
  )

  return sent
}
