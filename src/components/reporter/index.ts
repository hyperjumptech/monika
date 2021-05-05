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
import pako from 'pako'

import { Config } from '../../interfaces/config'
import { Probe } from '../../interfaces/probe'
import { Notification } from '../../interfaces/notification'
import getIp from '../../utils/ip'
import { HistoryLog } from '../logger/history'

export interface HQConfig {
  id: string
  url: string
  key: string
  interval?: number
}

export type HQResponse = {
  result: string
  data: {
    version: string
    probes?: Probe[]
    notifications?: Notification[]
  }
}

export const handshake = (config: Config): Promise<HQResponse> => {
  return axios
    .post(
      `${config.monikaHQ!.url}/handshake`,
      {
        monika: {
          id: config.monikaHQ!.id,
          ip_address: getIp(),
        },
        data: {
          probes: config.probes,
          notifications: config.notifications,
        },
      },
      {
        headers: {
          'x-api-key': config.monikaHQ!.key,
        },
      }
    )
    .then((res) => res.data)
}

type ReportData = (Omit<HistoryLog, 'id' | 'created_at' | 'reported'> & {
  timestamp: number
})[]

export const report = ({
  url,
  key,
  instanceId,
  configVersion,
  data,
}: {
  url: string
  key: string
  instanceId: string
  configVersion: string
  data: ReportData
}): Promise<HQResponse> => {
  return axios
    .post(
      `${url}/report`,
      {
        monika_instance_id: instanceId,
        config_version: configVersion,
        data,
      },
      {
        headers: {
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        transformRequest: (data) => pako.gzip(JSON.stringify(data)).buffer,
      }
    )
    .then((res) => res.data)
}
