import { AxiosResponseWithExtraData } from '../interfaces/request'
import { Probe } from '../interfaces/probe'
import chalk from 'chalk'
import { saveLog, getAllLogs } from './history'
import Table from 'cli-table3'
import { log } from '../utils/log'

/**
 * getStatusColor colorizes differents tatusCode
 * @param {number} statusCode is the httpStatus to colorize
 * @returns {string} color code based on chalk: Chalk & { supportsColor: ColorSupport };
 */
export function getStatusColor(statusCode: number) {
  switch (Math.trunc(statusCode / 100)) {
    case 2:
      return 'green'
    case 4:
      return 'orange'
    case 5:
      return 'red'
    default:
      return 'white'
  }
}

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
  log.info(
    'id:',
    probe.id,
    '- status:',
    chalk.keyword(getStatusColor(probRes.status))(probRes.status.toString()),
    'for:',
    probe.request.url,
    'response:',
    probRes.config.extraData?.responseTime ?? 'n/a',
    ' ms',
    chalk.red(err)
  )

  await saveLog(probe, probRes, err)
}

export async function printAllLogs() {
  const table = new Table({
    style: { head: ['green'] },
    head: ['#', 'probe_id', 'status_code', 'probe_url', 'response_time'],
    wordWrap: true,
  })

  const data = await getAllLogs()

  data.forEach((data: any) => {
    // colorize the statuscode
    table.push([
      data.id,
      { hAlign: 'center', content: data.probe_id },
      {
        hAlign: 'center',
        content: chalk.keyword(getStatusColor(data.status_code))(
          data.status_code
        ),
      },
      data.probe_url,
      { hAlign: 'center', content: data.response_time },
    ])
  })
  log.info(table.toString())
}
