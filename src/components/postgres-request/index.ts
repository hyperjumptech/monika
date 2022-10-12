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

import { Pool } from 'pg'
import { ProbeRequestResponse } from '../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'
import { parse } from 'pg-connection-string'

export type PostgresParam = {
  uri: string // Postgres uri string
  host: string // Host address of the psql db
  port: number // Port number of the psql db
  database: string // Database name
  username: string // Username string of the database user
  password: string // Password string of the database user
  command?: string
}

type PostgresResult = {
  isAlive: boolean // If the postgres db responded to our command
  message?: string // Any messages from the db driver
  responseData?: Buffer | null
}

export async function postgresRequest(
  params: PostgresParam
): Promise<ProbeRequestResponse> {
  const baseResponse: ProbeRequestResponse = {
    requestType: 'postgres',
    data: '',
    body: '',
    status: 0,
    headers: '',
    responseTime: 0,
  }
  const startTime = new Date()
  const result = await sendPsqlRequest(params)
  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (result.isAlive) {
    baseResponse.responseTime = duration
    baseResponse.body = result.message
    baseResponse.status = 200
  } else {
    baseResponse.body = result.message
  }

  return baseResponse
}

async function sendPsqlRequest(params: PostgresParam): Promise<PostgresResult> {
  const result: PostgresResult = {
    isAlive: false,
    message: '',
  }

  let client: any = false
  try {
    if (params.uri.length > 0) {
      const config = parse(params.uri)

      // If got uri format, parse and use that instead
      params.host = config.host ?? ''
      params.port = Number(config.port) ?? 5432
      params.database = config.database ?? ''
      params.username = config.user ?? ''
      params.password = config.password ?? ''
    }

    const pool = new Pool({
      host: params.host,
      port: params.port,
      database: params.database,
      user: params.username || '',
      password: params.password || '',
    })

    client = await pool.connect()
    await client.query('SELECT NOW()')
    result.message = 'postgres ok'
    result.isAlive = true
  } catch (error: any) {
    result.message = error.message
  } finally {
    if (client !== false) {
      // release if connect was previously successful.
      await client.release(true)
    }
  }

  return result
}
