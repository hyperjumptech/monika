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

import { getContext, setContext } from '../../context'
import type { ProbeAlert } from '../../interfaces/probe'

type DowntimeCounter = {
  alert: ProbeAlert
  probeID: string
  url: string
  createdAt?: Date
}

export function getIncidents() {
  return getContext().incidents
}

export function findIncident(probeId: string) {
  return getIncidents().find(({ probeID }) => probeID === probeId)
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

  setContext({ incidents: [...getIncidents(), newIncident] })
}

type RemoveIncidentParams = {
  probeId: string
  url?: string
}

export function removeIncident({ probeId, url }: RemoveIncidentParams): void {
  const newIncidents = getIncidents().filter(({ probeID, probeRequestURL }) => {
    if (!url) {
      return probeId !== probeID
    }

    return probeId !== probeID || probeRequestURL !== url
    // remove incidents with exact mach of probeID and url
  })

  setContext({ incidents: newIncidents })
}
