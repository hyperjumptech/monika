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

/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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

import { createClient } from 'redis'
import { ProbeRequestResponse } from '../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'

type RedisRequest = {
  host: string
  port: number
  command?: string
}

type RedisResult = {
  isAlive: boolean
  message?: string
  responseData?: Buffer | null
}

/**
 * redisRequest is the interface to call redis and manage the request-response
 * @param {object} params is a RedisRequest type
 * @returns {object} ProbeRequestResponse type mapped from RedisResult
 **/
export async function redisRequest(
  params: RedisRequest
): Promise<ProbeRequestResponse> {
  const baseResponse: ProbeRequestResponse = {
    requestType: 'redis',
    data: '',
    body: '',
    status: 0,
    headers: '',
    responseTime: 0,
  }
  const startTime = new Date()
  const result = await sendRedisRequest(params)
  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (result.isAlive) {
    baseResponse.responseTime = duration
    baseResponse.body = result.message
    baseResponse.status = 200 // TODO: improve this up/down flag
  } else {
    baseResponse.body = result.message
  }

  return baseResponse
}

/**
 * sendRedisRequest actually sends the command/request to redis
 * @param {object} params is a RedisRequest type
 * @returns {object} RedisResult type contain client response
 */
async function sendRedisRequest(params: RedisRequest): Promise<RedisResult> {
  const { host, port } = params

  const result: RedisResult = {
    isAlive: false,
    message: '',
  }
  try {
    const client = createClient({
      // redis[s]://[[username][:password]@][host][:port][/db-number]:
      url: `redis://${host}:${port}`,
    })

    await client.connect()

    client.on('error', (error: any) => {
      result.message = error
    })

    const ping = await client.ping()
    if (ping === 'PONG') {
      result.isAlive = true
      result.message = `${host}:${port} PONGED`
    }
  } catch (error: any) {
    result.message = error
  }

  return result
}
