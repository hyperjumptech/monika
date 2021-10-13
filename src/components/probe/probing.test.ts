/* eslint-disable max-depth */
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

import { expect } from 'chai'
import { RequestInterceptor } from 'node-request-interceptor'
import withDefaultInterceptors from 'node-request-interceptor/lib/presets/default'
import { probing } from './probing'

describe('Probing', () => {
  let interceptor: any
  beforeEach(() => {
    interceptor = new RequestInterceptor(withDefaultInterceptors)
  })
  afterEach(() => {
    interceptor.restore()
  })
  describe('probing function', () => {
    it('should render correct headers', async () => {
      let verifyHeader: any = {}
      let tokens = ['1', '2']
      let sentToken = ''
      interceptor.use((req: any) => {
        // mock login
        if (['http://localhost:4000/get_key'].includes(req.url.href)) {
          const token = tokens[tokens.length - 1]
          tokens = tokens.slice(0, -1)
          sentToken = token
          return {
            status: 200,
            body: JSON.stringify({
              token,
            }),
          }
        }

        // mock verify
        if (['http://localhost:4000/verify'].includes(req.url.href)) {
          verifyHeader = req.headers
          return {
            status: 200,
            body: JSON.stringify({
              verified: 'true',
            }),
          }
        }
      })

      // create the requests
      const requests: any = [
        {
          url: 'http://localhost:4000/get_key',
          body: JSON.parse('{}'),
          timeout: 10,
        },
        {
          url: 'http://localhost:4000/verify',
          method: 'POST',
          headers: {
            Authorization: '{{ responses.[0].data.token }}',
          },
          body: JSON.parse('{}'),
          timeout: 10,
        },
      ]

      const results: any = []
      for (let i = 0; i < 2; i++) {
        const responses: any = []
        for (let j = 0; j < requests.length; j++) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const resp = await probing(requests[j], responses)
            responses.push(resp)
            if (j !== 0) {
              results.push({
                sentToken: verifyHeader.authorization,
                expectedToken: sentToken,
              })
            }
          } catch {}
        }
      }

      for (let k = 0; k < results.length; k++) {
        expect(results[k].sentToken).to.be.equals(results[k].expectedToken)
      }
    })
  })
})
