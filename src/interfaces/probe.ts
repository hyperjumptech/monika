import { RequestConfig } from './request'

export interface Probe {
  id: number
  name: string
  description?: string
  request: RequestConfig
  alerts: string[]
}
