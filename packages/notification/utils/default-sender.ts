type Sender = {
  name: string
  email: string
}

export type InputSender = Partial<Sender>

let defaultSender: Sender = {
  name: 'Monika',
  email: 'monika@hyperjump.tech',
}

export function getSender(): Sender {
  return defaultSender
}

export function updateSender(sender: InputSender) {
  defaultSender = { ...defaultSender, ...sender }
}
