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

import { init, setTags } from '@sentry/node'
import stun from 'stun'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { sendPing } from '../../utils/ping'
import { sendHttpRequest } from '../../utils/http'
import { hostname } from 'os'
import getIp from '../../utils/ip'
import { getContext } from '../../context'

export async function initSentry({
  dsn,
  monikaVersion,
}: {
  dsn?: string
  monikaVersion: string
}): Promise<void> {
  init({
    dsn,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1,
    debug,
  })

  // Get current public IP
  let publicIp
  const connection = await sendPing('stun.l.google.com')
  if (connection.alive) {
    const response = await stun.request('stun.l.google.com:19302')
    publicIp = response?.getXorAddress()?.address
  }

  const response = await sendHttpRequest({
    url: `http://ip-api.com/json/${publicIp}`,
  })
  const { country, city, isp } = response.data

  const tags: {
    country: string
    city: string
    hostname: string
    isp: string
    privateIp: string
    publicIp: string
    monikaVersion: string
    symonMonikaId?: string
  } = {
    country,
    city,
    hostname: hostname(),
    isp,
    privateIp: getIp(),
    publicIp,
    monikaVersion,
  }

  if (getContext().flags.symonMonikaId) {
    tags.symonMonikaId = getContext().flags.symonMonikaId
  }

  setTags(tags)
}
