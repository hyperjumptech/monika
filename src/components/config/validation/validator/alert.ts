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

import { Probe, ProbeAlert } from '../../../../interfaces/probe'
import { parseAlertStringTime } from '../../../../plugins/validate-response/checkers'
import { compileExpression } from '../../../../utils/expression-parser'

const alertStatusMessage = 'status-not-2xx'
const responseTimePrefix = 'response-time-greater-than-'

const isValidProbeAlert = (alert: ProbeAlert | string): boolean => {
  try {
    if (typeof alert === 'string') {
      return (
        alert === alertStatusMessage ||
        (alert.startsWith(responseTimePrefix) &&
          Boolean(parseAlertStringTime(alert)))
      )
    }

    return Boolean(
      compileExpression(alert.assertion || (alert.query as string))
    )
  } catch {
    return false
  }
}

const convertOldAlertToNewFormat = (
  probe: Probe,
  allAlerts: ProbeAlert[]
): void => {
  probe.alerts = allAlerts.map((alert: any) => {
    if (typeof alert === 'string') {
      let query = ''
      let message = ''
      const subject = ''

      if (alert === alertStatusMessage) {
        query = 'response.status < 200 or response.status > 299'
        message = 'HTTP Status is {{ response.status }}, expecting 200'
      } else if (alert.startsWith(responseTimePrefix)) {
        const expectedTime = parseAlertStringTime(alert)
        query = `response.time > ${expectedTime}`
        message = `Response time is {{ response.time }}ms, expecting less than ${expectedTime}ms`
      }

      return { query, subject, message }
    }

    return alert
  })
}

export const validateAlerts = (probe: Probe): string | undefined => {
  const { alerts = [], socket } = probe
  const socketAlerts = socket?.alerts ?? []
  const allAlerts = [...alerts, ...socketAlerts]

  // Check probe alert properties
  for (const alert of allAlerts) {
    const check = isValidProbeAlert(alert)
    if (!check) {
      return `Probe alert format is invalid! (${alert})`
    }
  }

  convertOldAlertToNewFormat(probe, allAlerts)
}
