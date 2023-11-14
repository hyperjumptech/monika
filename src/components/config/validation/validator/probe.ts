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

import joi from 'joi'
import { v4 as uuid } from 'uuid'
import type { Probe, ProbeAlert } from '../../../../interfaces/probe'
import { isSymonModeFrom } from '../..'
import { getContext } from '../../../../context'
import { FAILED_REQUEST_ASSERTION } from '../../../../looper'
import { compileExpression } from '../../../../utils/expression-parser'
import { isValidURL } from '../../../../utils/is-valid-url'
import {
  DEFAULT_INCIDENT_THRESHOLD,
  DEFAULT_INTERVAL,
  DEFAULT_RECOVERY_THRESHOLD,
} from './default-values'

export async function validateProbes(probes: Probe[]): Promise<Probe[]> {
  const alertSchema = joi.alternatives().try(
    joi.string(),
    joi
      .object({
        assertion: joi
          .string()
          .allow('')
          .default((parent) => {
            if (!parent.query) {
              return 'response.status < 200 or response.status > 299'
            }

            return parent.query
          }),
        id: joi.string().allow(''),
        message: joi.string().allow(''),
        query: joi.string().allow(''),
      })
      .custom((alert) => {
        try {
          isValidProbeAlert(alert)
        } catch {
          if (isSymonModeFrom(getContext().flags)) {
            return
          }

          throw new Error(
            `Probe alert format is invalid! (${JSON.stringify(alert, null, 1)})`
          )
        }

        return alert
      })
  )
  const mysqlSchema = joi.object({
    command: joi.string().allow(''),
    data: joi.alternatives().try(joi.string().allow(''), joi.number()),
    database: joi.string().allow(''),
    host: joi
      .alternatives()
      .try(joi.string().allow('').hostname(), joi.string().allow('').ip())
      .required(),
    password: joi.string().allow(''),
    port: joi.number().default(3306),
    username: joi.string().allow(''),
  })
  const schema = joi
    .array<Probe[]>()
    .min(isSymonModeFrom(getContext().flags) ? 0 : 1)
    .messages({
      'array.min': 'Probes object does not exists or has length lower than 1!',
    })
    .items(
      joi
        .object({
          alerts: joi
            .array()
            .items(alertSchema)
            .default((parent) => {
              if (isSymonModeFrom(getContext().flags)) {
                return []
              }

              const isHTTPProbe = Boolean(parent.requests)

              if (!isHTTPProbe) {
                return [{ id: uuid(), ...FAILED_REQUEST_ASSERTION }]
              }

              return [
                {
                  id: uuid(),
                  assertion: 'response.status < 200 or response.status > 299',
                  message:
                    'HTTP Status is {{ response.status }}, expecting 2xx',
                },
                {
                  id: uuid(),
                  assertion: 'response.time > 2000',
                  message:
                    'Response time is {{ response.time }}ms, expecting less than 2000ms',
                },
                { id: uuid(), ...FAILED_REQUEST_ASSERTION },
              ]
            }),
          description: joi.string().allow(''),
          id: joi.string().required(),
          incidentThreshold: joi
            .number()
            .default(DEFAULT_INCIDENT_THRESHOLD)
            .min(1),
          recoveryThreshold: joi
            .number()
            .default(DEFAULT_RECOVERY_THRESHOLD)
            .min(1),
          interval: joi.number().default(DEFAULT_INTERVAL).min(1),
          lastEvent: joi.object({
            createdAt: joi.string().allow(''),
            recoveredAt: joi.string().allow('', null),
          }),
          name: joi
            .string()
            .allow('')
            .default((parent) => `monika_${parent.id}`),
          mariadb: joi.array().items(mysqlSchema),
          mongo: joi.array().items(
            joi.alternatives([
              joi.object({
                alerts: joi.array().items(alertSchema),
                uri: joi.string().required(),
              }),
              joi.object({
                alerts: joi.array().items(alertSchema),
                host: joi
                  .alternatives()
                  .try(
                    joi.string().allow('').hostname(),
                    joi.string().allow('').ip()
                  )
                  .required(),
                password: joi.string().allow(''),
                port: joi.number().default(27_017).min(0).max(65_536),
                username: joi.string().allow(''),
              }),
            ])
          ),
          mysql: joi.array().items(mysqlSchema),
          ping: joi.array().items(
            joi.object({
              alerts: joi.array().items(alertSchema),
              uri: joi.string().required(),
            })
          ),
          postgres: joi.array().items(
            joi.alternatives([
              joi.object({
                alerts: joi.array().items(alertSchema),
                uri: joi.string().required(),
              }),
              joi.object({
                alerts: joi.array().items(alertSchema),
                command: joi.string().allow(''),
                data: joi
                  .alternatives()
                  .try(joi.string().allow(''), joi.number()),
                database: joi.string().allow(''),
                host: joi
                  .alternatives()
                  .try(
                    joi.string().allow('').hostname(),
                    joi.string().allow('').ip()
                  )
                  .required(),
                password: joi.string().allow(''),
                port: joi.number().default(5432),
                username: joi.string().allow(''),
              }),
            ])
          ),
          redis: joi.array().items(
            joi
              .object({
                alerts: joi.array().items(alertSchema),
                command: joi.string().allow(''),
                host: joi
                  .alternatives()
                  .try(
                    joi.string().allow('').hostname(),
                    joi.string().allow('').ip()
                  ),
                password: joi.string().allow(''),
                port: joi.number().min(0).max(65_536),
                uri: joi.string().allow(''),
                username: joi.string().allow(''),
              })
              .xor('host', 'uri')
              .and('host', 'port')
          ),
          requests: joi
            .array()
            .min(isSymonModeFrom(getContext().flags) ? 0 : 1)
            .items(
              joi.object({
                alerts: joi.array().items(alertSchema),
                allowUnauthorized: joi.bool(),
                body: joi
                  .alternatives()
                  .try(
                    joi.string().allow('', null),
                    joi.object(),
                    joi.array(),
                    joi.number(),
                    joi.bool()
                  ),
                headers: joi.object().allow(null),
                id: joi.string().allow(''),
                interval: joi.number().min(1),
                method: joi
                  .string()
                  .valid(
                    'CONNECT',
                    'GET',
                    'POST',
                    'PUT',
                    'PATCH',
                    'DELETE',
                    'HEAD',
                    'OPTIONS',
                    'PURGE',
                    'LINK',
                    'TRACE',
                    'UNLINK'
                  )
                  .default('GET')
                  .insensitive()
                  .label('Probe request method'),
                ping: joi.bool(),
                saveBody: joi.bool().default(false),
                timeout: joi.number().default(10_000).min(1).allow(null),
                url: joi
                  .string()
                  .custom((url) => {
                    if (!isValidURL(url)) {
                      throw new Error(
                        `Probe request URL (${url}) should start with http:// or https://`
                      )
                    }

                    return url
                  })
                  .label('Probe request URL')
                  .required(),
              })
            )
            .label('Probe requests'),
          socket: joi.object({
            alerts: joi.array().items(alertSchema),
            data: joi.string().allow('', null),
            host: joi.string().required(),
            port: joi.number().required(),
          }),
        })
        .custom((probe) => {
          if (!isProbeRequestExists(probe)) {
            throw new Error(
              'Probe requests does not exists or has length lower than 1!'
            )
          }

          return probe
        })
    )

  try {
    const validatedProbes = await schema.validateAsync(probes, {
      stripUnknown: true,
    })

    return transformDeprecatedAlerts(validatedProbes)
  } catch (error: any) {
    throw new Error(`Monika configuration is invalid. Probe: ${error?.message}`)
  }
}

