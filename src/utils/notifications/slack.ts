import axios from 'axios'

import { WebhookData } from '../../interfaces/data'

export const sendSlack = async (data: WebhookData) => {
  try {
    if (!data.url) throw new Error(`Slack url is not provided`)

    const res = await axios({
      method: 'POST',
      url: data.url,
      data: {
        text: `*${data.body.alert}*\n\n*URL*: ${data.body.url}\n*TIME*: ${data.body.time}\n`,
      },
    })

    return res
  } catch (error) {
    throw error
  }
}
