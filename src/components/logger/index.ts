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

import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { Probe } from '../../interfaces/probe'
import chalk from 'chalk'
import { saveLog, getAllLogs } from './history'
import { log } from '../../utils/pino'

/**
 * getStatusColor colorizes differents tatusCode
 * @param {number} statusCode is the httpStatus to colorize
 * @returns {string} color code based on chalk: Chalk & { supportsColor: ColorSupport };
 */
export function getStatusColor(statusCode: number) {
  switch (Math.trunc(statusCode / 100)) {
    case 2:
      return 'cyan'
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
 * @param {number} checkOrder is the order of probe being processed
 * @param {Probe} probe is the probe that made the log
 * @param {AxiosResponseWithExtraData} probRes is result of the probing
 * @param {string} err if theres any error, catch it here
 */
export async function probeLog({
  checkOrder,
  probe,
  probeRes,
  requestIndex,
  err,
}: {
  checkOrder: number
  probe: Probe
  probeRes: AxiosResponseWithExtraData
  requestIndex: number
  err: string
}) {
  log.info({
    type: 'PROBE',
    checkOrder,
    probeId: probe.id,
    url: probeRes.config.url,
    statusCode: probeRes.status,
    responseTime: probeRes.config.extraData?.responseTime,
  })

  saveLog(probe, probeRes, requestIndex, err)
}

export async function printAllLogs() {
  const data = await getAllLogs()

  data.forEach((data: any) => {
    log.info({
      type: 'PLAIN',
      msg: `${data.id} id: ${data.probe_id} status: ${chalk.keyword(
        getStatusColor(data.status_code)
      )(data.status_code)} - ${data.probe_url}, ${data.response_time}`,
    })
  })
}