function isProbeRequestExists(probe: Probe) {
  return (
    probe?.mariadb ||
    probe?.mongo ||
    probe?.mysql ||
    probe?.ping ||
    probe?.postgres ||
    probe?.redis ||
    probe?.requests ||
    probe?.socket
  )
}

const ALERT_QUERY = 'status-not-2xx'
const RESPONSE_TIME_PREFIX = 'response-time-greater-than-'

// parse string like "response-time-greater-than-200-ms" and return the time in ms
function parseAlertStringTime(str: string): number {
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

function isValidProbeAlert(alert: ProbeAlert | string) {
  if (typeof alert !== 'string') {
    const expression = alert.assertion || alert.query || ''
    const data = {
      response: {
        size: 0,
        status: 200,
        time: 0,
        body: '',
        headers: {},
      },
    }
    const filter = compileExpression(expression, Object.keys(data))

    filter(data)
    return
  }

  // Legacy alerts
  if (alert === ALERT_QUERY) {
    return
  }

  if (alert.startsWith(RESPONSE_TIME_PREFIX)) {
    parseAlertStringTime(alert)
    return
  }

  throw new Error('Unknown alert')
}

function transformDeprecatedAlerts(probes: Probe[]) {
  return probes.map((probe) => {
    const newAlerts = []

    if (!probe?.alerts) {
      return probe
    }

    for (const alert of probe.alerts) {
      if (typeof alert !== 'string') {
        newAlerts.push(alert)
        continue
      }

      if (alert === ALERT_QUERY) {
        newAlerts.push({
          id: uuid(),
          assertion: 'response.status < 200 or response.status > 299',
          message: 'HTTP status is {{ response.status }}, expecting 2xx',
        })
        continue
      }

      if ((alert as string).startsWith(RESPONSE_TIME_PREFIX)) {
        const expectedTime = parseAlertStringTime(alert)

        newAlerts.push({
          id: uuid(),
          assertion: `response.time > ${expectedTime}`,
          message: `Response time is {{ response.time }}ms, expecting less than ${expectedTime}ms`,
        })
      }
    }

    return { ...probe, alerts: newAlerts }
  })
}
