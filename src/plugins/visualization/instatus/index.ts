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
}

export type InstatusPageNotification = {
  id: string
  type: 'instatus'
  data: InstatusConfig
}

export const slug = 'instatus'
export const validator = Joi.object({
  apiKey: Joi.string().required().label('API Key'),
}).required()

export const validateConfig = (instatusPageConfig: InstatusConfig): string => {
  const { error } = validator.validate(instatusPageConfig)
  console.log(error, 'instatus err valid')

  return error ? `Instatus notification: ${error?.message}` : ''
}

export class InstatusPageAPI {
  private instatusPageBaseURL = 'https://api.instatus.com'
  private axiosConfig = {}
  pageID = {}
  components = {}

  constructor(apiKey: string) {
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

    this.pageID = axios
      .get(`${this.instatusPageBaseURL}/v2/pages`, this.axiosConfig)
      .then((res) => {
        return res.data[0]?.id.toString()
      })
      .catch((error) => {
        throw new Error(
          `${error?.message}${
            error?.data ? `. ${error?.response?.data?.message}` : ''
          }`
        )
      })
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
    const incident = await findIncident({
      probeID,
      status: 'INVESTIGATING',
      url,
    })

    // prevent duplicate incident
    if (incident) {
      return incident.incident_id
    }

    const status = 'INVESTIGATING'
    this.pageID = await this.pageID

    this.components = axios
      .get(
        `${this.instatusPageBaseURL}/v1/${this.pageID}/components`,
        this.axiosConfig
      )
      .then((res) => {
        return res.data[0]?.id
      })
      .catch((error) => {
        throw new Error(
          `${error?.message}${
            error?.data ? `. ${error?.response?.data?.message}` : ''
          }`
        )
      })

    this.components = await this.components

    const data = {
      name: 'Service is down',
      message: "We're currently investigating an issue with the Website",
      components: [this.components.toString()],
      started: `${Date.now()}`,
      status: status,
      notify: true,
      statuses: [
        {
          id: this.components.toString(),
          status: 'OPERATIONAL',
        },
      ],
    }

    try {
      const incidentID = await axios
        .post(
          `${this.instatusPageBaseURL}/v1/${this.pageID}/incidents/`,
          data,
          this.axiosConfig
        )
        .then((res) => {
          return res?.data?.id
        })
        .catch((error) => {
          throw new Error(
            `${error?.message}${
              error?.data ? `. ${error?.response?.data?.message}` : ''
            }`
          )
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
      throw new Error('Instatus notification: Incident is not found.')
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
}
