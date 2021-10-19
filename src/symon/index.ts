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

import axios, { AxiosInstance } from 'axios'
import mac from 'macaddress'
import { hostname } from 'os'

import { getOSName } from '../components/notification/alert-message'
import { Config } from '../interfaces/config'
import getIp from '../utils/ip'
import {
  getPublicIp,
  getPublicNetworkInfo,
  publicIpAddress,
  publicNetworkInfo,
} from '../utils/public-ip'
import { Probe } from '../interfaces/probe'

type SymonHandshakeData = {
  macAddress: string
  host: string
  publicIp: string
  privateIp: string
  isp: string
  city: string
  pid: number
}

type SymonClientEvent = {
  event: 'incident' | 'recovery'
  alertId: string
  response: {
    status: number
    time?: number
    size?: number
    headers?: Record<string, unknown>
    body?: unknown
  }
}

type ConfigListener = (config: Config) => void

const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.CI

const getHandshakeData = async (): Promise<SymonHandshakeData> => {
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
  monikaId = ''

  config: Config | null = null

  configHash = ''

  fetchProbesInterval = 60000 // 1 minute

  private httpClient: AxiosInstance

  private configListeners: ConfigListener[] = []

  constructor(url: string, apiKey: string) {
    this.httpClient = axios.create({
      baseURL: `${url}/v1/monika`,
      headers: {
        'x-api-key': apiKey,
      },
    })
  }

  async initiate() {
    this.monikaId = await this.handshake()

    await this.fetchProbesAndUpdateConfig()
    if (!isTestEnvironment) {
      setInterval(this.fetchProbesAndUpdateConfig, this.fetchProbesInterval)
    }
  }

  async notifyEvent(event: SymonClientEvent) {
    await this.httpClient.post('/events', { monikaId: this.monikaId, ...event })
  }

  // monika subscribes to config update by providing listener callback
  onConfig(listener: ConfigListener) {
    if (this.config) listener(this.config)

    this.configListeners.push(listener)

    // return unsubscribe function
    return () => {
      const index = this.configListeners.findIndex((cl) => cl === listener)
      this.configListeners.splice(index, 1)
    }
  }

  private async handshake(): Promise<string> {
    const handshakeData = await getHandshakeData()
    return this.httpClient
      .post('/client-handshake', handshakeData)
      .then((res) => res.data?.data.monikaId)
  }

  private async fetchProbes() {
    return this.httpClient
      .get<{ data: Probe[] }>(`/${this.monikaId}/probes`, {
        headers: {
          ...(this.configHash ? { 'If-None-Match': this.configHash } : {}),
        },
        validateStatus(status) {
          return [200, 304].includes(status)
        },
      })
      .then((res) => {
        return { probes: res.data.data, hash: res.headers.etag }
      })
  }

  private updateConfig(newConfig: Config, probesHash: string) {
    if (this.configHash !== probesHash) {
      this.config = newConfig
      this.configHash = probesHash
      this.configListeners.forEach((listener) => {
        listener(newConfig)
      })
    }
  }

  private async fetchProbesAndUpdateConfig() {
    const { probes, hash } = await this.fetchProbes()
    this.updateConfig({ probes }, hash)
  }
}

export default SymonClient
