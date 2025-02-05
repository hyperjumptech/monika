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

import { validateNotification } from '@hyperjumptech/monika-notification'
import { Ajv } from 'ajv'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Joi from 'joi'

import { getContext } from '../../context/index.js'
import type { Config, SymonConfig } from '../../interfaces/config.js'
import { validateProbes } from './validation/index.js'
import { isSymonModeFrom } from './index.js'

export const validateConfig = async (
  configuration: Config
): Promise<Config> => {
  const { notifications = [], probes = [], symon } = configuration
  const [validatedProbes] = await Promise.all([
    validateProbes(probes),
    validateNotification(notifications),
    validateSymon(symon),
  ])
  const validatedConfig = {
    ...configuration,
    notifications,
    probes: validatedProbes,
  }

  if (!isSymonModeFrom(getContext().flags)) {
    validateConfigWithJSONSchema(validatedConfig)
  }

  return validatedConfig
}

async function validateSymon(symonConfig?: SymonConfig) {
  if (!symonConfig) {
    return
  }

  const schema = Joi.object({
    id: Joi.string().required(),
    url: Joi.string().uri().required(),
    key: Joi.string().required(),
    projectID: Joi.string().required(),
    organizationID: Joi.string().required(),
    interval: Joi.number(),
  })

  await schema.validateAsync(symonConfig)
}

function validateConfigWithJSONSchema(config: Config) {
  const monikaConfigSchema = readFileSync(
    fileURLToPath(new URL('../../monika-config-schema.json', import.meta.url)),
    'utf8'
  )

  const ajv = new Ajv()
  const validate = ajv.compile(JSON.parse(monikaConfigSchema))
  const isValid = validate(config)

  if (!isValid) {
    throw new Error(
      `${validate.errors?.[0].instancePath} ${validate.errors?.[0].message}`
    )
  }
}
