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
import type { Probe, ProbeAlert } from '../../interfaces/probe.js'
import { randomUUID } from 'node:crypto'
import { log } from '../../utils/pino.js'

let decompactedProbes: Probe[] = []

export function compactProbes(probes: Probe[]): Probe[] {
  if (probes.length === 0) {
    return []
  }

  decompactedProbes = probes
  const identicalProbeIds = identifyIdenticalProbes(probes)
  for (const set of identicalProbeIds) {
    const identicalProbeIdsArray = [...set]
    log.info(
      `Found identical probes, following probes IDs will be compacted on runtime: ${identicalProbeIdsArray.join(
        ', '
      )}`
    )
  }

  if (identicalProbeIds.length === 0) {
    return probes.map((probe) => {
      const mergedProbeAlerts = mergeProbeAlerts([probe])
      mergedProbeAlerts.id = probe.id
      delete mergedProbeAlerts.jointId
      return mergedProbeAlerts
    })
  }

  const nonIdenticalProbes = probes
    .filter((probe) => !identicalProbeIds.some((set) => set.has(probe.id)))
    .map((probe) => mergeProbeAlerts([probe]))

  const mergedProbes = identicalProbeIds.map<Probe>((set) => {
    const identicalProbes = probes.filter((probe) => set.has(probe.id))
    return mergeProbeAlerts(identicalProbes)
  })

  return [...nonIdenticalProbes, ...mergedProbes]
}

export function getDecompactedProbesById(probeId: string): Probe | undefined {
  return decompactedProbes.find((probe) => probe.id === probeId)
}

function mergeProbeAlerts(probes: Probe[]): Probe {
  const mergedAlerts = probes.flatMap((probe) => probe.alerts)
  let mergedProbe: Probe = {
    ...mergeInnerAlerts(probes[0], probes[0]),
    alerts: deduplicateAlerts(mergedAlerts),
  }

  for (const p of probes.slice(1)) {
    mergedProbe = mergeInnerAlerts(p, mergedProbe)
  }

  return {
    ...mergedProbe,
    id: randomUUID(),
    jointId: probes.map((probe) => probe.id),
  }
}

// merge corresponding alerts from the probes
function mergeInnerAlerts(newProbe: Probe, destination: Probe): Probe {
  destination = mergeHttpAlerts(newProbe, destination)
  destination = mergeSocketAlerts(newProbe, destination)
  destination = mergeRedisAlerts(newProbe, destination)
  destination = mergeMongoAlerts(newProbe, destination)
  destination = mergeMariaDbAlerts(newProbe, destination)
  destination = mergeMysqlAlerts(newProbe, destination)
  destination = mergePostgresAlerts(newProbe, destination)
  destination = mergePingAlerts(newProbe, destination)

  return destination
}

function deduplicateAlerts(alerts: ProbeAlert[]): ProbeAlert[] {
  if (alerts.filter((a) => a !== undefined).length === 0) {
    return []
  }

  const deduplicatedAlerts: ProbeAlert[] = [alerts[0]]
  for (const alert of alerts.slice(1)) {
    // Check if the alert is already in the deduplicatedAlerts
    const isAlertExist = deduplicatedAlerts.some((a) => {
      const firstPayload: Partial<ProbeAlert> = lodash.cloneDeep(a)
      const secondPayload: Partial<ProbeAlert> = lodash.cloneDeep(alert)
      if (firstPayload?.id) {
        delete firstPayload.id
      }

      if (secondPayload?.id) {
        delete secondPayload.id
      }

      return lodash.isEqual(firstPayload, secondPayload)
    })

    if (alert !== undefined && !isAlertExist) {
      deduplicatedAlerts.push(alert)
    }
  }

  return deduplicatedAlerts
}

function mergeHttpAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.requests &&
    (newProbe.requests?.every((r) => r.alerts?.length) ||
      destination.requests.every((r) => r.alerts?.length))
  ) {
    const mergedRequestAlerts: ProbeAlert[] = [
      ...(destination.requests?.flatMap((r) => r.alerts) || []),
      ...(newProbe?.requests?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]

    return {
      ...destination,
      requests: [
        ...(destination?.requests?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedRequestAlerts),
        })) || []),
      ],
    }
  }

  return destination
}

function mergeSocketAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.socket &&
    (newProbe.socket?.alerts?.length || destination.socket?.alerts?.length)
  ) {
    const mergedSocketAlerts: ProbeAlert[] = [
      ...(destination.socket?.alerts || []),
      ...(newProbe.socket?.alerts || []),
    ]
    return {
      ...destination,
      socket: {
        ...destination.socket,
        alerts: deduplicateAlerts(mergedSocketAlerts),
      },
    }
  }

  return destination
}

function mergeRedisAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.redis &&
    (newProbe.redis?.every((r) => r.alerts?.length) ||
      destination.redis.every((r) => r.alerts?.length))
  ) {
    const mergedRedisAlerts: ProbeAlert[] = [
      ...(destination.redis?.flatMap((r) => r.alerts) || []),
      ...(newProbe.redis?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]
    return {
      ...destination,
      redis: [
        ...(destination.redis?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedRedisAlerts),
        })) || []),
      ],
    }
  }

  return destination
}

function mergeMongoAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.mongo &&
    (destination.mongo.every((r) => r.alerts?.length) ||
      newProbe.mongo?.every((r) => r.alerts?.length))
  ) {
    const mergedMongoAlerts: ProbeAlert[] = [
      ...(destination.mongo?.flatMap((r) => r.alerts) || []),
      ...(newProbe.mongo?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]
    return {
      ...destination,
      mongo: [
        ...(destination.mongo?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedMongoAlerts),
        })) || []),
      ],
    }
  }

  return destination
}

function mergeMariaDbAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.mariadb &&
    (destination.mariadb.every((r) => r.alerts?.length) ||
      newProbe.mariadb?.every((r) => r.alerts?.length))
  ) {
    const mergedMariadbAlerts: ProbeAlert[] = [
      ...(destination.mariadb?.flatMap((r) => r.alerts) || []),
      ...(newProbe.mariadb?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]
    return {
      ...destination,
      mariadb: [
        ...(destination.mariadb?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedMariadbAlerts),
        })) || []),
      ],
    }
  }

  return destination
}

function mergeMysqlAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.mysql &&
    (destination.mysql.every((r) => r.alerts?.length) ||
      newProbe.mysql?.every((r) => r.alerts?.length))
  ) {
    const mergedMysqlAlerts: ProbeAlert[] = [
      ...(destination.mysql?.flatMap((r) => r.alerts) || []),
      ...(newProbe.mysql?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]
    return {
      ...destination,
      mysql: [
        ...(destination.mysql?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedMysqlAlerts),
        })) || []),
      ],
    }
  }

  return destination
}

function mergePostgresAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.postgres &&
    (destination.postgres.every((r) => r.alerts?.length) ||
      newProbe.postgres?.every((r) => r.alerts?.length))
  ) {
    const mergedPostgresAlerts: ProbeAlert[] = [
      ...(destination.postgres?.flatMap((r) => r.alerts) || []),
      ...(newProbe.postgres?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]
    return {
      ...destination,
      postgres: [
        ...(destination.postgres?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedPostgresAlerts),
        })) || []),
      ],
    }
  }

  return destination
}

