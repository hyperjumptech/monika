import axios from 'axios'

import { WebhookData } from '../interfaces/data'

export const sendWebhook = async (data: WebhookData) => {
  try {
    if (!data.url) throw new Error(`Webhook url is not provided`)

    if (data.method !== 'POST') {
      throw new Error(
        `Http method ${data.method} is not allowed. Webhook only allows POST.`
      )
    }

    const res = await axios({
      url: data.url,
      data: data.body,
      method: data.method,
    })

    return res
  } catch (error) {
    throw new Error(error)
  }
}
