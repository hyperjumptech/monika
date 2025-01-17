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

import type { RequestOptions } from 'node:https'
import sslChecker from 'ssl-checker'
import type { Domain } from '../../interfaces/config.js'

export async function checkTLS(
  domain: Domain,
  // default expiry threshold is 30 days
  expiryThreshold = 30
): Promise<null> {
  const hostname = getHostname(domain)
  const requestOptions = getRequestOptions(domain)

  const { valid, validTo, daysRemaining } = await sslChecker(
    hostname,
    requestOptions
  )

  if (!valid) {
    throw new Error(
      `${hostname} security certificate has expired at ${validTo}!`
    )
  }

  if (daysRemaining <= expiryThreshold) {
    throw new Error(
      `${hostname} security certificate will expire at ${validTo}!`
    )
  }

  return null
}

export function getHostname(domain: Domain): string {
  if (typeof domain === 'string') {
    return domain
  }

  return domain.domain
}

function getRequestOptions(domain: Domain): RequestOptions | undefined {
  if (typeof domain === 'string') {
    return undefined
  }

  return domain?.options
}
