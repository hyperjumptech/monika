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

/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-node-protocol */

import axios, { AxiosInstance } from 'axios'
import Bree from 'bree'
import { ExponentialBackoff, handleAll, retry } from 'cockatiel'
import { EventEmitter } from 'events'
import mac from 'macaddress'
import { hostname } from 'os'
import Piscina from 'piscina'

import type { MonikaFlags } from '../flag'

import { updateConfig } from '../components/config'
import { getOSName } from '../components/notification/alert-message'
import { getContext } from '../context'
import events from '../events'
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

type SymonClientEvent = {
  alertId: string
  event: 'incident' | 'recovery'
  response: {
    body?: unknown
    headers?: Record<string, unknown>
    size?: number
    status: number // httpStatus Code
    time?: number
  }
}

type NotificationEvent = {
  probeID: string
  probeState: string
  url: string
  validation: ValidatedResponse
}

type ConfigListener = (config: Config) => void

const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.CI

let hasConnectionToSymon = false

const getHandshakeData = async (): Promise<SymonHandshakeData> => {
  await retry(handleAll, {
    backoff: new ExponentialBackoff(),
  }).execute(async () => {
    await getPublicNetworkInfo()
      .then(({ city, hostname, isp, privateIp, publicIp }) => {
        log.info(
          `Monika is running from: ${city} - ${isp} (${publicIp}) - ${hostname} (${privateIp})`
        )
      })
      .catch((error) => {
        log.error(`${error}. Retrying...`)
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

class SymonClient {
  config: Config | null = null

  configHash = ''

  eventEmitter: EventEmitter | null = null

  monikaId = ''

  private apiKey = ''

  private configListeners: ConfigListener[] = [] // (ms)

  private fetchProbesInterval: number

  private httpClient: AxiosInstance

  private locationId: string

  private piscina = new Piscina.Piscina({
    filename:
      process.env.NODE_ENV === 'development'
        ? `${__dirname}/worker.ts`
        : `${__dirname}/worker.js`,

    maxQueue: 1,
  })

  private probes: Probe[] = []

  private reportProbesInterval = 10_000

  private reportProbesLimit: number

  private url = ''

  private workerBree = new Bree({
    defaultExtension:
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
        ? 'ts'
        : 'js',
    doRootCheck: false,
    errorHandler(error, workerMetadata) {
      log.error(error)
      log.debug(workerMetadata)
    },
    interval: this.reportProbesInterval,
    jobs: [],
    logger: log,
    outputWorkerMetadata: true,
    root: false,
  })

  constructor({
    'symon-api-version': apiVersion,
    symonKey = '',
    symonLocationId,
    symonMonikaId,
    symonReportInterval,
    symonReportLimit,
    symonUrl = '',
  }: Pick<
    MonikaFlags,
    | 'symon-api-version'
    | 'symonKey'
    | 'symonLocationId'
    | 'symonMonikaId'
    | 'symonReportInterval'
    | 'symonReportLimit'
    | 'symonUrl'
  >) {
    this.httpClient = axios.create({
      baseURL: `${symonUrl}/api/${apiVersion}/monika`,
      headers: {
        'x-api-key': symonKey,
      },
      timeout: DEFAULT_TIMEOUT,
    })

    this.url = symonUrl

    this.apiKey = symonKey

    this.locationId = symonLocationId || ''

    this.monikaId = symonMonikaId || ''

    this.fetchProbesInterval = Number.parseInt(
      process.env.FETCH_PROBES_INTERVAL ?? '60000',
      10
    )

    this.reportProbesInterval = symonReportInterval ?? 10_000

    this.reportProbesLimit = symonReportLimit ?? 100
  }

  async initiate(): Promise<void> {
    this.monikaId = await this.handshake()
    await this.sendStatus({ isOnline: true })

    log.debug('Handshake succesful')

    this.eventEmitter = getEventEmitter()
    this.eventEmitter.on(
      events.probe.notification.willSend,
      ({ probeID, probeState, url, validation }: NotificationEvent) => {
        const getAlertID = ({
          url,
          validation,
        }: Pick<NotificationEvent, 'url' | 'validation'>): string => {
          if (validation.alert.id) {
            return validation.alert.id
          }

          const probe = getContext().config?.probes.find(
            ({ id }) => id === probeID
          )
          if (!probe) {
            return ''
          }

          const request = probe.requests?.find((request) => request.url === url)
          if (!request) {
            return ''
          }

          return request.alerts?.find((alert) => alert.query === '')?.id || ''
        }

        this.notifyEvent({
          alertId: getAlertID({ url, validation }),
          event: probeState === 'DOWN' ? 'incident' : 'recovery',
          response: {
            body: validation.response.data,
            headers: validation.response.headers || {},
            size: validation.response.headers['content-length'],
            status: validation.response.status, // status is http status code
            time: validation.response.responseTime,
          },
        }).catch((error: unknown) => {
          log.error(error)
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
    this.onConfig((config) => updateConfig(config, false))
  }

  async notifyEvent(event: SymonClientEvent): Promise<void> {
    log.debug('Sending incident/recovery event to Symon')
    await this.httpClient.post('/events', { monikaId: this.monikaId, ...event })
  }

  // monika subscribes to config update by providing listener callback
  onConfig(listener: ConfigListener): unknown {
    if (this.config) listener(this.config)

    this.configListeners.push(listener)

    // return unsubscribe function
    return () => {
      const index = this.configListeners.indexOf(listener)
      this.configListeners.splice(index, 1)
    }
  }

  async report(): Promise<void> {
    try {
      log.debug('Reporting to Symon')

      // Updating requests and notifications to report
      const probeIds = this.probes.map((probe: Probe) => probe.id)

      // Create a task data object
      const taskData = {
        apiKey: this.apiKey,
        hasConnectionToSymon,
        httpClient: this.httpClient,
        monikaId: this.monikaId,
        probeIds,
        reportProbesLimit: this.reportProbesLimit,
        url: this.url,
      }

      console.log(probeIds.length)

      // Submit the task to Piscina
      await this.piscina.run(taskData)
    } catch (error) {
      hasConnectionToSymon = false
      this.configHash = ''
      log.error("Can't report history to Symon. " + (error as Error).message)
    } finally {
      setInterval(async () => {
        await this.report()
      }, this.reportProbesInterval)
    }
  }

  async sendStatus({ isOnline }: { isOnline: boolean }): Promise<void> {
    try {
      const response = await this.httpClient({
        data: {
          monikaId: this.monikaId,
          status: isOnline,
        },
        method: 'POST',
        url: '/status',
      })

      if (response.status === 200) {
        hasConnectionToSymon = true
      }

      log.debug('Status successfully sent to Symon.')
    } catch (error: unknown) {
      log.warn(
        `Warning: Can't send status to Symon. ${(error as Error).message}`
      )
    }
  }

  async stopReport(): Promise<void> {
    await this.workerBree.stop()
  }

  private async fetchProbes() {
    log.debug('Getting probes from symon')
    const TIMEOUT = 30_000

    return this.httpClient
      .get<{ data: Probe[] }>(`/${this.monikaId}/probes`, {
        headers: {
          ...(this.configHash ? { 'If-None-Match': this.configHash } : {}),
        },
        timeout: TIMEOUT,
        validateStatus(status) {
          return [200, 304].includes(status)
        },
      })
      .then((res) => {
        if (res.data.data) {
          this.probes = res.data.data

          log.debug(`Received ${res.data.data.length} probes`)
        } else {
          log.debug(`No new config from Symon`)
        }

        return { hash: res.headers.etag, probes: res.data.data }
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
    // Fetch the probes
    const { hash, probes } = await this.fetchProbes()
    const newConfig: Config = { probes, version: hash }
    this.updateConfig(newConfig)

    // If it has no connection to Symon, set as true
    // Because it could fetch the probes
    if (!hasConnectionToSymon) {
      hasConnectionToSymon = true
    }
  }

  private async handshake(): Promise<string> {
    log.debug('Performing handshake with symon')
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

  private updateConfig(newConfig: Config): void {
    if (newConfig.version && this.configHash !== newConfig.version) {
      log.debug(`Received config changes. Reloading monika`)
      this.config = newConfig
      this.configHash = newConfig.version
      for (const listener of this.configListeners) {
        listener(newConfig)
      }
    } else {
      log.debug(`Received config does not change.`)
    }
  }
}

export default SymonClient
