import { RequestConfig } from './request'

export interface Probe {
  id: string
  name: string
  description?: string
  request: RequestConfig
  successThreshold: number
  failedThreshold: number
  alerts: string[]
}
