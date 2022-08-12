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
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { RequestInterceptor } from 'node-request-interceptor'
import withDefaultInterceptors from 'node-request-interceptor/lib/presets/default'
import { RequestConfig } from '../../interfaces/request'
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
      const flags: { followRedirects: number } = { followRedirects: 0 }
      for (let i = 0; i < 2; i++) {
        const responses: any = []
        for (let j = 0; j < requests.length; j++) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const resp = await probing({
              requestConfig: requests[j],
              responses,
              flags,
            })
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

    it('should submit correct form', async () => {
      interceptor.use((req: any) => {
        if (['http://localhost:4000/login'].includes(req.url.href)) {
          if (req.body === 'username=example%40example.com&password=example')
            return { status: 200 }

          return { status: 400 }
        }
      })

      const request: any = {
        url: 'http://localhost:4000/login',
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: JSON.parse(
          '{"username": "example@example.com", "password": "example"}'
        ),
        timeout: 10,
      }

      const flags: { followRedirects: number } = { followRedirects: 0 }
      const result = await probing({
        requestConfig: request,
        responses: [],
        flags,
      })
      expect(result.status).to.be.equals(200)
    })

    it('should send request with multipart/form-data content-type', async () => {
      // arrange
      const server = setupServer(
        rest.post('https://example.com', (req, res, ctx) => {
          const { headers, body } = req
          const reqBody = body as Record<string, any>

          if (
            !headers.get('content-type')?.startsWith('multipart/form-data') ||
            reqBody?.username !== 'john@example.com' ||
            reqBody?.password !== 'drowssap'
          ) {
            return res(ctx.status(400))
          }

          return res(ctx.status(200))
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' },
        body: { username: 'john@example.com', password: 'drowssap' } as any,
        timeout: 10,
      }

      const flags: { followRedirects: number } = { followRedirects: 0 }
      // act
      server.listen()
      const res = await probing({
        requestConfig: request,
        responses: [],
        flags,
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with text-plain content-type', async () => {
      // arrange
      const server = setupServer(
        rest.post('https://example.com', (req, res, ctx) => {
          const { headers, body } = req

          if (
            headers.get('content-type') !== 'text/plain' ||
            body !== 'multiline string\nexample'
          ) {
            console.error(headers.get('content-type'))
            console.error(body)

            return res(ctx.status(400))
          }

          return res(ctx.status(200))
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'multiline string\nexample' as any,
        timeout: 10,
      }

      // act
      server.listen()
      const flags: { followRedirects: number } = { followRedirects: 0 }
      const res = await probing({
        requestConfig: request,
        responses: [],
        flags,
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with text/yaml content-type', async () => {
      // arrange
      const server = setupServer(
        rest.post('https://example.com', (req, res, ctx) => {
          const { headers, body } = req

          if (
            headers.get('content-type') !== 'text/yaml' ||
            body !== 'username: john@example.com\npassword: secret\n'
          ) {
            console.error(headers.get('content-type'))
            console.error(body)

            return res(ctx.status(400))
          }

          return res(ctx.status(200))
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'text/yaml' },
        body: { username: 'john@example.com', password: 'secret' } as any,
        timeout: 10,
      }

      // act
      server.listen()
      const flags: { followRedirects: number } = { followRedirects: 0 }
      const res = await probing({
        requestConfig: request,
        responses: [],
        flags,
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with application/xml content-type', async () => {
      // arrange
      const server = setupServer(
        rest.post('https://example.com', (req, res, ctx) => {
          const { headers, body } = req
          const reqBody = JSON.parse(body as string)

          if (
            headers.get('content-type') !== 'application/xml' ||
            reqBody?.username !== 'john@example.com'
          ) {
            console.error(headers.get('content-type'))
            console.error(body)

            return res(ctx.status(400))
          }

          return res(ctx.status(200))
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'application/xml' },
        body: { username: 'john@example.com', password: 'secret' } as any,
        timeout: 10,
      }

      // act
      server.listen()
      const flags: { followRedirects: number } = { followRedirects: 0 }
      const res = await probing({
        requestConfig: request,
        responses: [],
        flags,
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
    })
  })
})
