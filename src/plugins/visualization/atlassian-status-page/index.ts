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

import Joi from 'joi'
import { sendHttpRequest } from '../../../utils/http'
import {
  findIncident,
  insertIncident as insertIncidentToDatabase,
  updateIncident as updateIncidentToDatabase,
} from './database'

type NotifyIncident = {
  probeID: string
  url: string
  type: 'incident' | 'recovery'
}
type Incident = Omit<NotifyIncident, 'type'>
type StatuspageConfig = {
  pageID: string
  apiKey: string
}
export type StatuspageNotification = {
  id: string
  type: 'statuspage'
  data: StatuspageConfig
}

export const slug = 'statuspage'
export const validator = Joi.object({
  pageID: Joi.string().required().label('Page ID'),
  apiKey: Joi.string().required().label('API Key'),
}).required()

export function validateConfig(statusPageConfig: StatuspageConfig): string {
  const { error } = validator.validate(statusPageConfig)

  return error ? `Statuspage notification: ${error?.message}` : ''
}

export class AtlassianStatusPageAPI {
  private statusPageBaseURL = 'https://api.statuspage.io'
  private pageID = ''
  private httpRequestConfig = {}

  constructor(apiKey: string, pageID: string) {
    this.pageID = pageID
    this.httpRequestConfig = {
      // 10 sec timeout
      timeout: 10_000,
      // follow up to 10 HTTP 3xx redirects
      maxRedirects: 10,
      headers: {
        Authorization: `OAuth ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
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

      default: {
        throw new Error(`Statuspage notification: type ${type} is unknown`)
      }
    }
  }

  private async createIncident({ probeID, url }: Incident): Promise<string> {
    const incident = await findIncident({
      probeID,
      status: 'investigating',
      url,
    })

    // prevent duplicate incident
    if (incident) {
      return incident.incident_id
    }

    const status = 'investigating'
    const data = {
      incident: {
        name: 'Service is down',
        status,
      },
    }
    const resp = (await sendHttpRequest({
      ...this.httpRequestConfig,
      url: `${this.statusPageBaseURL}/v1/pages/${this.pageID}/incidents`,
      body: JSON.stringify(data),
    }).then((resp) => resp.json())) as { id: string }
    const incidentID = resp?.id
    await insertIncidentToDatabase({ incidentID, probeID, status, url })

    return incidentID
  }

  private async updateIncident({ probeID, url }: Incident): Promise<string> {
    const status = 'resolved'
    const data = {
      incident: {
        name: 'Service is up',
        status,
      },
    }

    const incident = await findIncident({
      probeID,
      status: 'investigating',
      url,
    })

    if (!incident) {
      throw new Error('Statuspage notification: Incident is not found.')
    }

    const { incident_id: incidentID } = incident
    await sendHttpRequest({
      ...this.httpRequestConfig,
      url: `${this.statusPageBaseURL}/v1/pages/${this.pageID}/incidents/${incidentID}`,
      method: 'PATCH',
      body: JSON.stringify(data),
    })

    await updateIncidentToDatabase({ incidentID, status })

    return incidentID
  }
}
