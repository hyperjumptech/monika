/* eslint-disable no-console */
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
import { EventEmitter } from 'events'
import mac from 'macaddress'
import { hostname } from 'os'
import pako from 'pako'

import { getOSName } from '../components/notification/alert-message'
import { Config } from '../interfaces/config'
import { Probe } from '../interfaces/probe'
import getIp from '../utils/ip'
import {
  getPublicIp,
  getPublicNetworkInfo,
  publicIpAddress,
  publicNetworkInfo,
} from '../utils/public-ip'
import {
  getUnreportedLogs,
  deleteNotificationLogs,
  deleteRequestLogs,
} from '../components/logger/history'
import { log } from '../utils/pino'
import { getEventEmitter } from '../utils/events'
import events from '../events'
import { ValidatedResponse } from '../plugins/validate-response'

type SymonHandshakeData = {
  macAddress: string
  hostname: string
  publicIp: string
  privateIp: string
  isp: string
  city: string
  country: string
  pid: number
  os: string
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

type NotificationEvent = {
  probeID: string
  url: string
  probeState: string
  validation: ValidatedResponse
}

type ConfigListener = (config: Config) => void

const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.CI

const getHandshakeData = async (): Promise<SymonHandshakeData> => {
  await getPublicNetworkInfo()
  await getPublicIp()

  const os = await getOSName()
  const macAddress = await mac.one()
  const host = hostname()
  const publicIp = publicIpAddress
  const privateIp = getIp()
  const isp = publicNetworkInfo.isp
  const city = publicNetworkInfo.city
  const country = publicNetworkInfo.country
  const pid = process.pid

  return {
    macAddress,
    hostname: host,
    publicIp,
    privateIp,
    isp,
    city,
    country,
    pid,
    os,
  }
}

class SymonClient {
  monikaId = ''

  config: Config | null = null

  configHash = ''

  fetchProbesInterval = 60000 // 1 minute

  eventEmitter: EventEmitter | null = null

  private httpClient: AxiosInstance

  private configListeners: ConfigListener[] = []

  constructor(url: string, apiKey: string) {
    this.httpClient = axios.create({
      baseURL: `${url}/api/v1/monika`,
      headers: {
        'x-api-key': apiKey,
      },
    })
  }

  async initiate() {
    this.monikaId = await this.handshake()

    log.debug('Handshake succesful')

    this.eventEmitter = getEventEmitter()
    this.eventEmitter.on(
      events.probe.notification.willSend,
      (args: NotificationEvent) => {
        this.notifyEvent({
          event: args.probeState === 'DOWN' ? 'incident' : 'recovery',
          alertId: args.validation.alert.id ?? '',
          response: {
            status: args.validation.response.status,
            time: args.validation.response.responseTime,
            size: args.validation.response.headers['content-length'],
            headers: args.validation.response.headers ?? {},
            body: args.validation.response.data,
          },
        })
      }
    )

    await this.fetchProbesAndUpdateConfig()
    if (!isTestEnvironment) {
      setInterval(
        this.fetchProbesAndUpdateConfig.bind(this),
        this.fetchProbesInterval
      )
    }

    await this.report()
    if (!isTestEnvironment) {
      setInterval(this.report.bind(this), this.fetchProbesInterval)
    }
  }

  async notifyEvent(event: SymonClientEvent) {
    log.debug('Sending incident/recovery event to Symon')
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
    log.debug('Performing handshake with symon')
    const handshakeData = await getHandshakeData()
    return this.httpClient
      .post('/client-handshake', handshakeData)
      .then((res) => res.data?.data.monikaId)
  }

  private async fetchProbes() {
    log.debug('Getting probes from symon')
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
        if (res.data.data) {
          log.debug(`Received ${res.data.data.length} probes`)
        } else {
          log.debug(`No new config from Symon`)
        }
        return { probes: res.data.data, hash: res.headers.etag }
      })
      .catch((error) => {
        if (error.isAxiosError) {
          return Promise.reject(new Error(error.response.data.message))
        }
        return Promise.reject(error)
      })
  }

  private updateConfig(newConfig: Config) {
    if (newConfig.version && this.configHash !== newConfig.version) {
      log.debug(`Received config changes. Reloading monika`)
      this.config = newConfig
      this.configHash = newConfig.version
      this.configListeners.forEach((listener) => {
        listener(newConfig)
      })
    } else {
      log.debug(`Received config does not change.`)
    }
  }

  private async fetchProbesAndUpdateConfig() {
    try {
      const { probes, hash } = await this.fetchProbes()
      const newConfig: Config = { probes, version: hash }
      this.updateConfig(newConfig)
    } catch (error) {
      log.warn((error as any).message)
    }
  }

  async report() {
    log.debug('Reporting to symon')
    try {
      const limit = parseInt(process.env.MONIKA_REPORT_LIMIT ?? '100', 10)

      const logs = await getUnreportedLogs(limit)

      const requests = logs.requests

      const notifications = logs.notifications.map(({ id: _, ...n }) => n)

      if (requests.length === 0 && notifications.length === 0) {
        log.debug('Nothing to report')
        return
      }

      await this.httpClient({
        url: '/report',
        method: 'POST',
        data: {
          monikaId: this.monikaId,
          data: {
            requests,
            notifications,
          },
        },
        headers: {
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json',
        },
        transformRequest: (req) => pako.gzip(JSON.stringify(req)).buffer,
      })

      log.debug(
        `Reported ${requests.length} requests and ${notifications.length} notifications.`
      )

      await Promise.all([
        deleteRequestLogs(logs.requests.map((log) => log.id)),
        deleteNotificationLogs(logs.notifications.map((log) => log.id)),
      ])

      log.debug(
        `Deleted reported requests and notifications from local database.`
      )
    } catch (error) {
      log.warn(
        "Warning: Can't report history to Symon. " + (error as any).message
      )
    }
  }
}

export default SymonClient
