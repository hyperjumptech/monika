import { RequestConfig } from './request'

export interface Probe {
  id: string
  name: string
  description?: string
  request: RequestConfig
  threshold: number
  alerts: string[]
}
