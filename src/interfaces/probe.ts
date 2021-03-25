import { RequestConfig } from './request'

export interface Probe {
  id: string
  name: string
  description?: string
  interval?: number
  request: RequestConfig
  incidentThreshold: number
  recoveryThreshold: number
  alerts: string[]
}
