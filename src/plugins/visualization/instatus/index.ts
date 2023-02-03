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
import Joi from 'joi'
import {
  findIncident,
  insertIncident as insertIncidentToDatabase,
  updateIncident as updateIncidentToDatabase,
} from './database'
import http from 'http'
import https from 'https'

type NotifyIncident = {
  probeID: string
  url: string
  type: 'incident' | 'recovery'
}
type Incident = Omit<NotifyIncident, 'type'>

type InstatusConfig = {
  apiKey: string
  pageID: string
}

export type InstatusPageNotification = {
  id: string
  type: 'instatus'
  data: InstatusConfig
}

type Component = {
  id: string
  name: string
  description: string
  status: string
  uniqueEmail: string
  showUptime: boolean
  order: number
  group: 'string' | null
}

export const slug = 'instatus'
export const validator = Joi.object({
  apiKey: Joi.string().required().label('API Key'),
  pageID: Joi.string().required().label('Page ID'),
}).required()

export const validateConfig = (instatusPageConfig: InstatusConfig): string => {
  const { error } = validator.validate(instatusPageConfig)

  return error ? `Instatus notification: ${error?.message}` : ''
}

export class InstatusPageAPI {
  private instatusPageBaseURL = 'https://api.instatus.com'
  private axiosConfig = {}
  private pageID = ''

  constructor(apiKey: string, pageID: string) {
    this.axiosConfig = {
      // 10 sec timeout
      timeout: 10_000,
      // keepAlive pools and reuses TCP connections, so it's faster
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
      // follow up to 10 HTTP 3xx redirects
      maxRedirects: 10,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }

    this.pageID = pageID
  }

  async notify({ probeID, url, type }: NotifyIncident): Promise<string> {
    switch (type) {
      case 'incident': {
        const incidentID = await this.createIncident({ probeID, url })

        return incidentID
      }

      case 'recovery': {
        const incidentID = await this.updateIncident({ probeID, url })

        return incidentID
      }

      default:
        throw new Error(`Instatus notification: type ${type} is unknown`)
    }
  }

  private async createIncident({ probeID, url }: Incident): Promise<string> {
    const status = 'INVESTIGATING'
    const incident = await findIncident({
      probeID,
      status,
      url,
    })

    // prevent duplicate incident
    if (incident) {
      return incident.incident_id
    }

    try {
      const components = await this.getComponents()
      const componentIDs: string[] = components.map(({ id }) => id)
      const componentID: string = componentIDs[0]
      const started = new Date()
      const statuses = componentIDs.map((id) => ({
        id,
        status: 'MAJOROUTAGE',
      }))
      const data = {
        name: 'Service is down',
        message: "We're currently experiencing an issue with the website",
        components: [componentID],
        started,
        status,
        notify: true,
        statuses,
      }

      const incidentID = await axios
        .post(
          `${this.instatusPageBaseURL}/v1/${this.pageID}/incidents/`,
          data,
          this.axiosConfig
        )
        .then((res) => {
          return res?.data?.id
        })

      insertIncidentToDatabase({ incidentID, probeID, status, url })

      return incidentID
    } catch (error: any) {
      throw new Error(
        `${error?.message}${
          error?.data ? `. ${error?.response?.data?.message}` : ''
        }`
      )
    }
  }

  private async updateIncident({ probeID, url }: Incident): Promise<string> {
    const incident = await findIncident({
      probeID,
      status: 'INVESTIGATING',
      url,
    })

    if (!incident) {
      throw new Error('Instatus notification: Incident is not found.')
    }

    const status = 'RESOLVED'
    const components = await this.getComponents()
    const componentIDs: string[] = components.map(({ id }) => id)
    const componentID: string = componentIDs[0]
    const started = new Date()
    const statuses = componentIDs.map((id) => ({
      id,
      status: 'OPERATIONAL',
    }))
    const data = {
      name: 'Service is up',
      components: [componentID],
      started,
      status,
      statuses,
    }
    const { incident_id: incidentID } = incident

    try {
      await axios.patch(
        `${this.instatusPageBaseURL}/v1/${this.pageID}/incidents/${incidentID}`,
        data,
        this.axiosConfig
      )
    } catch (error: any) {
      throw new Error(
        `${error?.message}${
          error?.data ? `. ${error?.response?.data?.message}` : ''
        }`
      )
    }

    await updateIncidentToDatabase({ incidentID, status })

    return incidentID
  }

  private async getComponents(): Promise<Component[]> {
    const componentsResponse = await axios.get(
      `${this.instatusPageBaseURL}/v1/${this.pageID}/components`,
      this.axiosConfig
    )

    return componentsResponse.data
  }
}
