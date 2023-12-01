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

import axios, { AxiosError } from 'axios'
import Joi from 'joi'
import {
  findIncident,
  insertIncident as insertIncidentToDatabase,
  updateIncident as updateIncidentToDatabase,
} from './database'
import http from 'http'
import https from 'https'
import type { NotificationMessage } from '..'
import type { AxiosRequestConfig } from 'axios'

type Incident = {
  probeID: string
  url: string
}

type InstatusConfig = {
  apiKey: string
  pageID: string
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

const BASE_URL = 'https://api.instatus.com'

export const validator = Joi.object({
  apiKey: Joi.string().required().label('API Key'),
  pageID: Joi.string().required().label('Page ID'),
}).required()

export async function send(
  notificationData: InstatusConfig,
  message: NotificationMessage
): Promise<void> {
  const { meta, summary } = message
  const { probeID, url, type } = meta

  switch (type) {
    case 'incident': {
      await createIncident(
        notificationData,
        {
          probeID,
          url,
        },
        summary
      )

      break
    }

    case 'recovery': {
      await updateIncident(notificationData, {
        probeID,
        url,
      })
      break
    }

    default: {
      break
    }
  }
}

async function createIncident(
  instatusConfig: InstatusConfig,
  { probeID, url }: Incident,
  message = "We're currently experiencing an issue with the website"
): Promise<void> {
  const status = 'INVESTIGATING'
  const incident = await findIncident({
    probeID,
    status,
    url,
  })

  // prevent duplicate incident
  if (incident) {
    return
  }

  try {
    const components = await getComponents(instatusConfig)
    const componentIDs: string[] = components.map(({ id }) => id)
    const componentID: string = componentIDs[0]
    const started = new Date()
    const statuses = componentIDs.map((id) => ({
      id,
      status: 'MAJOROUTAGE',
    }))
    const data = {
      name: 'Service is down',
      message,
      components: [componentID],
      started,
      status,
      notify: true,
      statuses,
    }
    const { apiKey, pageID } = instatusConfig
    const incidentID = await axios
      .post(`${BASE_URL}/v1/${pageID}/incidents/`, data, getAxiosConfig(apiKey))
      .then((res) => res?.data?.id)

    await insertIncidentToDatabase({ incidentID, probeID, status, url })
  } catch (error: unknown) {
    const axiosError = error instanceof AxiosError ? error : new AxiosError()
    throw new Error(
      `${axiosError?.message}${
        axiosError?.response?.data
          ? `. ${axiosError?.response?.data?.message}`
          : ''
      }`
    )
  }
}

async function updateIncident(
  instatusConfig: InstatusConfig,
  { probeID, url }: Incident
): Promise<void> {
  const status = 'RESOLVED'
  const components = await getComponents(instatusConfig)
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
  const incident = await findIncident({
    probeID,
    status: 'INVESTIGATING',
    url,
  })

  if (!incident) {
    throw new Error('Instatus notification: Incident is not found.')
  }

  const { incident_id: incidentID } = incident

  try {
    const { apiKey, pageID } = instatusConfig

    await axios.patch(
      `${BASE_URL}/v1/${pageID}/incidents/${incidentID}`,
      data,
      getAxiosConfig(apiKey)
    )
  } catch (error: unknown) {
    const axiosError = error instanceof AxiosError ? error : new AxiosError()
    throw new Error(
      `${axiosError.message}${
        axiosError?.response?.data
          ? `. ${axiosError?.response?.data?.message}`
          : ''
      }`
    )
  }

  await updateIncidentToDatabase({ incidentID, status })
}

async function getComponents({
  apiKey,
  pageID,
}: InstatusConfig): Promise<Component[]> {
  const componentsResponse = await axios.get(
    `${BASE_URL}/v1/${pageID}/components`,
    getAxiosConfig(apiKey)
  )

  return componentsResponse.data
}

function getAxiosConfig(apiKey: string): AxiosRequestConfig {
  return {
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
}
