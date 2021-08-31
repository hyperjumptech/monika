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

import { ProbeAlert } from '../../../interfaces/probe'
import { AxiosResponseWithExtraData } from '../../../interfaces/request'
import responseTimeGreaterThanX from './res-time-greater-than-x'
import statusNot2xx from './status-not-2xx'
import queryExpression from './query-expression'

// parse string like "response-time-greater-than-200-ms" and return the time in ms
export const parseAlertStringTime = (str: string): number => {
  // match any string that ends with digits followed by unit 's' or 'ms'
  const match = str.match(/(\d+)-(m?s)$/)

  if (!match) {
    throw new Error('Alert string does not contain valid time number')
  }

  const number = Number(match[1])
  const unit = match[2]

  if (unit === 's') return number * 1000

  return number
}

export const getResponseValue = (
  alert: string,
  response: AxiosResponseWithExtraData
): number => {
  if (alert === 'status-not-2xx') {
    return response?.status ?? 0
  }
  if (alert.startsWith('response-time-greater-than-')) {
    return response.config.extraData?.responseTime ?? 0
  }

  return 0
}

/**
 * responseChecker checks the response against notif/alert triggers
 * @param {obj} alert contains our alerts to look for
 * @param {obj} res is the probe result
 * @returns {boolean} flag true if we have something to alert/notify
 */
const responseChecker = (
  alert: ProbeAlert,
  res: AxiosResponseWithExtraData
): boolean => {
  // if status is 599 : timeout or uri is not found (0), worth reporting so return true
  if (res.status === 599 || res.status === 0) {
    return true
  }

  if (alert.query === 'status-not-2xx') {
    return statusNot2xx(res)
  }

  if (alert.query.startsWith('response-time-greater-than-')) {
    const alertTime = parseAlertStringTime(alert.query)

    return responseTimeGreaterThanX(res, alertTime)
  }

  return queryExpression(res, alert.query)
}

export default responseChecker
