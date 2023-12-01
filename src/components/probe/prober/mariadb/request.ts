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

import { getErrorMessage } from '../../../../utils/catch-error-handler'
import type { ProbeRequestResponse } from '../../../../interfaces/request'
import { probeRequestResult } from '../../../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'
import { createConnection } from 'mariadb'

export type MariaParam = {
  host: string // Host address of the psql db
  port: number // Port number of the psql db
  database: string // Database name
  username: string // Username string of the database user
  password: string // Password string of the database user
  command?: string
}

export async function mariaRequest(
  params: MariaParam
): Promise<ProbeRequestResponse> {
  const baseResponse: ProbeRequestResponse = {
    requestType: 'mariadb',
    data: '',
    body: '',
    status: 0,
    result: probeRequestResult.unknown,
    headers: '',
    responseTime: 0,
  }

  const startTime = new Date()
  let isConnected = false
  try {
    isConnected = await checkConnection({
      host: params.host,
      port: params.port,
      username: params.username,
      password: params.password,
      database: params.database,
    })
  } catch (error: unknown) {
    baseResponse.body = ''
    baseResponse.error = getErrorMessage(error)
    baseResponse.result = probeRequestResult.failed
    isConnected = false
  }

  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (isConnected) {
    baseResponse.responseTime = duration
    baseResponse.body = 'database ok'
    baseResponse.status = 200
    baseResponse.result = probeRequestResult.success
  }

  return baseResponse
}

async function checkConnection(params?: MariaParam) {
  const client = await createConnection({
    host: params?.host,
    port: params?.port,
    user: params?.username,
    password: params?.password,
    database: params?.database,

    allowPublicKeyRetrieval: true,
  })

  await client.end()
  return true
}
