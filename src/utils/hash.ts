import { createHash } from 'crypto'
import { object } from 'joi'

export const md5Hash = (data: string | object) => {
  const str = typeof data === 'string' ? data : object.toString()
  return createHash('md5').update(str).digest('hex')
}
