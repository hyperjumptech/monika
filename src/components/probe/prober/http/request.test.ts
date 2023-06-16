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
import { setContext } from '../../../../context'
import type { MonikaFlags } from '../../../../context/monika-flags'
import type {
  ProbeRequestResponse,
  RequestConfig,
} from '../../../../interfaces/request'

import { generateRequestChainingBody, httpRequest } from './request'

describe('probingHTTP', () => {
  let interceptor: any
  beforeEach(() => {
    interceptor = new RequestInterceptor(withDefaultInterceptors)
  })
  afterEach(() => {
    interceptor.restore()
  })
  describe('httpRequest function', () => {
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
          timeout: 10_000,
        },
        {
          url: 'http://localhost:4000/verify',
          method: 'POST',
          headers: {
            Authorization: '{{ responses.[0].data.token }}',
          },
          body: JSON.parse('{}'),
          timeout: 10_000,
        },
      ]

      const results: any = []
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      for (let i = 0; i < 2; i++) {
        const responses: any = []
        for (const [j, request] of requests.entries()) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const resp = await httpRequest({
              requestConfig: request,
              responses,
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

      for (const result of results) {
        expect(result.sentToken).to.be.equals(result.expectedToken)
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
        timeout: 10_000,
      }

      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const result = await httpRequest({
        requestConfig: request,
        responses: [],
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
        timeout: 10_000,
      }

      const flags = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags })
      // act
      server.listen()
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
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
        timeout: 10_000,
      }

      // act
      server.listen()
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
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
        timeout: 10_000,
      }

      // act
      server.listen()
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
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
        timeout: 10_000,
      }

      // act
      server.listen()
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with text-plain content-type even with allowUnauthorized option', async () => {
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
        timeout: 10_000,
        allowUnauthorized: true,
      }

      // act
      server.listen()
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
    })
  })

  describe('Unit test', () => {
    describe('generateRequestChainingBody', () => {
      it('should generate request chaining body', () => {
        // arrange
        type TestTable = {
          body: Record<string, any> | string
          responses: ProbeRequestResponse[]
          expected: Record<string, any> | string
        }
        const testTables: TestTable[] = [
          {
            body: {
              message: 'Your email is name@example.com',
            },
            responses: [
              {
                body: { email: 'email@example.com' },
              },
            ] as unknown as ProbeRequestResponse[],
            expected: {
              message: 'Your email is name@example.com',
            },
          },
          {
            body: {
              message: 'Your email is {{ responses.[0].body.email }}',
            },
            responses: [
              {
                body: { email: 'name@example.com' },
              },
            ] as unknown as ProbeRequestResponse[],
            expected: {
              message: 'Your email is name@example.com',
            },
          },
          {
            body: {
              auth: 'Authorization: Bearer {{ responses.[1].body.token }}',
            },
            responses: [
              {},
              { body: { token: 'random-token' } },
            ] as ProbeRequestResponse[],
            expected: {
              auth: 'Authorization: Bearer random-token',
            },
          },
          {
            body: {
              password: '{{ responses.[0].body.otp }}',
              otp: 789_012,
              siblings: [
                '{{ responses.[0].body.password }}',
                '{{ responses.[0].body.name.last }}',
              ],
              name: {
                first: '{{ responses.[0].body.siblings.[0] }}',
                last: '{{ responses.[0].body.siblings.[1]  }}',
              },
            },
            responses: [
              {
                body: {
                  password: 'notsogoodpassword',
                  otp: 123_456,
                  name: {
                    first: 'John',
                    last: 'Doe',
                  },
                  siblings: ['Jane', 'Jade'],
                },
              },
            ] as ProbeRequestResponse[],
            expected: {
              password: '123456',
              otp: 789_012,
              siblings: ['notsogoodpassword', 'Doe'],
              name: {
                first: 'Jane',
                last: 'Jade',
              },
            },
          },
          {
            body: 'Your email is name@example.com',
            responses: [
              {
                body: { email: 'email@example.com' },
              },
            ] as unknown as ProbeRequestResponse[],
            expected: 'Your email is name@example.com',
          },
          {
            body: 'Your email is {{ responses.[0].body.email }}',
            responses: [
              {
                body: { email: 'name@example.com' },
              },
            ] as unknown as ProbeRequestResponse[],
            expected: 'Your email is name@example.com',
          },
        ]

        for (const test of testTables) {
          // act
          const requestBody = generateRequestChainingBody(
            test.body as JSON | string,
            test.responses
          )

          // assert
          expect(requestBody).deep.eq(test.expected)
        }
      })
    })
  })
})
