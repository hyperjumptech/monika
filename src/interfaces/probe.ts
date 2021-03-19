import { RequestConfig } from './request'

export interface Probe {
  id: string
  name: string
  description?: string
  request: RequestConfig
  trueThreshold: number
  falseThreshold: number
  alerts: string[]
}
