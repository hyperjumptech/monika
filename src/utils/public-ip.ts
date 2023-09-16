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

import { log } from './pino'
import stun from 'stun'
import { hostname } from 'os'
import getIp from './ip'
import { sendPing } from './ping'
import { sendHttpRequest } from './http'

export let publicIpAddress = ''
export let isConnectedToSTUNServer = true
export let publicNetworkInfo: { country: string; city: string; isp: string }

const isTestEnvironment = process.env.CI || process.env.NODE_ENV === 'test'

/**
 * pokeStun sends a poke/request to stun server
 * @returns Promise<string>
 */
async function pokeStun(): Promise<string> {
  // for testing, bypass ping/stun server... apparently ping cannot run in github actions
  // reference: https://github.com/actions/virtual-environments/issues/1519
  if (isTestEnvironment) {
    // adding for specific asserts in other tests
    return Promise.resolve('142.251.10.139') // google public IP
  }

  const connection = await sendPing('stun.l.google.com')
  if (connection.alive) {
    const response = await stun.request('stun.l.google.com:19302')
    return response?.getXorAddress()?.address
  }

  return Promise.reject(new Error('stun inaccessible')) // could not connect to STUN server
}

export async function getPublicNetworkInfo(): Promise<any> {
  try {
    const ip = await pokeStun()
    const response = await sendHttpRequest({
      url: `http://ip-api.com/json/${ip}`,
    })
    const { country, city, isp } = await response.json()
    publicNetworkInfo = { country, city, isp }
    log.info(
      `Monika is running from: ${publicNetworkInfo.city} - ${
        publicNetworkInfo.isp
      } (${ip}) - ${hostname()} (${getIp()})`
    )
  } catch (error) {
    log.warn(`Failed to obtain location/ISP info. Got: ${error}`)
    return Promise.resolve() // couldn't resolve publicNetworkInfo, fail gracefully and continue
  }

  return null
}

/**
 * getPublicIP sends a request to stun server getting IP address
 * @returns Promise<any>
 */
export async function getPublicIp(): Promise<any> {
  const time = new Date().toISOString()

  try {
    const address = await pokeStun()
    if (address) {
      publicIpAddress = address
      isConnectedToSTUNServer = true
      log.info(
        `${time} - Connected to STUN Server. Monika is running from: ${address}`
      )
    }
  } catch {
    isConnectedToSTUNServer = false
    log.warn(`${time} STUN Server is temporarily unreachable. Check network.`)
    return Promise.resolve() // couldn't access public stun but resolve and retry
  }

  return null
}
