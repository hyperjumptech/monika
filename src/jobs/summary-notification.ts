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
import format from 'date-fns/format'
import { getConfig } from '../components/config'
import { getSummary } from '../components/logger/history'
import { sendNotifications } from '../components/notification'
import { getOSName } from '../components/notification/alert-message'
import { getContext } from '../context'
import getIp from '../utils/ip'
import { log } from '../utils/pino'
import { publicIpAddress } from '../utils/public-ip'
import fs from 'fs'
import type { IConfig } from '@oclif/config'
import events from '../events'
import { Config } from '../interfaces/config'

import { getEventEmitter } from '../utils/events'
import { Notification } from '../interfaces/notification'
import { Probe } from '../interfaces/probe'
const eventEmitter = getEventEmitter()

export async function getSummaryAndSendNotif() {
  const config = getConfig()
  const { notifications } = config

  if (!notifications) return

  try {
    const { userAgent } = getContext()
    const [summary, osName] = await Promise.all([getSummary(), getOSName()])

    sendNotifications(notifications, {
      subject: `Monika Status`,
      body: `Status Update ${format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX')}
Host: ${hostname()} (${[publicIpAddress, getIp()].filter(Boolean).join('/')})
Number of probes: ${summary.numberOfProbes}
Average response time: ${summary.averageResponseTime} ms in the last 24 hours
Incidents: ${summary.numberOfIncidents} in the last 24 hours
Recoveries: ${summary.numberOfRecoveries} in the last 24 hours
Notifications: ${summary.numberOfSentNotifications}
OS: ${osName}
Version: ${userAgent}`,
      summary: `There are ${summary.numberOfIncidents} incidents and ${summary.numberOfRecoveries} recoveries in the last 24 hours. - ${userAgent} - ${osName}`,
      meta: {
        type: 'status-update' as const,
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss XXX'),
        hostname: hostname(),
        privateIpAddress: getIp(),
        publicIpAddress,
        ...summary,
      },
    }).catch((error) => log.error(`Summary notification: ${error.message}`))
  } catch (error) {
    log.error(`Summary notification: ${error.message}`)
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
function readPidFile(): PidObject {
  let data = ''
  try {
    data = fs.readFileSync('monika.pid', 'utf-8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      log.info(
        'Could not find the file: monika.pid. Monika is probably not running or ran from a diffent directory'
      )
    }
    throw error
  }

  const json = JSON.parse(data)
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
 * @param {obj} flags is the oclif flag object
 * @param {obj} config is a Config object
 */
export function savePidFile(flags: any, config: Config) {
  const data = JSON.stringify({
    monikaStartTime: new Date(),
    monikaConfigFile: flags.config,
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
  let duration = Math.abs(
    (new Date().getTime() - new Date(startTime).getTime()) / 1000
  )
  const numDays = Math.floor(duration / 86400)
  duration -= numDays * 86400 // get the remaining hours

  const numHours = Math.floor(duration / 3600) % 24
  duration -= numHours * 3600 // get the remaining minutes

  const numMinutes = Math.floor(duration / 60) % 60

  const numSeconds = Math.floor(duration - numMinutes * 60)

  return `${numDays} days, ${numHours} hours, ${numMinutes} minutes, ${numSeconds} seconds`
}

/**
 * printSummary gathers and print some stats
 * @param {object} cliConfig is oclif config structure
 */
export async function printSummary(cliConfig: IConfig) {
  try {
    const pidObject = readPidFile()
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
  } catch (error) {
    log.error(`Summary notification: ${error.message}`)
  }
}
