import * as path from 'path'
import axios from 'axios'
import { LoginBody } from '../interfaces/whatsapp'
import { authorize } from './authorization'
import { log } from 'console'

export const loginUser = async (baseUrl: string, creds: LoginBody) => {
  try {
    const auth = authorize(creds.authType, creds)
    const url = path.join(baseUrl, `/v1/users/login`)
    return axios.request({
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
      },
    })
  } catch (error) {
      log('Login Failed: ', error)
  }
}
