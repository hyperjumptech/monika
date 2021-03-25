import axios from 'axios'

import { WebhookData } from '../../interfaces/data'

export const sendWebhook = async (data: WebhookData) => {
  try {
    if (!data.url) throw new Error(`Webhook url is not provided`)

    const res = await axios({
      method: 'POST',
      url: data.url,
      data: data.body,
    })

    return res
  } catch (error) {
    throw error
  }
}
