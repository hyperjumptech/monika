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

import sslChecker from 'ssl-checker'

export async function checkTLS(host: any, expiryThreshold = 30) {
  const hostIsObject = typeof host === "object" &&
    Object.prototype.hasOwnProperty.call(host, 'domain')
  const hostOptions = hostIsObject &&
    Object.prototype.hasOwnProperty.call(host, 'options')
    ? host.options : undefined
  const domain = hostIsObject ? host.domain : host

  const { valid, validTo, daysRemaining } = hostIsObject
    ? await sslChecker(domain, hostOptions)
    : await sslChecker(domain)

  if (!valid) {
    throw new Error(`${domain} security certificate has expired at ${validTo}!`)
  }

  if (daysRemaining <= expiryThreshold) {
    throw new Error(`${domain} security certificate will expire at ${validTo}!`)
  }

  return null
}
