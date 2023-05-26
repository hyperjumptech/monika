import type { ProbeRequestResponse } from '../../../interfaces/request'

export { probeHTTP } from './http'
export { probeMariaDB } from './mariadb'
export { probeMongo } from './mongo'
export { probePostgres } from './postgres'
export { probeRedis } from './redis'
export { probeSocket } from './socket'
export { probeScript } from './script'

export type ProbeResult = {
  isAlertTriggered: boolean
  logMessage: string
  requestResponse: ProbeRequestResponse
}
