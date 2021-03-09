interface Sender {
  name: string
  email: string
}

export interface SendInput {
  subject: string
  body: string
  sender: Sender
  recipients: string
}