function mergePingAlerts(newProbe: Probe, destination: Probe): Probe {
  if (
    destination.ping &&
    (destination.ping.every((r) => r.alerts?.length) ||
      newProbe.ping?.every((r) => r.alerts?.length))
  ) {
    const mergedPingAlerts: ProbeAlert[] = [
      ...(destination.ping?.flatMap((r) => r.alerts) || []),
      ...(newProbe.ping?.flatMap((r) => r.alerts) || []),
    ] as ProbeAlert[]
    return {
      ...destination,
      ping: [
        ...(destination.ping?.map((r) => ({
          ...r,
          alerts: deduplicateAlerts(mergedPingAlerts),
        })) || []),
      ],
    }
  }

  return destination
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

/**
 * internalIdentification is a helper function to identify identical probes based on specific fields
 * @param fieldIdentifiers identifiers to determine if probes are identical
 * @param probes array of probes
 * @returns array of sets of identical probe IDs
 */
// suppress double loop complexity
// eslint-disable-next-line complexity
function internalIdentification(
  fieldIdentifiers: (keyof Probe)[],
  probes: Probe[]
): Set<string>[] {
  const identicalProbeIds: Set<string>[] = []

  for (const outerProbe of probes) {
    // skip probes with multiple probe types
    const isChainingMultipleProbeTypes =
      [
        outerProbe.requests,
        outerProbe.socket,
        outerProbe.redis,
        outerProbe.mongo,
        outerProbe.mariadb,
        outerProbe.mysql,
        outerProbe.postgres,
        outerProbe.ping,
      ].filter((probe) => probe !== undefined).length > 1

    if (isChainingMultipleProbeTypes) {
      continue
    }

    // skip probes with request chaining
    const isChainingHttp = outerProbe.requests && outerProbe.requests.length > 1
    const isChainingRedis = outerProbe.redis && outerProbe.redis.length > 1
    const isChainingMongo = outerProbe.mongo && outerProbe.mongo.length > 1
    const isChainingMariaDb =
      outerProbe.mariadb && outerProbe.mariadb.length > 1
    const isChainingMysql = outerProbe.mysql && outerProbe.mysql.length > 1
    const isChainingPostgres =
      outerProbe.postgres && outerProbe.postgres.length > 1
    const isChainingPing = outerProbe.ping && outerProbe.ping.length > 1
    if (
      isChainingHttp ||
      isChainingRedis ||
      isChainingMongo ||
      isChainingMariaDb ||
      isChainingMysql ||
      isChainingPostgres ||
      isChainingPing
    ) {
      continue
    }

    // skip if probe is already identified as identical
    const isIdentified = identicalProbeIds.some((set) => set.has(outerProbe.id))
    if (isIdentified) {
      continue
    }

    // get the values of the fields to be used for comparison
    const currentProbeValues = stripNameAndAlerts(outerProbe, fieldIdentifiers)

    // skip if there are undefined values from identifiers
    if (currentProbeValues.includes(undefined)) {
      continue
    }

    const identicalProbeIdsSet = new Set<string>()
    for (const innerProbe of probes) {
      // skip if innerProbe has the same ID as the current probe
      if (outerProbe.id === innerProbe.id) {
        continue
      }

      // get the values of the fields to be used for comparison
      const innerProbeFieldValues = stripNameAndAlerts(
        innerProbe,
        fieldIdentifiers
      )

      // compare the values of the fields using deep equality
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

function stripNameAndAlerts(probe: Probe, fieldIdentifiers: (keyof Probe)[]) {
  const strippedProbe = fieldIdentifiers.map((key) => {
    // clone the value to prevent mutation
    let value = lodash.cloneDeep(probe[key])
    if (value !== undefined) {
      value = deleteNameFromProbe(value) as never
      value = deleteAlertsFromProbe(value) as never
    }

    return value
  })

  return strippedProbe
}

function deleteNameFromProbe(values: unknown): unknown {
  if (typeof values === 'object' && values !== null && 'name' in values) {
    delete values.name
  }

  return values
}

function deleteAlertsFromProbe(values: unknown): unknown {
  if (Array.isArray(values)) {
    return values.map((value) => deleteAlertsFromProbe(value))
  }

  if (typeof values === 'object' && values !== null && 'alerts' in values) {
    delete values.alerts
  }

  return values
}
