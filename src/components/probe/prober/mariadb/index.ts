import { BaseProber, type ProbeResult } from '../'
import type { MariaDB } from '../../../../interfaces/probe'
import { probeRequestResult } from '../../../../interfaces/request'
import { mariaRequest } from './request'

export class MariaDBProber extends BaseProber {
  async probe(incidentRetryAttempt: number): Promise<void> {
    const result = await probeMariaDB({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      mariaDB: this.probeConfig.mariadb,
      mysql: this.probeConfig.mysql,
    })

    this.processProbeResults(result, incidentRetryAttempt)
  }

  generateVerboseStartupMessage(): string {
    const { description, id, interval, name } = this.probeConfig

    let result = `- Probe ID: ${id}
  Name: ${name}
  Description: ${description || '-'}
  Interval: ${interval}
`
    result += '  Connection Details:'
    result += this.getConnectionDetails()

    return result
  }

  private getConnectionDetails(): string {
    const connectionDetails =
      this.probeConfig?.mariadb || this.probeConfig?.mysql

    return (
      connectionDetails
        ?.map(
          (db) => `
    Host: ${db.host}
    Port: ${db.port}
    Database: ${db.database}
    Username: ${db.username}
`
        )
        .join('\n') || ''
    )
  }
}

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
    const requestResponse = await mariaRequest({
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
