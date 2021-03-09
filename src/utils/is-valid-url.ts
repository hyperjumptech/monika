import { URL } from 'url'

export const isValidURL = (data: string) => {
  try {
    const url = new URL(data)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}
