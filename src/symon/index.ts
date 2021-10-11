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

import { hostname } from 'os'
import { getOSName } from '../components/notification/alert-message'
import getIp from '../utils/ip'
import {
  getPublicIp,
  getPublicNetworkInfo,
  publicIpAddress,
  publicNetworkInfo,
} from '../utils/public-ip'
import mac from 'macaddress'
import axios from 'axios'

type SymonHandshakeData = {
  macAddress: string
  host: string
  publicIp: string
  privateIp: string
  isp: string
  city: string
  pid: number
}

const getHanshakeData = async (): Promise<SymonHandshakeData> => {
  await getPublicNetworkInfo()
  await getPublicIp()
  await getOSName()

  const macAddress = await mac.one()
  const host = hostname()
  const publicIp = publicIpAddress
  const privateIp = getIp()
  const isp = publicNetworkInfo.isp
  const city = publicNetworkInfo.city
  const pid = process.pid

  return {
    macAddress,
    host,
    publicIp,
    privateIp,
    isp,
    city,
    pid,
  }
}

class SymonClient {
  url = ''

  apiKey = ''

  monikaId = ''

  configHash = ''

  constructor(url: string, apiKey: string) {
    this.url = url
    this.apiKey = apiKey
  }

  async initiate() {
    const handshakeData = await getHanshakeData()
    this.monikaId = await axios
      // TODO: Change the pathname when the endpoint is ready in symon-saas
      .post(`${this.url}/v1/monika/handshake`, handshakeData, {
        headers: {
          'x-api-key': this.apiKey,
        },
      })
      .then((res) => res.data?.monikaId)
  }
}

export default SymonClient
