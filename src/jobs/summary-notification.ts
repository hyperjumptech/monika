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
import { format } from 'date-fns'
import { getConfig } from '../components/config/index.js'
import { getSummary } from '../components/logger/history.js'
import { sendNotifications } from '@hyperjumptech/monika-notification'
import {
  getOSName,
  getMonikaInstance,
} from '../components/notification/alert-message.js'
import { getContext } from '../context/index.js'
import getIp from '../utils/ip.js'
import { log } from '../utils/pino.js'
import { publicIpAddress } from '../utils/public-ip.js'
import {
  maxResponseTime,
  minResponseTime,
  averageResponseTime,
  checkIs24HourHasPassed,
  resetlogs,
  getLogLifeTimeInHour,
} from '../components/logger/response-time-log.js'
import fs from 'fs'
import type { Config as IConfig } from '@oclif/core'
import events from '../events/index.js'
import { Config } from '../interfaces/config.js'

import { getEventEmitter } from '../utils/events.js'
import type { Notification } from '@hyperjumptech/monika-notification'
import type { Probe } from '../interfaces/probe.js'
import { getErrorMessage } from '../utils/catch-error-handler.js'
import { readFile } from '../utils/read-file.js'
const eventEmitter = getEventEmitter()

type TweetMessage = {
  averageResponseTime: number
  numberOfIncidents: number
  numberOfProbes: number
  numberOfRecoveries: number
}

export async function getSummaryAndSendNotif(): Promise<void> {
  const config = getConfig()
  const { notifications } = config

  if (!notifications) return

  try {
    const { userAgent } = getContext()
    const privateIpAddress = getIp()
    const [summary, osName, monikaInstance] = await Promise.all([
      getSummary(),
      getOSName(),
      getMonikaInstance(privateIpAddress),
    ])
    const {
      numberOfIncidents,
      numberOfProbes,
      numberOfRecoveries,
      numberOfSentNotifications,
    } = summary
    const responseTimelogLifeTimeInHour = getLogLifeTimeInHour()
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

interface PidObject {
  monikaPid: number
  monikaConfigFile: string
  monikaStartTime: Date
  monikaProbes: Probe
  monikaNotifs: Notification
}

/**
 * readsPidFile reads a local monika.pid file and returns the information in it
 * @returns {object} PidObject is returned
 */
async function readPidFile(): Promise<PidObject> {
  const fileContent = await readFile('monika.pid', 'utf8')
  const json = JSON.parse(fileContent)
  return {
    monikaPid: json.monikaPid,
    monikaConfigFile: json.monikaConfigFile,
    monikaStartTime: json.monikaStartTime,
    monikaProbes: json.monikaProbes,
    monikaNotifs: json.monikaNotifs,
  }
}

/**
 * savePidFile saves a monika.pid file with some useful information
 * @param {string} configFile is the configuration file used
 * @param {obj} config is a Config object
 * @returns void
 */
export function savePidFile(configFile: string[], config: Config): void {
  const data = JSON.stringify({
    monikaStartTime: new Date(),
    monikaConfigFile: configFile,
    monikaPid: process.pid,
    monikaProbes: config.probes ? config.probes.length : '0',
    monikaNotifs: config.notifications ? config.notifications.length : '0',
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

/**
 * getDaysHours breaks down the date into days  hours minute string
 * @param {Date} startTime is the start time
 * @returns {string} text of the date to print
 */
function getDaysHours(startTime: Date): string {
  let duration = Math.abs((Date.now() - new Date(startTime).getTime()) / 1000)
  const numDays = Math.floor(duration / 86_400)
  duration -= numDays * 86_400 // get the remaining hours

  const numHours = Math.floor(duration / 3600) % 24
  duration -= numHours * 3600 // get the remaining minutes

  const numMinutes = Math.floor(duration / 60) % 60

  const numSeconds = Math.floor(duration - numMinutes * 60)

  return `${numDays} days, ${numHours} hours, ${numMinutes} minutes, ${numSeconds} seconds`
}

/**
 * printSummary gathers and print some stats
 * @param {object} cliConfig is oclif config structure
 * @returns Promise<void>
 */
export async function printSummary(cliConfig: IConfig): Promise<void> {
  try {
    const pidObject = await readPidFile()
    const summary = await getSummary()

    const uptime = getDaysHours(pidObject.monikaStartTime)

    const host = `${hostname()} (${[publicIpAddress, getIp()]
      .filter(Boolean)
      .join('/')})`

    log.info(`Monika Summary \n
    Monika process id \t\t: ${pidObject.monikaPid}
    Active config file \t\t: ${pidObject.monikaConfigFile}
    Probes set \t\t\t: ${pidObject.monikaProbes}
    Notifications set \t\t: ${pidObject.monikaNotifs}
    Number of incidents \t: ${summary.numberOfIncidents} in last 24hr
    Number of recoveries \t: ${summary.numberOfRecoveries} in last 24hr
    Number of notifications \t: ${summary.numberOfSentNotifications} in last 24h

    Up time \t: ${uptime}
    Running on \t: ${host}
    App version : ${cliConfig.userAgent}

    `)
  } catch (error: unknown) {
    log.error(`Summary notification: ${getErrorMessage(error)}`)
  }
}

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
