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

import { hostname } from 'os'
import { getConfig } from '../../components/config'
import { sendNotifications } from '../../components/notification'
import events from '../../events'
import { getEventEmitter } from '../../utils/events'
import getIp from '../../utils/ip'
import { log } from '../../utils/pino'
import { publicIpAddress, publicNetworkInfo } from '../../utils/public-ip'

const eventEmitter = getEventEmitter()

eventEmitter.on(events.application.terminated, () => {
  const config = getConfig()
  const hostNameAndLocalIP = `${hostname()} (${getIp()})`
  const machineInfo = publicNetworkInfo
    ? `${publicNetworkInfo.city} - ${publicNetworkInfo.isp} (${publicIpAddress}) - ${hostNameAndLocalIP}`
    : hostNameAndLocalIP
  const isTestEnvironment = process.env.NODE_ENV === 'test'

  log.warn('Monika is terminating')

  if (!isTestEnvironment) {
    sendNotifications(config.notifications ?? [], {
      subject: 'Monika terminated',
      body: `Monika is no longer running in ${publicIpAddress}`,
      summary: `Monika is no longer running in ${publicIpAddress}`,
      meta: {
        type: 'termination',
        time: new Date().toUTCString(),
        hostname: hostname(),
        privateIpAddress: getIp(),
        publicIpAddress,
        machineInfo,
      },
    }).catch((error) => log.error(error))
  }
})
