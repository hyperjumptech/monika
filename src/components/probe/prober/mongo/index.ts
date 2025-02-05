/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import mongodbURI from 'mongodb-uri'
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
