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

import { ProbeAlert } from '../../interfaces/probe'
import { ProbeRequestResponse } from '../../interfaces/request'
import responseChecker from './checkers'

export interface ValidatedResponse {
  response: ProbeRequestResponse
  alert: ProbeAlert
  isAlertTriggered: boolean
}

/**
 * validateResponse will check the response against alerts. If an alert is set, and the response demands it, will setup to send alert/notification
 * @param {object} alerts is the alerts setup to trigger
 * @param {object} response is the raw response from axios
 * @returns {object} checks which contains alert type, flag to response time
 */
const validateResponse = (
  alerts: ProbeAlert[],
  response: ProbeRequestResponse
): ValidatedResponse[] => {
  const checks = alerts.map((alert) => {
    const isAlertTriggered = responseChecker(alert, response)

    return { alert, isAlertTriggered, response }
  })

  return checks
}

export default validateResponse
