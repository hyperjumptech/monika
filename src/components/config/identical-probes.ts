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

import lodash from 'lodash'
import type { Probe } from '../../interfaces/probe'
import type { ValidatedConfig } from '../../interfaces/config'

// Function to identify identical probes based on specific fields
export async function identifyIdenticalProbes(
  config: ValidatedConfig
): Promise<Set<string>[]> {
  const { probes } = config
  // Define fields that are used to determine if probes are identical
  const httpIdentifiers: (keyof Probe)[] = ['interval', 'requests']
  const socketIdentifiers: (keyof Probe)[] = ['interval', 'socket']
  const redisIdentiers: (keyof Probe)[] = ['interval', 'redis']
  const mongoIdentiers: (keyof Probe)[] = ['interval', 'mongo']
  const mariadbIdentiers: (keyof Probe)[] = ['interval', 'mariadb']
  const mysqlIdentiers: (keyof Probe)[] = ['interval', 'mysql']
  const postgresIdentiers: (keyof Probe)[] = ['interval', 'postgres']
  const pingIdentiers: (keyof Probe)[] = ['interval', 'ping']

  return Promise.all([
    internalIdentification(httpIdentifiers, probes),
    internalIdentification(socketIdentifiers, probes),
    internalIdentification(redisIdentiers, probes),
    internalIdentification(mongoIdentiers, probes),
    internalIdentification(mariadbIdentiers, probes),
    internalIdentification(mysqlIdentiers, probes),
    internalIdentification(postgresIdentiers, probes),
    internalIdentification(pingIdentiers, probes),
  ])
}

async function internalIdentification(
  fieldIdentifiers: (keyof Probe)[],
  probes: Probe[]
): Promise<Set<string>> {
  const identicalProbeIds: Set<string> = new Set()

  // Iterate through each probe
  // eslint-disable-next-line guard-for-in
  for (const index in probes) {
    const outerProbe = probes[index]
    // Skip probes without requests
    if (!outerProbe.requests?.length) continue

    // Create an identifier for the outer probe
    const outerIdentifier = fieldIdentifiers
      // Get values from each field
      .map((i) => outerProbe[i])
      // Set 'alerts' fields to undefined for comparison
      .map((configValue) => {
        if (
          typeof configValue === 'object' &&
          Object.keys(configValue).includes('alerts')
        ) {
          return { ...configValue, alerts: undefined }
        }

        if (Array.isArray(configValue)) {
          return configValue.map((c) => ({ ...c, alerts: undefined }))
        }

        return configValue
      })

    // Get all probes except the current one
    const innerProbes = probes.filter((p) => p.id !== outerProbe.id)

    // Compare the outer probe with each inner probe
    // eslint-disable-next-line guard-for-in
    for (const jIndex in innerProbes) {
      const innerProbe = innerProbes[jIndex]
      // Skip probes without requests
      if (!innerProbe.requests?.length) continue

      // Create an identifier for the inner probe
      const innerIdentifier = fieldIdentifiers
        // Get values from each field
        .map((i) => innerProbe[i])
        // Set 'alerts' fields to undefined for comparison
        .map((configValue) => {
          if (
            typeof configValue === 'object' &&
            Object.keys(configValue).includes('alerts')
          ) {
            return { ...configValue, alerts: undefined }
          }

          if (Array.isArray(configValue)) {
            return configValue.map((c) => ({ ...c, alerts: undefined }))
          }

          return configValue
        })

      // Compare outer and inner identifiers
      if (lodash.isEqual(outerIdentifier, innerIdentifier)) {
        // Add probe IDs to the set of identical probes
        if (!identicalProbeIds.has(outerProbe.id)) {
          identicalProbeIds.add(outerProbe.id)
        }

        identicalProbeIds.add(innerProbe.id)
      }
    }
  }

  // Return the set of identical probe IDs
  return identicalProbeIds
}
