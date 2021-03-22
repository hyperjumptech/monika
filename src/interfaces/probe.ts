import { RequestConfig } from './request'

export interface Probe {
  id: string
  name: string
  description?: string
  interval?: number
  request: RequestConfig
  trueThreshold: number
  falseThreshold: number
  alerts: string[]
}
