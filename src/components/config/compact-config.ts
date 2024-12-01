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

export function compactProbes(probes: Probe[]): Probe[] {
  const identicalProbeIds = identifyIdenticalProbes(probes)
  if (identicalProbeIds.length === 0) {
    return probes
  }

  const nonIdenticalProbes = probes.filter(
    (probe) => !identicalProbeIds.some((set) => set.has(probe.id))
  )

  const mergedProbes = identicalProbeIds.map<Probe>((set) => {
    const identicalProbes = probes.filter((probe) => set.has(probe.id))
    return mergeProbes(identicalProbes)
  })

  return [...nonIdenticalProbes, ...mergedProbes]
}

function mergeProbes(probes: Probe[]): Probe {
  const mergedIds = probes.map((probe) => probe.id).join('|')
  const mergedAlerts = probes.flatMap((probe) => probe.alerts ?? [])
  let probe = probes[0]
  for (const p of probes.slice(1)) {
    probe = { ...probe, ...p, alerts: mergedAlerts, id: mergedIds }
  }

  return probe
}

// Function to identify identical probes based on specific fields
function identifyIdenticalProbes(probes: Probe[]): Set<string>[] {
  // Define fields that are used to determine if probes are identical
  const httpIdentifiers: (keyof Probe)[] = ['interval', 'requests']
  const socketIdentifiers: (keyof Probe)[] = ['interval', 'socket']
  const redisIdentiers: (keyof Probe)[] = ['interval', 'redis']
  const mongoIdentiers: (keyof Probe)[] = ['interval', 'mongo']
  const mariadbIdentiers: (keyof Probe)[] = ['interval', 'mariadb']
  const mysqlIdentiers: (keyof Probe)[] = ['interval', 'mysql']
  const postgresIdentiers: (keyof Probe)[] = ['interval', 'postgres']
  const pingIdentiers: (keyof Probe)[] = ['interval', 'ping']

  return [
    ...internalIdentification(httpIdentifiers, probes),
    ...internalIdentification(socketIdentifiers, probes),
    ...internalIdentification(redisIdentiers, probes),
    ...internalIdentification(mongoIdentiers, probes),
    ...internalIdentification(mariadbIdentiers, probes),
    ...internalIdentification(mysqlIdentiers, probes),
    ...internalIdentification(postgresIdentiers, probes),
    ...internalIdentification(pingIdentiers, probes),
  ]
}

// suppress double loop complexity
// eslint-disable-next-line complexity
function internalIdentification(
  fieldIdentifiers: (keyof Probe)[],
  probes: Probe[]
): Set<string>[] {
  const identicalProbeIds: Set<string>[] = []

  for (const outerProbe of probes) {
    // skip probes with request chaining
    const isChainingHttp = outerProbe.requests && outerProbe.requests.length > 1
    const isRedisChaining = outerProbe.redis && outerProbe.redis.length > 1
    const isMongoChaining = outerProbe.mongo && outerProbe.mongo.length > 1
    const isMariaDbChaining =
      outerProbe.mariadb && outerProbe.mariadb.length > 1
    const isMysqlChaining = outerProbe.mysql && outerProbe.mysql.length > 1
    const isPostgresChaining =
      outerProbe.postgres && outerProbe.postgres.length > 1
    const isPingChaining = outerProbe.ping && outerProbe.ping.length > 1
    if (
      isChainingHttp ||
      isRedisChaining ||
      isMongoChaining ||
      isMariaDbChaining ||
      isMysqlChaining ||
      isPostgresChaining ||
      isPingChaining
    ) {
      continue
    }

    // skip if probe is already identified as identical
    const isIdentified = identicalProbeIds.some((set) => set.has(outerProbe.id))
    if (isIdentified) {
      continue
    }

    const currentProbeValues = fieldIdentifiers.map((key) => outerProbe[key])
    const identicalProbeIdsSet = new Set<string>()
    for (const innerProbe of probes) {
      // skip if innerProbe has the same ID as the current probe
      if (outerProbe.id === innerProbe.id) {
        continue
      }

      const innerProbeFieldValues = fieldIdentifiers.map(
        (key) => innerProbe[key]
      )

      if (lodash.isEqual(currentProbeValues, innerProbeFieldValues)) {
        identicalProbeIdsSet.add(outerProbe.id)
        identicalProbeIdsSet.add(innerProbe.id)
      }
    }

    if (identicalProbeIdsSet.size > 0) {
      identicalProbeIds.push(identicalProbeIdsSet)
    }
  }

  // Return the set of identical probe IDs
  return identicalProbeIds
}
