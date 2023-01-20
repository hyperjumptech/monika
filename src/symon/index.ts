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

import PouchDB from 'pouchdb'
import {
  deleteNotificationLogs,
  deleteRequestLogs,
  getUnreportedLogs,
} from '../components/logger/history'
import { getOSName } from '../components/notification/alert-message'
import { getContext } from '../context'
import events from '../events'
import { Config } from '../interfaces/config'
import { Probe } from '../interfaces/probe'
import { setPauseProbeInterval } from '../looper'
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

let hasConnectionToSymon = false
let reportIntervalId: any

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

  private fetchProbesInterval: number // (ms)

  private reportProbesInterval: number // (ms)

  private reportProbesLimit: number

  private probes: Probe[] = []

  eventEmitter: EventEmitter | null = null

  private httpClient: AxiosInstance

  private locationId: string

  private configListeners: ConfigListener[] = []

  private isSymonExperimental: boolean

  private symonCouchDB: string

  private pouch: PouchDB.Database<Record<string, unknown>>

  private remotePouchDB: PouchDB.Database<Record<string, unknown>>

  constructor({
    url,
    apiKey,
    locationId,
    monikaId,
    reportInterval,
    reportLimit,
  }: {
    url: string
    apiKey: string
    locationId?: string | undefined
    monikaId?: string | undefined
    reportInterval?: number | undefined
    reportLimit?: number | undefined
  }) {
    this.httpClient = axios.create({
      baseURL: `${url}/api/v1/monika`,
      headers: {
        'x-api-key': apiKey,
      },
      timeout: DEFAULT_TIMEOUT,
    })

    this.locationId = locationId || ''

    this.monikaId = monikaId || ''

    this.fetchProbesInterval = Number.parseInt(
      process.env.FETCH_PROBES_INTERVAL ?? '60000',
      10
    )

    this.reportProbesInterval = reportInterval ?? 1000

    this.reportProbesLimit = reportLimit ?? 100

    const { flags } = getContext()

    this.isSymonExperimental = flags.symonExperimental
    this.symonCouchDB =
      flags.symonCouchDbURL || 'http://symon:symon@localhost:5984/symon'

    this.pouch = new PouchDB('symon')
    this.remotePouchDB = new PouchDB(this.symonCouchDB)
  }

  async initiate(): Promise<void> {
    this.monikaId = await this.handshake()
    await this.sendStatus({ isOnline: true })

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
    await this.setReportInterval()
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
          this.probes = res.data.data

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
    try {
      const { probes, hash } = await this.fetchProbes()
      const newConfig: Config = { probes, version: hash }
      this.updateConfig(newConfig)
      if (!hasConnectionToSymon) {
        hasConnectionToSymon = true
        await this.setReportInterval()
      }
    } catch (error) {
      log.warn((error as any).message)
    }
  }

  async report(): Promise<any> {
    if (!hasConnectionToSymon) {
      log.warn('Has no connection to symon')
      return
    }

    log.debug('Reporting to symon')
    try {
      const probeIds = this.probes.map((probe) => probe.id)
      const logs = await getUnreportedLogs(probeIds, this.reportProbesLimit)

      const requests = logs.requests

      const notifications = logs.notifications.map(({ id: _, ...n }) => n)

      if (requests.length === 0 && notifications.length === 0) {
        log.debug('Nothing to report')
        return
      }

      const reportData = {
        monikaId: this.monikaId,
        data: {
          requests,
          notifications,
        },
      }

      const id = new Date().toISOString()
      if (this.isSymonExperimental) {
        try {
          log.debug('Saving to couchDB')
          const pouchData = await this.pouch.put({ _id: id, ...reportData })

          const replicator = this.pouch.replicate.to(this.remotePouchDB, {
            live: true,
            retry: true,
          })

          // delete data on complete replication
          replicator.on('complete', async () => {
            console.log('complete replicating to remote DB')
            await Promise.all([
              deleteRequestLogs(logs.requests.map((log) => log.probeId)),
              deleteNotificationLogs(
                logs.notifications.map((log) => log.probeId)
              ),
            ])
            this.pouch.remove({ _id: pouchData.id, _rev: pouchData.rev })
            console.log('complete replicating to remote DB')
          })

          // log replication error
          replicator.on('error', function (err) {
            console.log('failed replicating to remote DB')
            console.log(err)
          })
        } catch (error) {
          console.error(`error occured : ${error}`)
        }
      }

      await this.httpClient({
        url: '/report',
        method: 'POST',
        data: reportData,
        headers: {
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json',
        },
        transformRequest: (req) => pako.gzip(JSON.stringify(req)).buffer,
      }).then(() => setPauseProbeInterval(false))

      log.debug(
        `Reported ${requests.length} requests and ${notifications.length} notifications.`
      )

      await Promise.all([
        deleteRequestLogs(logs.requests.map((log) => log.probeId)),
        deleteNotificationLogs(logs.notifications.map((log) => log.probeId)),
      ])

      log.debug(
        `Deleted reported requests and notifications from local database.`
      )
    } catch (error) {
      hasConnectionToSymon = false
      if (reportIntervalId) {
        setPauseProbeInterval(true)

        reportIntervalId = clearInterval(reportIntervalId)
        this.configHash = ''
      }

      log.error(
        "Warning: Can't report history to Symon. " + (error as any).message
      )
    }
  }

  async setReportInterval(): Promise<void> {
    try {
      if (!isTestEnvironment && !reportIntervalId) {
        reportIntervalId = setInterval(
          this.report.bind(this),
          this.reportProbesInterval
        )
      }
    } catch (error: any) {
      log.warn(`Warning: Can't set report interval. ${error?.message}`)
    }
  }

  async setPouchDBSettings(): Promise<void> {
    try {
      const { flags } = getContext()

      this.isSymonExperimental = flags.symonExperimental
      this.symonCouchDB =
        flags.symonCouchDbURL || 'http://symon:symon@localhost:5984/symon'
      this.pouch = new PouchDB('symon')
      this.remotePouchDB = new PouchDB(this.symonCouchDB)
    } catch (error: any) {
      log.warn(`Warning: Can't set pouch db settings. ${error?.message}`)
    }
  }

  async sendStatus({ isOnline }: { isOnline: boolean }): Promise<void> {
    try {
      await this.httpClient({
        url: '/status',
        method: 'POST',
        data: {
          monikaId: this.monikaId,
          status: isOnline,
        },
      })

      log.debug('Status successfully sent to Symon.')
    } catch (error: any) {
      log.warn(`Warning: Can't send status to Symon. ${error?.message}`)
    }
  }
}

export default SymonClient
