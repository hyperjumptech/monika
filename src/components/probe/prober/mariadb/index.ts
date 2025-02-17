import { BaseProber, type ProbeParams } from '../index.js'
import { probeMariaDB } from './probe.js'

export class MariaDBProber extends BaseProber {
  async probe({ incidentRetryAttempt }: ProbeParams): Promise<void> {
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
