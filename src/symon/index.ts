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
import type { AxiosInstance } from 'axios'
import { ExponentialBackoff, handleAll, retry } from 'cockatiel'
import { EventEmitter } from 'events'
import mac from 'macaddress'
import { hostname } from 'os'
import Piscina from 'piscina'
import { fileURLToPath } from 'node:url'

import type { Config } from '../interfaces/config.js'
import type { Probe } from '../interfaces/probe.js'
import type { ValidatedResponse } from '../plugins/validate-response/index.js'

import {
  addProbe,
  deleteProbe,
  getProbes,
  updateProbe,
} from '../components/config/probe.js'
import { updateConfig } from '../components/config/index.js'
import { validateProbes } from '../components/config/validation/validator/probe.js'
import { getOSName } from '../components/notification/alert-message.js'
import { getContext } from '../context/index.js'
import events from '../events/index.js'
import { SYMON_API_VERSION, type MonikaFlags } from '../flag.js'
import { getErrorMessage } from '../utils/catch-error-handler.js'
import { getEventEmitter } from '../utils/events.js'
import { DEFAULT_TIMEOUT } from '../utils/http.js'
import getIp from '../utils/ip.js'
import { log } from '../utils/pino.js'
import { removeProbeState, syncProbeStateFrom } from '../utils/probe-state.js'
import {
  getPublicIp,
  getPublicNetworkInfo,
  publicIpAddress,
  publicNetworkInfo,
} from '../utils/public-ip.js'

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

type LastEvent = {
  id: string
  alertId: string
  locationId: string
  recoveredAt: Date | null
}

type ProbeChange = {
  probe_id: string
  type: 'add' | 'delete' | 'disabled' | 'enabled' | 'update'
  created_at: Date
  probe: Probe
  lastEvent: LastEvent
}

