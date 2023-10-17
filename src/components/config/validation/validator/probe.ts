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
import type { Probe } from '../../../../interfaces/probe'
import { validateAlerts } from './alert'

export async function validateProbes(probes: Probe[]): Promise<Probe[]> {
  const alertSchema = joi.object({
    assertion: joi.string().allow(''),
    id: joi.string().allow(''),
    message: joi.string().allow(''),
    query: joi.string().allow(''),
  })
  const mysqlSchema = joi.object({
    command: joi.string().allow(''),
    data: joi.alternatives().try(joi.string().allow(''), joi.number()),
    database: joi.string().allow(''),
    host: joi
      .alternatives()
      .try(joi.string().allow('').hostname(), joi.string().allow('').ip())
      .required(),
    password: joi.string().allow(''),
    port: joi.number(),
    username: joi.string().allow(''),
  })
  const schema = joi
    .array<Probe[]>()
    .min(1)
    .items(
      joi.object({
        alerts: joi.array().items(alertSchema),
        description: joi.string().allow(''),
        id: joi.string().required(),
        interval: joi.number().min(1),
        lastEvent: joi.object({
          createdAt: joi.string().allow(''),
          recoveredAt: joi.string().allow('', null),
        }),
        name: joi.string().allow(''),
        mariadb: joi.array().items(mysqlSchema),
        mysql: joi.array().items(mysqlSchema),
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
              port: joi.number().min(0).max(65_536),
              username: joi.string().allow(''),
            }),
          ])
        ),
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
              port: joi.number(),
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
          .min(1)
          .items(
            joi.object({
              alerts: joi.array().items(alertSchema),
              allowUnauthorized: joi.bool(),
              body: joi
                .alternatives()
                .try(joi.string().allow('', null), joi.object()),
              headers: joi.object().allow(null),
              id: joi.string().allow(''),
              interval: joi.number().min(1),
              method: joi
                .string()
                .valid(
                  '',
                  'GET',
                  'POST',
                  'PUT',
                  'PATCH',
                  'DELETE',
                  'HEAD',
                  'OPTIONS',
                  'PURGE',
                  'LINK',
                  'UNLINK'
                )
                .insensitive(),
              ping: joi.bool(),
              saveBody: joi.bool(),
              timeout: joi.number().min(1).allow(null),
              url: joi.string().uri().required(),
            })
          ),
        socket: joi.object({
          alerts: joi.array().items(alertSchema),
          data: joi.string().allow('', null),
          host: joi.string().required(),
          port: joi.number().required(),
        }),
      })
    )

  try {
    const validatedProbes = await schema.validateAsync(probes, {
      stripUnknown: true,
    })

    for (const probe of validatedProbes) {
      const validateAlertError = validateAlerts(combineAlerts(probe))
      if (validateAlertError) {
        throw new Error(validateAlertError)
      }
    }

    return validatedProbes
  } catch (error: any) {
    throw new Error(`Probe validation error: ${error?.message}`)
  }
}

function combineAlerts(probe: Probe) {
  const httpAlerts =
    probe?.requests?.map(({ alerts }) => alerts).find(Boolean) || []
  const mariadbAlerts =
    probe?.mariadb?.map(({ alerts }) => alerts).find(Boolean) || []
  const mongoAlerts =
    probe?.mongo?.map(({ alerts }) => alerts).find(Boolean) || []
  const mysqlAlerts =
    probe?.mysql?.map(({ alerts }) => alerts).find(Boolean) || []
  const pingAlerts =
    probe?.ping?.map(({ alerts }) => alerts).find(Boolean) || []
  const postgresAlerts =
    probe?.postgres?.map(({ alerts }) => alerts).find(Boolean) || []
  const redisAlerts =
    probe?.redis?.map(({ alerts }) => alerts).find(Boolean) || []
  const socketAlerts = probe?.socket?.alerts || []

  return [
    ...(probe?.alerts || []),
    ...httpAlerts,
    ...mariadbAlerts,
    ...mongoAlerts,
    ...mysqlAlerts,
    ...pingAlerts,
    ...postgresAlerts,
    ...redisAlerts,
    ...socketAlerts,
  ]
}
