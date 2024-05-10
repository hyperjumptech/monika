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

/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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

import { getContext } from '../../../context'
import type { Config } from '../../../interfaces/config'
import { monikaFlagsDefaultValue } from '../../../flag'
import type { Probe, ProbeAlert } from '../../../interfaces/probe'
import { isValidURL } from '../../../utils/is-valid-url'

export const parseConfigFromText = (configString: string): Config => {
  let probes: Probe[] = []
  const urls = configString.split(/\r?\n/)
  for (const [, url] of urls.entries()) {
    if (isValidURL(url)) {
      probes = [
        ...probes,
        {
          id: url,
          name: url,
          requests: [
            {
              url,
              method: 'GET',
              timeout: 10_000,
              body: {} as JSON,
              followRedirects: getContext().flags['follow-redirects'],
            },
          ],
          interval: monikaFlagsDefaultValue['config-interval'],
          alerts: [
            {
              assertion: 'response.status < 200 or response.status > 299',
              message: 'HTTP Status is not 200',
            },
            {
              assertion: 'response.time > 2000',
              message: 'Response time is more than 2000ms',
            },
          ] as ProbeAlert[],
        },
      ]
    }
    // Ignoring new line from url validating checker
    else if (url.length > 0) {
      throw new Error(`The URL ${url} is not a valid URL`)
    }
  }

  return { probes }
}
