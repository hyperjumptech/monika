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

import { formatDistanceToNow } from 'date-fns'
import { getContext, setContext } from '../../context/index.js'
import type { ProbeAlert } from '../../interfaces/probe.js'

type DowntimeCounter = {
  alert: ProbeAlert
  probeID: string
  url: string
  createdAt?: Date
}

export function addIncident({
  alert,
  createdAt,
  probeID,
  url,
}: DowntimeCounter): void {
  const newIncident = {
    alert,
    probeID,
    probeRequestURL: url,
    createdAt: createdAt || new Date(),
  }

  setContext({ incidents: [...getContext().incidents, newIncident] })
}

export function getDowntimeDuration({
  probeID,
  url,
}: Omit<DowntimeCounter, 'alert'>): string {
  const lastIncident = getContext().incidents.find(
    (incident) =>
      incident.probeID === probeID && incident.probeRequestURL === url
  )

  if (!lastIncident) {
    return '0 seconds'
  }

  return formatDistanceToNow(lastIncident.createdAt, {
    includeSeconds: true,
  })
}

export function removeIncident({ probeID, url }: DowntimeCounter): void {
  const newIncidents = getContext().incidents.filter(
    (incident) =>
      incident.probeID !== probeID || incident.probeRequestURL !== url
    // remove incidents with exact mach of probeID and url
  )

  setContext({ incidents: newIncidents })
}
