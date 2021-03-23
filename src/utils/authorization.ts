import { AxiosBasicCredentials } from 'axios'

export const authBasic = (cred: AxiosBasicCredentials) => {
  if (!cred.username)
    throw new Error('Username should not be empty or undefined')
  if (!cred.password || cred.password.length < 6)
    throw new Error('Password should not be empty or less than 6 character')

  const creds = cred.username + ':' + cred.password
  const buff = Buffer.from(creds)

  const result = buff.toString('base64')
  return `Basic ${result}`
}

export const authBearer = (token: string) => {
  return `Bearer ${token}`
}

export const authorize = (type: string, args: any) => {
  switch (type) {
    case 'basic':
      return authBasic(args)
    case 'bearer':
      return authBearer(args)
    default:
      return undefined
  }
}
