import {
  MailgunData,
  SMTPData,
  SendgridData,
  WebhookData,
  WhatsappData,
} from './data'

export interface Notification {
  id: string
  type: 'smtp' | 'mailgun' | 'sendgrid' | 'webhook' | 'slack' | 'whatsapp'
  data: MailgunData | SMTPData | SendgridData | WebhookData | WhatsappData
}
