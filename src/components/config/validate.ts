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

import { getContext } from '../../context'
import { Config } from '../../interfaces/config'
import { Validation } from '../../interfaces/validation'
import { setInvalidResponse, VALID_CONFIG } from '../../utils/validate-response'
import validator from './validation'

export const validateConfig = (configuration: Config): Validation => {
  const { flags } = getContext()
  const { notifications = [], probes = [], symon } = configuration
  const symonConfigError = validator.validateSymonConfig(symon)

  const validateNotificationError =
    validator.validateNotification(notifications)
  if (validateNotificationError) {
    return setInvalidResponse(validateNotificationError)
  }

  const validateProbesError = validator.validateProbes(probes)
  if (validateProbesError) {
    return setInvalidResponse(validateProbesError)
  }

  if (symonConfigError) {
    return setInvalidResponse(`Monika configuration: symon ${symonConfigError}`)
  }

  // check config file against monika-config-schema.json only if a configfile is passed
  if (flags.config.length > 0) {
    const isValidConfig = validator.validateConfigWithSchema(configuration)
    if (isValidConfig.valid === false) return isValidConfig
  }

  return VALID_CONFIG
}
