import * as mongodbURI from 'mongodb-uri'
import { BaseProber, type ProbeParams, type ProbeResult } from '../index.js'
import { probeRequestResult } from '../../../../interfaces/request.js'
import type { Mongo } from '../../../../interfaces/probe.js'
import { mongoRequest } from './request.js'

export class MongoProber extends BaseProber {
  async probe({ incidentRetryAttempt }: ProbeParams): Promise<void> {
    if (!this.probeConfig.mongo) {
      throw new Error(
        `Mongo configuration is empty. Probe ID: ${this.probeConfig.id}`
      )
    }

    const result = await probeMongo({
      id: this.probeConfig.id,
      checkOrder: this.counter,
      mongo: this.probeConfig.mongo,
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
    return (
      this.probeConfig.mongo
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
`
        })
        .join('\n') || ''
    )
  }
}

type ProbeMongoParams = {
  id: string
  checkOrder: number
  mongo: Mongo[]
}

export async function probeMongo({
  id,
  checkOrder,
  mongo,
}: ProbeMongoParams): Promise<ProbeResult[]> {
  const probeResults: ProbeResult[] = []

  for await (const mongoDB of mongo) {
    const { host, password, port, uri, username } =
      getMongoConnectionDetails(mongoDB)
    const requestResponse = await mongoRequest({
      uri,
      host,
      port,
      username,
      password,
    })
    const { body, responseTime, result } = requestResponse
    const isAlertTriggered = result !== probeRequestResult.success
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} mongo:${host}:${port} ${responseTime}ms msg:${body}`

    probeResults.push({ isAlertTriggered, logMessage, requestResponse })
  }

  return probeResults
}

function getMongoConnectionDetails({
  host,
  password,
  port,
  uri,
  username,
}: Mongo): Mongo {
  if (!uri) {
    return { host, password, port, uri, username }
  }

  const parsed = mongodbURI.parse(uri)
  const { hosts, password: parsedPassword, username: parsedUsername } = parsed

  return {
    host: hosts[0].host,
    password: parsedPassword,
    port: hosts[0].port,
    uri,
    username: parsedUsername,
  }
}
