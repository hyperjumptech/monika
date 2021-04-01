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

import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import FormData from 'form-data'

import { Config } from '../../interfaces/config'
import { Probe } from '../../interfaces/probe'
import getIp from '../../utils/ip'

export interface HQConfig {
  url: string
  key: string
}

// store config after successfull handshake
const configStore = new Map<keyof HQConfig | 'version', string>()

type HandshakeResponseData = {
  result: 'ok'
  data: {
    'config-version': string
  }
}

export const handshake = (config: Config) => {
  return axios
    .post<HandshakeResponseData>(
      `${config.monikaHQ!.url}/api/handshake`,
      {
        monika: {
          id: uuidv4(),
          ip_address: getIp(),
        },
        data: {
          probes: config.probes,
          notifications: config.notifications,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.monikaHQ!.key}`,
        },
      }
    )
    .then((res) => {
      configStore.set('url', config.monikaHQ!.url)
      configStore.set('key', config.monikaHQ!.key)
      configStore.set('version', res.data.data['config-version'])
      return res.data
    })
}

type ReportResponseData = {
  result: 'ok' | 'updated'
  data: {
    'config-version': string
    probes: Probe[]
    notifications: Notification[]
  }
}

export const report = (archive: File) => {
  // it is much easier getting these values from local store
  // than getting it from function argument,
  // because doing so will change lot of codes.
  // I think this is safe because report function will never be called before handshake
  const url = configStore.get('url')
  const key = configStore.get('key')
  const version = configStore.get('version')

  const form = new FormData()
  form.append(
    'monika',
    JSON.stringify({
      id: uuidv4(),
      ip_address: getIp(),
      'config-version': version,
    })
  )
  form.append('attachment', archive)

  return axios
    .post<ReportResponseData>(`${url}/api/handshake`, form, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
    .then((res) => res.data)
}
