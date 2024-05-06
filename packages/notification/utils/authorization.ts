/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import type { AxiosBasicCredentials } from 'axios'

type BasicCredentials = {
  type: 'basic'
} & AxiosBasicCredentials

type Bearer = { type: 'bearer'; token: string }

export const authBasic = (cred: AxiosBasicCredentials): string => {
  if (!cred.username)
    throw new Error('Username should not be empty or undefined')
  if (!cred.password || cred.password.length < 6)
    throw new Error('Password should not be empty or less than 6 character')

  const creds = cred.username + ':' + cred.password
  const buff = Buffer.from(creds)

  const result = buff.toString('base64')
  return `Basic ${result}`
}

export const authBearer = (token: string): string => `Bearer ${token}`

export const authorize = (
  args: BasicCredentials | Bearer
): string | undefined => {
  switch (args.type) {
    case 'basic': {
      return authBasic(args)
    }

    case 'bearer': {
      return authBearer(args.token)
    }

    default: {
      return undefined
    }
  }
}
