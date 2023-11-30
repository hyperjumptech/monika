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
import { ExponentialBackoff, handleAll, retry } from 'cockatiel'
import { EventEmitter } from 'events'
import mac from 'macaddress'
import { hostname } from 'os'
import path from 'path'
import Piscina from 'piscina'

import { getProbes } from '../components/config/probe'
import { updateConfig } from '../components/config'
import { getOSName } from '../components/notification/alert-message'
import { getContext } from '../context'
import events from '../events'
import { SYMON_API_VERSION, type MonikaFlags } from '../flag'
import { Config } from '../interfaces/config'
import { Probe } from '../interfaces/probe'
import { ValidatedResponse } from '../plugins/validate-response'
import { getEventEmitter } from '../utils/events'
import { DEFAULT_TIMEOUT } from '../utils/http'
import getIp from '../utils/ip'
import { log } from '../utils/pino'
import {
  getPublicIp,
  getPublicNetworkInfo,
  publicIpAddress,
  publicNetworkInfo,
} from '../utils/public-ip'

type SymonHandshakeData = {
  city: string
  country: string
  hostname: string
  isp: string
  locationId?: string
  macAddress: string
  monikaId?: string
  os: string
  pid: number
  privateIp: string
  publicIp: string
  version: string
}

type NotificationEvent = {
  probeID: string
  probeState: string
  url: string
  validation: ValidatedResponse
  alertId: string
}

type SymonClientParams = Pick<
  MonikaFlags,
  | 'symon-api-version'
  | 'symonKey'
  | 'symonLocationId'
  | 'symonMonikaId'
  | 'symonReportInterval'
  | 'symonReportLimit'
  | 'symonUrl'
>

const getHandshakeData = async (): Promise<SymonHandshakeData> => {
  await retry(handleAll, {
    backoff: new ExponentialBackoff(),
  }).execute(async () => {
    await getPublicNetworkInfo()
      .then(({ city, hostname, isp, privateIp, publicIp }) => {
        log.info(
          `[Symon] Monika is running from: ${city} - ${isp} (${publicIp}) - ${hostname} (${privateIp})`
        )
      })
      .catch((error) => {
        log.error(`[Symon] ${error}. Retrying...`)
        throw error
      })
  })
  await getPublicIp()

  const os = await getOSName()
  const macAddress = await mac.one()
  const host = hostname()
  const publicIp = publicIpAddress
  const privateIp = getIp()
  const { city, country, isp } = publicNetworkInfo!
  const { pid } = process
  const { userAgent: version } = getContext()

  return {
    city,
    country,
    hostname: host,
    isp,
    macAddress,
    os,
    pid,
    privateIp,
    publicIp,
    version,
  }
}

export default class SymonClient {
  private readonly eventEmitter: EventEmitter = getEventEmitter()
  private reportProbesInterval: number
  private worker
  private apiKey: string
  private getProbesInterval: NodeJS.Timeout | undefined
  private hasConnectionToSymon: boolean = false
  private httpClient: AxiosInstance
  private locationId: string
  private monikaId: string
  private reportProbesLimit: number
  private reportTimeout: NodeJS.Timeout | undefined
  private url: string

  constructor({
    'symon-api-version': apiVersion = SYMON_API_VERSION.v1,
    symonKey = '',
    symonLocationId = '',
    symonMonikaId = '',
    symonReportInterval = 10_000,
    symonReportLimit = 100,
    symonUrl = '',
  }: SymonClientParams) {
    this.apiKey = symonKey
    this.url = symonUrl
    this.httpClient = axios.create({
      baseURL: `${this.url}/api/${apiVersion}/monika`,
      headers: {
        'x-api-key': this.apiKey,
      },
      timeout: DEFAULT_TIMEOUT,
    })
    this.locationId = symonLocationId
    this.monikaId = symonMonikaId
    this.reportProbesInterval = symonReportInterval
    this.reportProbesLimit = symonReportLimit
    this.worker = new Piscina.Piscina({
      concurrentTasksPerWorker: 1,
      // eslint-disable-next-line unicorn/prefer-module
      filename: path.join(__dirname, '../../lib/workers/report-to-symon.js'),
      idleTimeout: this.reportProbesInterval,
      maxQueue: 1,
    })
  }

  async initiate(): Promise<void> {
    log.info('[Symon] Handshake starts')
    this.monikaId = await this.handshake()
    log.info('[Symon] Handshake succeed')

    log.info('[Symon] Send status')
    this.sendStatus({ isOnline: true })
      .then(() => {
        log.info('[Symon] Send status succeed')
      })
      .catch((error) => {
        log.error(`[Symon] Send status failed. ${(error as Error).message}`)
      })

    await this.fetchProbesAndUpdateConfig()
    this.getProbesInterval = setInterval(
      this.fetchProbesAndUpdateConfig.bind(this),
      getContext().flags.symonGetProbesIntervalMs
    )

    this.report().catch((error) => {
      this.hasConnectionToSymon = false
      log.error(`[Symon] Report failed. ${(error as Error).message}`)
    })

    this.eventEmitter.on(
      events.probe.notification.willSend,
      this.willSendEventListener.bind(this)
    )
  }

