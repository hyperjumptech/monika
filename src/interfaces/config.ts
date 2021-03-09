import { Notification } from './notification'
import { Probe } from './probe'

export interface Config {
  interval?: number
  notifications: Notification[]
  probes: Probe[]
}
