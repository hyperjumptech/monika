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
import { sendHttpRequestFetch } from './http'
import { getContext } from '../context'
import { isSymonModeFrom } from '../components/config'

type PublicNetwork = {
  country: string
  city: string
  hostname: string
  isp: string
  privateIp: string
  publicIp: string
}

export let publicIpAddress = ''
export let isConnectedToSTUNServer = true
let publicNetworkInfo: PublicNetwork | undefined

/**
 * pokeStun sends a poke/request to stun server
 * @returns Promise<string>
 */
async function pokeStun(): Promise<string> {
  // for testing, bypass ping/stun server... apparently ping cannot run in github actions
  // reference: https://github.com/actions/virtual-environments/issues/1519
  if (getContext().isTest) {
    return '192.168.1.1' // adding for specific asserts in other tests
  }

  const connection = await sendPing('stun.l.google.com')
  if (connection.alive) {
    const response = await stun.request('stun.l.google.com:19302')
    return response?.getXorAddress()?.address
  }

  throw new Error('stun inaccessible') // could not connect to STUN server
}

async function fetchPublicNetworkInfo(): Promise<PublicNetwork> {
  const publicIp = await pokeStun()

  const resp = await sendHttpRequestFetch({
    url: `http://ip-api.com/json/${publicIp}`,
  })

  const { country, city, isp } = (await resp.json()) as {
    country: string
    city: string
    isp: string
  }

  return {
    country,
    city,
    hostname: hostname(),
    isp,
    privateIp: getIp(),
    publicIp,
  }
}

async function setPublicNetworkInfo(publicNetwork: PublicNetwork) {
  publicNetworkInfo = publicNetwork
}

export function getPublicNetworkInfo(): PublicNetwork | undefined {
  return publicNetworkInfo
}

// cache location & ISP info
export async function fetchAndCacheNetworkInfo() {
  const publicNetwork = await fetchPublicNetworkInfo()
  await setPublicNetworkInfo(publicNetwork)

  return publicNetwork
}

/**
 * getPublicIP sends a request to stun server getting IP address
 * @returns Promise<any>
 */
export async function getPublicIp() {
  const { flags } = getContext()
  const time = new Date().toISOString()
  const isSymonMode = isSymonModeFrom(flags)

  try {
    const address = await pokeStun()
    if (address) {
      isConnectedToSTUNServer = true
      if (flags.verbose || isSymonMode) {
        // reveal address info?
        publicIpAddress = address
        log.info(
          `${time} - Connected to STUN Server. Monika is running from: ${address}`
        )
      } else {
        log.info(`${time} - Connected to STUN Server. Monika is running.`)
      }
    }
  } catch {
    isConnectedToSTUNServer = false
    log.warn(`${time} STUN Server is temporarily unreachable. Check network.`)
  }
}
