import { type ProbeResult } from '../index.js'
import type { MariaDB } from '../../../../interfaces/probe.js'
import { probeRequestResult } from '../../../../interfaces/request.js'
import { moduleExports } from './request.js'

type ProbeMariaDBParams = {
  id: string
  checkOrder: number
  mariaDB?: MariaDB[]
  mysql?: MariaDB[]
}

export async function probeMariaDB({
  id,
  checkOrder,
  mariaDB,
  mysql,
}: ProbeMariaDBParams): Promise<ProbeResult[]> {
  const databases = mariaDB ?? mysql
  const databaseText = mariaDB ? 'mariadb' : 'mysql'
  const probeResults: ProbeResult[] = []

  if (!databases) {
    return probeResults
  }

  for await (const { host, port, database, username, password } of databases) {
    const requestResponse = await moduleExports.mariaRequest({
      host,
      port,
      database,
      username,
      password,
    })
    const { body, responseTime, result } = requestResponse
    const isAlertTriggered = result !== probeRequestResult.success
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} ${databaseText}:${host}:${port} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}