  async stop(): Promise<void> {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners()
    }

    clearInterval(this.getProbesInterval)

    clearTimeout(this.reportTimeout)

    await this.worker.destroy()
  }

  private willSendEventListener({
    probeState,
    validation,
    alertId,
  }: NotificationEvent) {
    log.info(
      `[Symon] Send ${
        probeState === 'DOWN' ? 'incident' : 'recovery'
      } event for Alert ID: ${alertId}`
    )

    const { data, headers, responseTime, status } = validation.response
    this.httpClient
      .post('/events', {
        monikaId: this.monikaId,
        alertId,
        event: probeState === 'DOWN' ? 'incident' : 'recovery',
        response: {
          body: data,
          headers: typeof headers === 'object' ? headers : {},
          size: headers['content-length'],
          status, // status is http status code
          time: responseTime,
        },
      })
      .catch((error) => {
        log.error(
          `[Symon] Send ${
            probeState === 'DOWN' ? 'incident' : 'recovery'
          } event for Alert ID: ${alertId} failed.  ${(error as Error).message}`
        )
      })
  }

  private async report(): Promise<void> {
    log.info('[Symon] Report')
    // Create a task data object
    const taskData = {
      apiKey: this.apiKey,
      hasConnectionToSymon: this.hasConnectionToSymon,
      httpClient: this.httpClient,
      monikaId: this.monikaId,
      probeIds: getProbes().map(({ id }) => id),
      reportProbesLimit: this.reportProbesLimit,
      url: this.url,
    }

    try {
      // Submit the task to Piscina
      await this.worker.run(JSON.stringify(taskData))
    } finally {
      this.reportTimeout = setTimeout(() => {
        this.report
          .bind(this)()
          .catch((error) => {
            this.hasConnectionToSymon = false
            log.error(`[Symon] Report failed. ${(error as Error).message}`)
          })
      }, this.reportProbesInterval)
    }
  }

  async sendStatus({ isOnline }: { isOnline: boolean }): Promise<void> {
    const { status } = await this.httpClient({
      data: {
        monikaId: this.monikaId,
        status: isOnline,
      },
      method: 'POST',
      url: '/status',
    })

    if (status === 200) {
      this.hasConnectionToSymon = true
    }
  }

  private async fetchProbes() {
    const TIMEOUT = 30_000

    return this.httpClient
      .get<{ data: Probe[] }>(`/${this.monikaId}/probes`, {
        timeout: TIMEOUT,
        headers: {
          ...(getContext().config?.version
            ? { 'If-None-Match': getContext().config?.version }
            : {}),
        },
        validateStatus(status) {
          return [200, 304].includes(status)
        },
      })
      .then(async (res) => {
        if (!res.data.data) {
          log.info('[Symon] No config changes')

          return {
            probes: getProbes(),
            hash: res.headers.etag,
          }
        }

        return { probes: res.data.data, hash: res.headers.etag }
      })
      .catch((error) => {
        if (error.isAxiosError) {
          if (error.response) {
            throw new Error(error.response.data.message)
          }

          if (error.request) {
            throw new Error('Failed to get probes from Symon')
          }
        }

        throw error
      })
  }

  private async fetchProbesAndUpdateConfig() {
    log.info('[Symon] Get probes')
    // Fetch the probes
    const { hash, probes } = await this.fetchProbes()
    const newConfig: Config = { probes, version: hash }
    await this.setConfig(newConfig)

    // Set connection to symon as true, because it could fetch the probes
    this.hasConnectionToSymon = true
    log.info('[Symon] Get probes succeed')
  }

  private async handshake(): Promise<string> {
    let handshakeData = await getHandshakeData()

    // Check if location id existed and is valid
    if (this.locationId && this.locationId.trim().length > 0) {
      const prevHandshakeData = handshakeData
      handshakeData = {
        ...prevHandshakeData,
        locationId: this.locationId,
      }
    }

    // Check if Monika id existed and is valid
    if (this.monikaId && this.monikaId.trim().length > 0) {
      const prevHandshakeData = handshakeData
      handshakeData = {
        ...prevHandshakeData,
        monikaId: this.monikaId,
      }
    }

    return this.httpClient
      .post('/client-handshake', handshakeData)
      .then((res) => res.data?.data.monikaId)
  }

  private async setConfig(newConfig: Config) {
    if (
      !newConfig.version ||
      getContext().config?.version === newConfig.version
    ) {
      log.info('[Symon] No config change')
      return
    }

    log.info('[Symon] Config changes. Reloading Monika')
    await updateConfig(newConfig)
  }
}
