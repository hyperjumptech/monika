import path from 'path'
import { log } from '../utils/pino'
import fs from 'fs'
import { getConfig } from '../components/config'
import {
  deleteFromAlerts,
  deleteFromNotifications,
  deleteFromProbeRequests,
} from '../components/logger/history'
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')

export function check_db_size() {
  const { db_limit } = getConfig()
  const stats = fs.statSync(dbPath)

  if (stats.size > db_limit.max_db_size) {
    deleteFromProbeRequests(db_limit.deleted_data)
    deleteFromNotifications(db_limit.deleted_data)
    deleteFromAlerts(db_limit.deleted_data)
  }

  log.info(`--- Actual file size in bytes: ${stats.size}`)
}
