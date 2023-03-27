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
import { ProbeRequestResponse } from '../../../interfaces/request'
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

// responseChecker checks some result and returns boolean if alert requered
const responseChecker = (
  alert: ProbeAlert,
  res: ProbeRequestResponse
): boolean => {
  // If the probe did not succeed (ex: invalid address etc),
  // then automatic alert-able event.
  if (!res.isProbeResponsive) {
    return true
  }

  // Else we check for user assertion
  return queryExpression(res, alert.assertion || (alert.query as string))
}

export default responseChecker
