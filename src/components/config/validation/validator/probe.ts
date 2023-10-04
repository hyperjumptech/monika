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

import { Probe } from '../../../../interfaces/probe'
import { validateAlerts } from './alert'
import { validateRequests } from './request'
import { validateSchemaConfig } from './schema-config'

const NO_PROBES = 'Probes object does not exists or has length lower than 1!'
const PROBE_NO_REQUESTS =
  'Probe requests does not exists or has length lower than 1!'

const checkTotalProbes = (probe: Probe): string | undefined => {
  const { requests, socket, redis, mongo, postgres, mariadb, mysql, ping } =
    probe

  const totalProbes =
    (socket ? 1 : 0) +
    (redis ? 1 : 0) +
    (mongo ? 1 : 0) +
    (postgres ? 1 : 0) +
    (mariadb ? 1 : 0) +
    (mysql ? 1 : 0) +
    (ping ? 1 : 0) +
    (requests?.length ?? 0)
  if (totalProbes === 0) return PROBE_NO_REQUESTS
}

export const validateProbes = (probes: Probe[]): string | undefined => {
  if (probes.length === 0) return NO_PROBES

  for (const probe of probes) {
    const { name, interval, requests } = probe

    if (interval <= 0) {
      return `The interval in the probe with name "${name}" should be greater than 0.`
    }

    const totalProbesError = checkTotalProbes(probe)
    if (totalProbesError) {
      return totalProbesError
    }

    const schemaConfigError = validateSchemaConfig(probe)
    if (schemaConfigError) {
      return schemaConfigError
    }

    const validateRequestsError = validateRequests(requests)
    if (validateRequestsError) {
      return validateRequestsError
    }

    const validateAlertError = validateAlerts(probe)
    if (validateAlertError) {
      return validateAlertError
    }
  }
}
