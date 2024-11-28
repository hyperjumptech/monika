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

import fs from 'node:fs'
import { hostname } from 'node:os'
import { sendNotifications } from '@hyperjumptech/monika-notification'
import format from 'date-fns/format'

import { getValidatedConfig } from '../components/config/index.js'
import { getSummary } from '../components/logger/history.js'
import {
  maxResponseTime,
  minResponseTime,
  averageResponseTime,
  checkIs24HourHasPassed,
  resetlogs,
  getLogLifeTimeInHour,
} from '../components/logger/response-time-log.js'
import {
  getOSName,
  getMonikaInstance,
} from '../components/notification/alert-message.js'
import { getContext } from '../context/index.js'
import events from '../events/index.js'
import type { ValidatedConfig } from '../interfaces/config.js'
import { getEventEmitter } from '../utils/events.js'
import { getErrorMessage } from '../utils/catch-error-handler.js'
import getIp from '../utils/ip.js'
import { log } from '../utils/pino.js'
import { publicIpAddress } from '../utils/public-ip.js'

const eventEmitter = getEventEmitter()

type TweetMessage = {
  averageResponseTime: number
  numberOfIncidents: number
  numberOfProbes: number
  numberOfRecoveries: number
}

export async function getSummaryAndSendNotif(): Promise<void> {
  const config = getValidatedConfig()
  const { notifications, probes } = config

  if (!notifications) return

  try {
    const { userAgent } = getContext()
    const privateIpAddress = getIp()
    const [summary, osName, monikaInstance] = await Promise.all([
      getSummary(),
      getOSName(),
      getMonikaInstance(privateIpAddress),
    ])
    const { numberOfIncidents, numberOfRecoveries, numberOfSentNotifications } =
      summary
    const responseTimelogLifeTimeInHour = getLogLifeTimeInHour()
    const numberOfProbes = probes.length
    const tweetMessage = createTweetMessage({
      averageResponseTime,
      numberOfIncidents,
      numberOfProbes,
      numberOfRecoveries,
    })

    sendNotifications(notifications, {
      subject: `Monika Status`,
      body: `Status Update ${format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX')}
Host: ${monikaInstance})
Number of probes: ${numberOfProbes}
Maximum response time: ${maxResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours
Minimum response time: ${minResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours
Average response time: ${averageResponseTime} ms in the last ${responseTimelogLifeTimeInHour} hours
Incidents: ${numberOfIncidents} in the last 24 hours
Recoveries: ${numberOfRecoveries} in the last 24 hours
Notifications: ${numberOfSentNotifications}
OS: ${osName}
Version: ${userAgent}

${tweetMessage}
`,
      summary: `There are ${numberOfIncidents} incidents and ${numberOfRecoveries} recoveries in the last 24 hours. - ${userAgent} - ${osName}`,
      meta: {
        type: 'status-update' as const,
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
        hostname: hostname(),
        privateIpAddress,
        publicIpAddress,
        monikaInstance,
        maxResponseTime,
        minResponseTime,
        averageResponseTime,
        responseTimelogLifeTimeInHour,
        version: userAgent,
        numberOfProbes,
        ...summary,
      },
    }).catch((error) => log.error(`Summary notification: ${error.message}`))

    if (checkIs24HourHasPassed()) {
      resetlogs()
    }
  } catch (error: unknown) {
    log.error(`Summary notification: ${getErrorMessage(error)}`)
  }
}

// savePidFile saves a monika.pid file with some useful information
export function savePidFile(
  configFile: string[],
  { notifications, probes }: ValidatedConfig
): void {
  const data = JSON.stringify({
    monikaStartTime: new Date(),
    monikaConfigFile: configFile,
    monikaPid: process.pid,
    monikaProbes: probes.length,
    monikaNotifs: notifications.length,
  })

  fs.writeFile('monika.pid', data, (err) => {
    if (err) {
      log.info("couldn't save monika.pid file, got err: ", err)
    }
  })
}

// do somee cleanups on exit
eventEmitter.on(events.application.terminated, async () => {
  fs.unlink('monika.pid', (err) => {
    if (err) {
      log.info('trying to cleanup monika.pid, got err: ', err)
    }
  })
})

function createTweetMessage({
  averageResponseTime,
  numberOfIncidents,
  numberOfProbes,
  numberOfRecoveries,
}: TweetMessage): string {
  const message = `I am using Monika by @hyperjump_tech to monitor ${numberOfProbes} probes! In the last 24 hours,

⏱ the average response time is ${averageResponseTime} ms
⚠️ there were ${numberOfIncidents} incidents
✅ and ${numberOfRecoveries} recoveries!

Give it a try!

https://monika.hyperjump.tech`

  return `<a href=https://twitter.com/intent/tweet?text=${encodeURI(
    message
  )}&hashtags=opensource,monika>Tweet this status!</a>`
}
