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

import { type Incident, getContext, setContext } from '../../context'

export function getIncidents() {
  return getContext().incidents
}

export function findIncident(probeId: string) {
  return getIncidents().find(({ probeID }) => probeID === probeId)
}

export function addIncident(
  incident: Omit<Incident, 'createdAt'> & Partial<Pick<Incident, 'createdAt'>>
): void {
  const newIncident = {
    ...incident,
    createdAt: incident?.createdAt || new Date(),
  }

  setContext({ incidents: [...getIncidents(), newIncident] })
}

export function removeIncident({
  probeID,
  probeRequestURL,
}: Partial<Pick<Incident, 'probeRequestURL'>> &
  Pick<Incident, 'probeID'>): void {
  const newIncidents = getIncidents().filter((incident) => {
    if (!probeRequestURL) {
      return probeID !== incident.probeID
    }

    return (
      probeID !== incident.probeID ||
      probeRequestURL !== incident.probeRequestURL
    )
    // remove incidents with exact mach of probeID and url
  })

  setContext({ incidents: newIncidents })
}
