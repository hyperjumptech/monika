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

import yaml from 'js-yaml'
import fs from 'fs'
import Ajv from 'ajv'
import { Validation } from '../../interfaces/validation'
import mySchema from '../../monika-config-schema.json'

const ajv = new Ajv()

// validate the config file used by monika
export function validateConfigFile(filename: string): Validation {
  const validResult: Validation = {
    valid: false,
    message: `Errors detected in config file ${filename}`,
  }
  const validate = ajv.compile(mySchema)

  try {
    const configFile = yaml.load(fs.readFileSync(filename, 'utf8'))
    const isValid = validate(configFile)

    if (isValid) {
      validResult.valid = true
      validResult.message = `config: ${filename} is ok`
      return validResult
    }
  } catch (error: any) {
    console.error('error:', error)
    validResult.message = error
  }

  if (validate.errors) {
    for (const err of validate.errors) {
      validResult.message += ', ' + err.message
    }

    validResult.message += '.'
  }

  return validResult
}
