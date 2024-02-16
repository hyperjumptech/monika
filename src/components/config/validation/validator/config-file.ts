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

import Ajv from 'ajv'
import { Validation } from '../../../../interfaces/validation.js'
import { Config } from '../../../../interfaces/config.js'
import { readFileSync } from 'fs'

// eslint-disable-next-line new-cap
const ajv = new Ajv.default()

// validate the config file  loaded by monika against a JSON Schema
export function validateConfigWithSchema(config: Partial<Config>): Validation {
  const monikaConfigSchema = readFileSync(
    '../../../../monika-config-schema.json'
  )
  const mySchema = JSON.parse(String(monikaConfigSchema))
  const result: Validation = {
    valid: false,
    message: `Errors detected in config file ${JSON.stringify(
      config,
      null,
      2
    )}`,
  }

  const validate = ajv.compile(mySchema)

  const isValid = validate(config)

  if (isValid) {
    result.valid = true
    result.message = `config: ${config} is ok`
    return result
  }

  return result
}
