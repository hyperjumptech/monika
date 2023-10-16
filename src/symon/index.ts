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
import axios, { AxiosInstance } from 'axios'
import { ExponentialBackoff, handleAll, retry } from 'cockatiel'
import { EventEmitter } from 'events'
import mac from 'macaddress'
import { hostname } from 'os'
import Bree from 'bree'
import path from 'path'

import { updateConfig } from '../components/config'
import { getOSName } from '../components/notification/alert-message'
import { getContext } from '../context'
import type { MonikaFlags } from '../context/monika-flags'
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
import { validateProbes } from '../components/config/validation'

Bree.extend(require('@breejs/ts-worker'))

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
  version: string
  locationId?: string
  monikaId?: string
}

type SymonClientEvent = {
  event: 'incident' | 'recovery'
  alertId: string
  response: {
    status: number // httpStatus Code
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
  const pid = process.pid
  const { userAgent: version } = getContext()

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
    version,
  }
}

class SymonClient {
  monikaId = ''

  config: Config | null = null

  configHash = ''

  private apiKey = ''

  private url = ''

  private fetchProbesInterval: number // (ms)

  private reportProbesInterval = 10_000 // (ms)

  private reportProbesLimit: number

  private probes: Probe[] = []

  eventEmitter: EventEmitter | null = null

  private httpClient: AxiosInstance

  private locationId: string

  private configListeners: ConfigListener[] = []

  private bree = new Bree({
    root: false,
    defaultExtension:
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
        ? 'ts'
        : 'js',
    jobs: [],
    interval: this.reportProbesInterval,
    logger: log,
    doRootCheck: false,
    errorHandler: (error, workerMetadata) => {
      log.error(error)
      log.debug(workerMetadata)
    },
    outputWorkerMetadata: true,
  })

  constructor({
    symonUrl = '',
    symonKey = '',
    symonLocationId,
    symonMonikaId,
    symonReportInterval,
    symonReportLimit,
    'symon-api-version': apiVersion,
  }: Pick<
    MonikaFlags,
    | 'symon-api-version'
    | 'symonUrl'
    | 'symonKey'
    | 'symonLocationId'
    | 'symonMonikaId'
    | 'symonReportInterval'
    | 'symonReportLimit'
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
          event: probeState === 'DOWN' ? 'incident' : 'recovery',
          alertId: getAlertID({ url, validation }),
          response: {
            status: validation.response.status, // status is http status code
            time: validation.response.responseTime,
            size: validation.response.headers['content-length'],
            headers: validation.response.headers || {},
            body: validation.response.data,
          },
        }).catch((error: any) => {
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
  onConfig(listener: ConfigListener): any {
    if (this.config) listener(this.config)

    this.configListeners.push(listener)

    // return unsubscribe function
    return () => {
      const index = this.configListeners.indexOf(listener)
      this.configListeners.splice(index, 1)
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

  private async fetchProbes() {
    log.debug('Getting probes from symon')
    const TIMEOUT = 30_000

    return this.httpClient
      .get<{ data: Probe[] }>(`/${this.monikaId}/probes`, {
        timeout: TIMEOUT,
        headers: {
          ...(this.configHash ? { 'If-None-Match': this.configHash } : {}),
        },
        validateStatus(status) {
          return [200, 304].includes(status)
        },
      })
      .then(async (res) => {
        if (!res.data.data) {
          log.info('No config changes from Symon')

          return { probes: this.probes, hash: res.headers.etag }
        }

        const validatedProbes = await validateProbes(res.data.data)
        this.probes = validatedProbes
        log.info(`Received ${validatedProbes.length} probes`)

        return { probes: validatedProbes, hash: res.headers.etag }
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

  private async fetchProbesAndUpdateConfig() {
    // Fetch the probes
    const { probes, hash } = await this.fetchProbes()
    const newConfig: Config = { probes, version: hash }
    this.updateConfig(newConfig)

    // If it has no connection to Symon, set as true
    // Because it could fetch the probes
    if (!hasConnectionToSymon) {
      hasConnectionToSymon = true
    }
  }

  async report(): Promise<any> {
    try {
      log.debug('Reporting to Symon')

      // Updating requests and notifications to report
      const probeIds = this.probes.map((probe: Probe) => probe.id)

      // Creating/updating report job
      const jobInterval = this.reportProbesInterval / 1000 // Convert probes interval to second
      const jobData = {
        hasConnectionToSymon,
        probeIds,
        reportProbesLimit: this.reportProbesLimit,
        httpClient: this.httpClient,
        monikaId: this.monikaId,
        url: this.url,
        apiKey: this.apiKey,
      }

      // Find existing report job
      const reportJob = this.bree.config.jobs.find(
        ({ name }) => name === 'report'
      )

      // If the report job is already created
      if (reportJob) {
        // Update the report job worker data with the new prepared worker data
        await this.bree.remove('report')
        await this.bree.add({
          name: 'report',
          interval: `every ${jobInterval} seconds`,
          outputWorkerMetadata: true,
          path: path.resolve(
            __dirname,
            `bree/report.${this.bree.config.defaultExtension}`
          ),
          worker: {
            workerData: {
              data: JSON.stringify(jobData),
            },
          },
        })
        await this.bree.start('report')
      } else {
        // Create the report job with the prepared worker data
        await this.bree.add({
          name: 'report',
          interval: `every ${jobInterval} seconds`,
          outputWorkerMetadata: true,
          path: path.resolve(
            __dirname,
            `bree/report.${this.bree.config.defaultExtension}`
          ),
          worker: {
            workerData: {
              data: JSON.stringify(jobData),
            },
          },
        })
        await this.bree.start('report')
      }
    } catch (error) {
      hasConnectionToSymon = false
      this.configHash = ''
      log.error("Can't report history to Symon. " + (error as any).message)

      await this.report()
    }
  }

  async sendStatus({ isOnline }: { isOnline: boolean }): Promise<void> {
    try {
      const response = await this.httpClient({
        url: '/status',
        method: 'POST',
        data: {
          monikaId: this.monikaId,
          status: isOnline,
        },
      })

      if (response.status === 200) {
        hasConnectionToSymon = true
      }

      log.debug('Status successfully sent to Symon.')
    } catch (error: any) {
      log.warn(`Warning: Can't send status to Symon. ${error?.message}`)
    }
  }

  async stopReport(): Promise<void> {
    await this.bree.stop()
  }
}

export default SymonClient
