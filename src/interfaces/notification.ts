import { MailgunData, SMTPData, SendgridData, WebhookData } from './data'

export interface Notification {
  id: string
  type: 'smtp' | 'mailgun' | 'sendgrid' | 'webhook'
  data: MailgunData | SMTPData | SendgridData | WebhookData
}
