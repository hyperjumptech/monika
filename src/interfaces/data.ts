export interface MailData {
  recipients: string[]
}

export interface MailgunData extends MailData {
  apiKey: string
  domain: string
}

export interface SendgridData extends MailData {
  apiKey: string
}

export interface SMTPData extends MailData {
  hostname: string
  port: number
  username: string
  password: string
}

export interface WebhookData {
  url: string
  body: WebhookDataBody
}

export interface WebhookDataBody {
  url: string
  time: string
  alert: string
}

export interface WhatsappData extends MailData {
  url: string
  username: string
  password: string
}
