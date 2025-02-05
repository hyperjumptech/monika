import { readFile } from 'node:fs/promises'
import { hostname } from 'node:os'
import type { Notification } from '@hyperjumptech/monika-notification'

import { getContext } from '../context/index.js'
import type { Probe } from '../interfaces/probe.js'
import getIp from '../utils/ip.js'
import { log } from '../utils/pino.js'
import { publicIpAddress } from '../utils/public-ip.js'
import { getSummary, openLogfile } from './logger/history.js'

// printSummary gathers and print some stats
export async function printSummary(): Promise<void> {
  await openLogfile()

  const [pidFileContent, summary] = await Promise.all([
    readPidFile(),
    getSummary(),
  ])
  const {
    monikaConfigFile,
    monikaNotifs,
    monikaPid,
    monikaProbes,
    monikaStartTime,
  } = pidFileContent
  const { numberOfIncidents, numberOfRecoveries, numberOfSentNotifications } =
    summary
  const uptime = getDaysHours(monikaStartTime)
  const host = `${hostname()} (${[publicIpAddress, getIp()]
    .filter(Boolean)
    .join('/')})`

  log.info(`Monika Summary

Monika process id\t: ${monikaPid}
Active config file\t: ${monikaConfigFile}
Probes set\t\t: ${monikaProbes}
Notifications set\t: ${monikaNotifs}
Number of incidents\t: ${numberOfIncidents} in last 24hr
Number of recoveries\t: ${numberOfRecoveries} in last 24hr
Number of notifications\t: ${numberOfSentNotifications} in last 24h

Up time\t\t: ${uptime}
Running on\t: ${host}
App version\t: ${getContext().userAgent}`)
}

// getDaysHours breaks down the date into days  hours minute string
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

type PidObject = {
  monikaPid: number
  monikaConfigFile: string
  monikaStartTime: Date
  monikaProbes: Probe
  monikaNotifs: Notification
}
// readsPidFile reads a local monika.pid file and returns the information in it
async function readPidFile(): Promise<PidObject> {
  const fileContent = await readFile('monika.pid', { encoding: 'utf8' })

  return JSON.parse(fileContent)
}