type ProbeAssignmentTotal = { total: number; updatedAt?: Date }

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
  private probeChangesInterval: NodeJS.Timeout | undefined
  private probeAssignmentChangesInterval: NodeJS.Timeout | undefined
  private httpClient: AxiosInstance
  private locationId: string
  private monikaId: string
  private isMultiNode: boolean
  private probeAssignmentTotal: ProbeAssignmentTotal = {
    total: 0,
  }

  private probeChangesCheckedAt: Date | undefined
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
    this.httpClient = axios.default.create({
      baseURL: `${this.url}/api/${apiVersion}/monika`,
      headers: {
        'x-api-key': this.apiKey,
      },
      timeout: DEFAULT_TIMEOUT,
    })
    this.locationId = symonLocationId
    this.monikaId = symonMonikaId
    this.isMultiNode = apiVersion === SYMON_API_VERSION.v2
    this.reportProbesInterval = symonReportInterval
    this.reportProbesLimit = symonReportLimit
    this.worker = new Piscina.Piscina({
      concurrentTasksPerWorker: 1,
      filename: fileURLToPath(
        new URL('../../lib/workers/report-to-symon.js', import.meta.url)
      ),
      idleTimeout: this.reportProbesInterval,
      maxQueue: 1,
    })
  }

  async initiate(): Promise<void> {
    this.monikaId = await this.handshake()
    log.info('[Symon] Handshake')

    const probeChangesCheckedAt = new Date()

    await this.fetchProbesAndUpdateConfig()

    this.setProbeChangesCheckedAt(probeChangesCheckedAt)
    this.probeChangesInterval = setInterval(
      this.fetchAndApplyProbeChanges.bind(this),
      getContext().flags.symonGetProbesIntervalMs
    )

    if (this.isMultiNode) {
      this.probeAssignmentChangesInterval = setInterval(
        this.fetchAndApplyProbeAssignmentChanges.bind(this),
        getContext().flags.symonGetProbesIntervalMs
      )
    }

    this.report().catch((error) => {
      log.error(`[Symon] Report failed. ${(error as Error).message}`)
    })

    this.eventEmitter.on(
      events.probe.notification.willSend,
      this.willSendEventListener.bind(this)
    )
  }

  async sendStatus({ isOnline }: { isOnline: boolean }): Promise<void> {
    await this.httpClient({
      data: {
        monikaId: this.monikaId,
        status: isOnline,
      },
      method: 'POST',
      url: '/status',
    })
  }

  async stop(): Promise<void> {
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners()
    }

    clearInterval(this.probeChangesInterval)
    clearInterval(this.probeAssignmentChangesInterval)
    clearTimeout(this.reportTimeout)

    await this.worker.destroy()
  }

  private setProbeChangesCheckedAt(probeChangesCheckedAt: Date) {
    this.probeChangesCheckedAt = probeChangesCheckedAt
  }

  private async fetchAndApplyProbeChanges() {
    const probeChangesCheckedAt = new Date()

    try {
      const probeChanges = await this.probeChanges()
      this.setProbeChangesCheckedAt(probeChangesCheckedAt)

      const hasProbeChanges = probeChanges.length > 0
      if (!hasProbeChanges) {
        log.info(`[Symon] No probe changes since ${this.probeChangesCheckedAt}`)
        return
      }

      const probeChangesApplyResults = await applyProbeChanges(probeChanges)
      for (const result of probeChangesApplyResults) {
        if (result.status === 'rejected') {
          log.error(
            `[Symon] Get probe changes since ${this.probeChangesCheckedAt}. ${result.reason}`
          )
        }
      }

      log.info(
        `[Symon] Get probe changes (${probeChanges.length}) since ${this.probeChangesCheckedAt}`
      )
    } catch (error) {
      log.error(
        `[Symon] Get probe changes since ${
          this.probeChangesCheckedAt
        } failed. ${(error as Error).message}`
      )
    }
  }

  private willSendEventListener({
    probeState,
    validation,
    alertId,
  }: NotificationEvent) {
    const { data, headers, responseTime, status, error } = validation.response

    this.httpClient
      .post('/events', {
        monikaId: this.monikaId,
        alertId,
        event: probeState === 'DOWN' ? 'incident' : 'recovery',
        response: {
          body: data,
          headers: typeof headers === 'object' ? headers : {},
          size:
            typeof headers === 'object' ? headers['content-length'] : undefined,
          status, // status is http status code
          time: responseTime,
          error,
        },
      })
      .then(() => {
        log.info(
          `[Symon] Send ${
            probeState === 'DOWN' ? 'incident' : 'recovery'
          } event for Alert ID: ${alertId} succeed`
        )
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
    // Create a task data object
    const taskData = {
      apiKey: this.apiKey,
      httpClient: this.httpClient,
      monikaId: this.monikaId,
      probeIds: getProbes().map(({ id }) => id),
      reportProbesLimit: this.reportProbesLimit,
      url: this.url,
    }

    try {
      // Submit the task to Piscina
      await this.worker.run(JSON.stringify(taskData))
      log.info('[Symon] Report succeed')
    } finally {
      this.reportTimeout = setTimeout(() => {
        this.report
          .bind(this)()
          .catch((error) => {
            log.error(`[Symon] Report failed. ${(error as Error).message}`)
          })
      }, this.reportProbesInterval)
    }
  }

  private async probeChanges(): Promise<ProbeChange[]> {
    const response = await this.httpClient.get<{ data: ProbeChange[] }>(
      `/${this.monikaId}/probe-changes`,
      {
        params: { since: this.probeChangesCheckedAt },
      }
    )

    return response.data.data
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
          return {
            probes: getProbes(),
            hash: res.headers.etag,
          }
        }

        return { probes: res.data.data, hash: res.headers.etag }
      })
      .catch((error) => {
        if (axios.default.isAxiosError(error)) {
          if (error.response) {
            throw new Error(getErrorMessage(error))
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

    await setConfig(newConfig)
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

  private async fetchAndApplyProbeAssignmentChanges(): Promise<void> {
    const probeAssignmentTotal = await this.fetchProbeAssignmentTotal()
    const { total, updatedAt } = probeAssignmentTotal

    if (
      total !== this.probeAssignmentTotal.total ||
      updatedAt !== this.probeAssignmentTotal.updatedAt
    ) {
      await this.fetchProbesAndUpdateConfig()
      this.setProbeAssignmentTotal(probeAssignmentTotal)
      log.info('[Symon] The probe assignment has been updated')
    }
  }

  private setProbeAssignmentTotal(probeAssignmentTotal: ProbeAssignmentTotal) {
    this.probeAssignmentTotal = probeAssignmentTotal
  }

  private async fetchProbeAssignmentTotal(): Promise<{
    total: number
    updatedAt: Date
  }> {
    const response = await this.httpClient.get<{
      data: { total: number; updatedAt: Date }
    }>(`/${this.monikaId}/probe-assignments/total`)

    return response.data.data
  }
}

async function applyProbeChanges(probeChanges: ProbeChange[]) {
  return Promise.allSettled(
    probeChanges.map(async ({ lastEvent, probe, probe_id: probeId, type }) => {
      switch (type) {
        case 'delete':
        case 'disabled': {
          deleteProbe(probeId)
          removeProbeState(probeId)
          return
        }

        case 'update': {
          const probes = await validateProbes([
            lastEvent ? { ...probe, lastEvent } : probe,
          ])
          updateProbe(probeId, probes[0])
          syncProbeStateFrom(probes[0], 1)
          return
        }

        case 'add':
        case 'enabled': {
          const probes = await validateProbes([
            lastEvent ? { ...probe, lastEvent } : probe,
          ])
          addProbe(probes[0])
          syncProbeStateFrom(probes[0])
          return
        }

        default: {
          throw new Error(`Unknown probe changes type (${type}).`)
        }
      }
    })
  )
}

async function setConfig(newConfig: Config) {
  if (
    !newConfig.version ||
    getContext().config?.version === newConfig.version
  ) {
    return
  }

  log.info('[Symon] Config changes. Reloading Monika')
  await updateConfig(newConfig)
}
