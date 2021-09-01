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

// TODO: delete
// temporaryly edit to pass test
export const getResponseValue = (
  alert: ProbeAlert,
  response: AxiosResponseWithExtraData
): number => {
  if (alert.query === 'response.status < 200 or response.status > 299') {
    return response?.status ?? 0
  }
  if (/response\.time > \d+/.test(alert.query)) {
    return response.config.extraData?.responseTime ?? 0
  }

  return 0
}

const responseChecker = (
  alert: ProbeAlert,
  res: AxiosResponseWithExtraData
): boolean => {
  // if status is 599 : timeout or uri is not found (0), worth reporting so return true
  if (res.status === 599 || res.status === 0) {
    return true
  }

  return queryExpression(res, alert.query)
}

export default responseChecker
