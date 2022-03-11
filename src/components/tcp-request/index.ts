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

import net from 'net'
import { differenceInMilliseconds } from 'date-fns'

type TCPRequest = {
  host: string
  port: number
  data: string | Uint8Array
  timeout?: number
}

type Result = {
  duration: number
  status: 'UP' | 'DOWN'
  message: string
}

export async function check(tcpRequest: TCPRequest): Promise<Result> {
  const { host, port, data, timeout } = tcpRequest

  try {
    const startTime = new Date()
    const resp = await send({ host, port, data, timeout: timeout ?? 10 })
    const endTime = new Date()
    const duration = differenceInMilliseconds(endTime, startTime)
    const responseData = Buffer.from(resp, 'utf8')
    const isAlertTriggered = responseData?.length < 1

    return { duration, status: isAlertTriggered ? 'DOWN' : 'UP', message: '' }
  } catch (error: any) {
    return { duration: 0, status: 'DOWN', message: error?.message }
  }
}

async function send(
  tcpRequest: Omit<TCPRequest, 'timeout'> & { timeout: number }
): Promise<any> {
  const { host, port, data, timeout } = tcpRequest

  return new Promise((resolve, reject) => {
    const client = new net.Socket()
    client.setKeepAlive(true)
    client.setTimeout(timeout)
    let isConnect = false

    client.connect(port, host, () => {
      if (data) {
        client.write(data)
      }
    })

    client.on('data', (data) => {
      resolve(data)

      client.destroy()
    })

    client.on('error', (err) => {
      reject(err)
    })

    client.on('connect', () => {
      isConnect = true
    })

    client.on('timeout', () => {
      client.destroy()
    })

    client.on('close', (hadError) => {
      if (!isConnect || hadError) {
        const err = new Error('Connection error')
        reject(err)
      }
    })
  })
}
