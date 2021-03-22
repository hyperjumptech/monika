import { Notification } from './notification'
import { Probe } from './probe'

export interface Config {
  notifications: Notification[]
  probes: Probe[]
}
