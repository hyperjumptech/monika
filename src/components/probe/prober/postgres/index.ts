import { parse } from 'pg-connection-string'
import { BaseProber, type ProbeResult } from '..'
import type { Postgres } from '../../../../interfaces/probe'
import { probeRequestResult } from '../../../../interfaces/request'
import { postgresRequest } from './request'

export class PostgresProber extends BaseProber {
  async probe(): Promise<void> {
    if (!this.probeConfig.postgres) {
      throw new Error(
        `Postgres configuration is empty. Probe ID: ${this.probeConfig.id}`
      )
    }

    const result = await probePostgres({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      postgres: this.probeConfig.postgres,
    })

    this.processProbeResults(result)
  }

  generateVerboseStartupMessage(): string {
    const { description, id, interval, name } = this.probeConfig

    let result = `- Probe ID: ${id}
  Name: ${name || '-'}
  Description: ${description || '-'}
  Interval: ${interval}
`
    result += '  Connection Details:'
    result += this.getConnectionDetails()

    return result
  }

  private getConnectionDetails(): string {
    return (
      this.probeConfig.postgres
        ?.map((db) => {
          if (db.uri) {
            return `
    URI: ${db.uri}
`
          }

          return `
    Host: ${db.host}
    Port: ${db.port}
    Username: ${db.username}
    Database: ${db.database}
`
        })
        .join('\n') || ''
    )
  }
}

type ProbePostgresParams = {
  id: string
  checkOrder: number
  postgres: Postgres[]
}

export async function probePostgres({
  id,
  checkOrder,
  postgres,
}: ProbePostgresParams): Promise<ProbeResult[]> {
  const probeResults: ProbeResult[] = []

  for await (const pg of postgres) {
    const postgresConnectionDetails = getPostgresConnectionDetails(pg)
    const { host, port } = postgresConnectionDetails
    const requestResponse = await postgresRequest(postgresConnectionDetails)
    const { body, responseTime, result } = requestResponse
    const isAlertTriggered = result !== probeRequestResult.success
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} postgres:${host}:${port} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}

function getPostgresConnectionDetails(postgres: Postgres) {
  const { uri } = postgres

  if (!uri) {
    return postgres
  }

  // If got uri format, parse and use that instead
  const { database, host, password, port, user } = parse(uri)

  return {
    host: host ?? '0.0.0.0',
    port: Number(port) ?? 5432,
    database: database ?? '',
    username: user ?? '',
    password: password ?? '',
  }
}
