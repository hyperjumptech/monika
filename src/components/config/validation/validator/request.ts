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

import { RequestConfig } from '../../../../interfaces/request'
import { HTTPMethods } from '../../../../utils/http'
import { isValidURL } from '../../../../utils/is-valid-url'

const PROBE_REQUEST_INVALID_METHOD =
  'Probe request method is invalid! Valid methods are GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, PURGE, LINK, and UNLINK'
const PROBE_REQUEST_NO_URL = 'Probe request URL does not exists'

const checkProbeRequestProperties = (
  requests: RequestConfig[]
): string | undefined => {
  if (requests?.length > 0) {
    for (const request of requests) {
      const { method, ping, url } = request

      if (!url) {
        return PROBE_REQUEST_NO_URL
      }

      // if not a ping request and url not valid, return INVLID_URL error
      if (ping !== true && !isValidURL(url)) {
        return `Probe request URL (${url}) should start with http:// or https://`
      }

      if (!HTTPMethods.has(method?.toUpperCase() ?? 'GET'))
        return PROBE_REQUEST_INVALID_METHOD
    }
  }
}

export const validateRequests = (
  requests?: RequestConfig[]
): string | undefined => {
  if (requests === undefined) {
    return
  }

  for (const req of requests) {
    if (req.timeout <= 0) {
      return `The timeout in the request with id "${req.id}" should be greater than 0.`
    }
  }

  const probeRequestPropertyMessage = checkProbeRequestProperties(requests)
  if (probeRequestPropertyMessage) {
    return probeRequestPropertyMessage
  }
}
