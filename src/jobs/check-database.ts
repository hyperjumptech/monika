import path from 'path'
import fs from 'fs'
import { getConfig } from '../components/config'
import {
  deleteFromAlerts,
  deleteFromNotifications,
  deleteFromProbeRequests,
} from '../components/logger/history'
import { Config } from '../interfaces/config'
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')

export function check_db_size() {
  const config = getConfig()
  deleteData(config)
}

async function deleteData(config: Config) {
  const { db_limit } = config
  const stats = fs.statSync(dbPath)

  if (stats.size > db_limit.max_db_size) {
    const probe_res = await deleteFromProbeRequests(db_limit.deleted_data)
    const notif_res = await deleteFromNotifications(db_limit.deleted_data)
    const alert_res = await deleteFromAlerts(db_limit.deleted_data)

    if (probe_res === 0 && notif_res === 0 && alert_res === 0) {
      return
    }

    deleteData(config) // recursive until reached expected file size
  }
}
