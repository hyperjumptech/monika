import { AxiosResponseWithExtraData } from '../interfaces/request'
import { Probe } from '../interfaces/probe'
import chalk from 'chalk'
import { log } from 'console'
import { saveLog } from './history'

/**
 * probeLog just prints probe results for the user and to persistent log (through history.ts)
 *
 * @param {Probe} probe is the probe that made the log
 * @param {AxiosResponseWithExtraData} probRes is result of the probing
 * @param {string} err if theres any error, catch it here
 */
export async function probeLog(
  probe: Probe,
  probRes: AxiosResponseWithExtraData,
  err: string
) {
  let statusColor: string

  // colorize the statuscode
  switch (Math.trunc(probRes.status / 100)) {
    case 2:
      statusColor = 'green'
      break
    case 4:
      statusColor = 'orange'
      break
    case 5:
      statusColor = 'red'
      break
    default:
      statusColor = 'white'
  }

  log(
    'id:',
    probe.id,
    '- status:',
    chalk.keyword(statusColor)(probRes.status.toString()),
    'for:',
    probe.request.url,
    chalk.red(err)
  )

  saveLog(probe, probRes, err)
}
