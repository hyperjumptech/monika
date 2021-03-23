import axios from 'axios'
import { LoginUserSuccessResponse } from '../interfaces/whatsapp'
import { authorize } from './authorization'
import { log } from 'console'
import { WhatsappData } from '../interfaces/data'

export const loginUser = async (data: WhatsappData) => {
  try {
    const auth = authorize('basic', {
      username: data.username,
      password: data.password,
    })

    const url = `${data.url}/v1/users/login`
    const resp = await axios.request({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    })
    const loginResp: LoginUserSuccessResponse = resp?.data

    if (loginResp.users?.length > 0) return loginResp.users[0].token
  } catch (error) {
    log('Login Failed: ', error)
  }
}

export const sendTextMessage = async ({
  recipient,
  message,
  token,
  baseUrl,
}: {
  recipient: string
  message: string
  token: string
  baseUrl: string
}) => {
  try {
    const auth = authorize('bearer', token)
    const url = `${baseUrl}/v1/messages`

    return axios.request({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
      data: {
        to: recipient,
        type: 'text',
        recipient_type: 'individual',
        text: {
          body: message,
        },
      },
    })
  } catch (error) {
    log('Fail sending text message: ', error)
  }
}
