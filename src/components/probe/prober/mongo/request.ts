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

import { MongoClient } from 'mongodb'
import * as mongodbURI from 'mongodb-uri'
import { probeRequestResult } from '../../../../interfaces/request'
import type { ProbeRequestResponse } from '../../../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'
import { getErrorMessage } from '../../../../utils/catch-error-handler'

type MongoRequest = {
  uri?: string // Connection URI
  host?: string // Host address of the MongoDB server
  port?: number // Port number of the MongoDB server
  password?: string // Password string if AUTH is used, optional
  username?: string // Username stgring if used, optional
}

type MongoResult = {
  isAlive: boolean // If MongoDB responds to PING/commands
  message?: string // Any message from Mongo
  responseData?: Buffer | null
}

/**
 * MongoRequest is the interface to call Mongo and manage the request-response
 * @param {object} params is a MongoRequest type
 * @returns {object} ProbeRequestResponse type mapped from MongoResult
 **/
export async function mongoRequest(
  params: MongoRequest
): Promise<ProbeRequestResponse> {
  const baseResponse: ProbeRequestResponse = {
    requestType: 'mongo',
    data: '',
    body: '',
    status: 0,
    result: probeRequestResult.unknown,
    headers: '',
    responseTime: 0,
  }
  const startTime = new Date()
  const result = await sendMongoRequest(params)
  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (result.isAlive) {
    baseResponse.responseTime = duration
    baseResponse.body = result.message
    baseResponse.status = 200
    baseResponse.result = probeRequestResult.success
  } else {
    baseResponse.result = probeRequestResult.failed
    baseResponse.body = ''
    baseResponse.error = result.message
  }

  return baseResponse
}

/**
 * sendMongoRequest actually sends the command/request to Mongo
 * @param {object} params is a MongoRequest type
 * @returns {object} MongoResult type contain client response
 */
async function sendMongoRequest(params: MongoRequest): Promise<MongoResult> {
  const { uri } = params

  let host: string | undefined
  let port: number | undefined
  let username: string | undefined
  let password: string | undefined
  let connectionURI: string

  if (uri) {
    const parsed = mongodbURI.parse(uri)
    host = parsed.hosts[0].host
    port = parsed.hosts[0].port
    username = parsed.username
    password = parsed.password
    connectionURI = uri
  } else {
    host = params.host
    port = params.port
    username = params.username
    password = params.password
    connectionURI = mongodbURI.format({
      scheme: 'mongodb',
      hosts: [
        {
          host: host as string,
          port,
        },
      ],
      username,
      password,
    })
  }

  const result: MongoResult = {
    isAlive: false,
    message: '',
  }

  const client = new MongoClient(connectionURI, {
    connectTimeoutMS: 3000,
    maxIdleTimeMS: 3000,
    serverSelectionTimeoutMS: 3000,
  })

  try {
    await client.connect()

    client.on('error', (error: string | undefined) => {
      result.message = error
    })

    const { ok } = await client.db().command({ ping: 1 })
    if (ok === 1) {
      result.isAlive = true
      result.message = `${host}:${port} PONGED`
    }
  } catch (error: unknown) {
    result.message = getErrorMessage(error)
  } finally {
    if (client) {
      await client.close()
    }
  }

  return result
}
