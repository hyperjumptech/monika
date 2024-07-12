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

import { expect } from '@oclif/test'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import { getContext, resetContext, setContext } from '../../../../context'
import type {
  ProbeRequestResponse,
  RequestConfig,
} from '../../../../interfaces/request'
import { generateRequestChainingBody, httpRequest } from './request'

const server = setupServer()

describe('probingHTTP', () => {
  describe('httpRequest function', () => {
    before(() => {
      server.listen()
      setContext({
        ...getContext(),
        flags: { ...getContext().flags, 'follow-redirects': 0 },
      })
    })
    afterEach(() => {
      server.resetHandlers()
      resetContext()
    })
    after(() => {
      server.close()
    })
    it('should render correct headers', async () => {
      // arrange
      const tokens = ['1', '2']
      let verifyHeader = new Headers()
      let sentToken = ''

      server.use(
        http.get('http://localhost:4000/get_key', async () => {
          const token = tokens.pop() as string
          sentToken = token

          return HttpResponse.json({ token })
        }),
        http.post('http://localhost:4000/verify', async ({ request }) => {
          verifyHeader = request.headers

          return HttpResponse.json({ verified: true })
        })
      )

      // create the requests
      const requests: RequestConfig[] = [
        {
          url: 'http://localhost:4000/get_key',
          body: '',
          followRedirects: 21,
          timeout: 10_000,
        },
        {
          url: 'http://localhost:4000/verify',
          method: 'POST',
          headers: {
            Authorization: '{{ responses.[0].data.token }}',
          },
          body: '',
          followRedirects: 21,
          timeout: 10_000,
        },
      ]

      // act
      const results = []
      for (let i = 0; i < 2; i++) {
        const responses = []
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
                sentToken: verifyHeader.get('authorization'),
                expectedToken: sentToken,
              })
            }
          } catch {}
        }
      }

      // assert
      for (const result of results) {
        expect(result.sentToken).to.be.equals(result.expectedToken)
      }
    })

    it('should submit correct form', async () => {
      server.use(
        http.post('http://localhost:4000/login', async ({ request }) => {
          const reqBody = await request.text()

          if (reqBody !== 'username=example%40example.com&password=example') {
            return new HttpResponse(null, {
              status: 400,
            })
          }

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request = {
        url: 'http://localhost:4000/login',
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: JSON.parse(
          '{"username": "example@example.com", "password": "example"}'
        ),
        followRedirects: 21,
        timeout: 10_000,
      }

      const result = await httpRequest({
        requestConfig: request,
        responses: [],
      })
      expect(result.status).to.be.equals(200)
    })

    it('should send request with multipart/form-data content-type', async () => {
      // arrange
      server.use(
        http.post('https://example.com', async ({ request }) => {
          const { headers } = request
          const reqBody = await request.text()

          if (
            !headers.get('content-type')?.startsWith('multipart/form-data') ||
            !reqBody.includes('john@example.com') ||
            !reqBody.includes('drowssap')
          ) {
            return new HttpResponse(null, {
              status: 400,
            })
          }

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' },
        body: { username: 'john@example.com', password: 'drowssap' } as never,
        followRedirects: 21,
        timeout: 10_000,
      }

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with text-plain content-type', async () => {
      // arrange
      server.use(
        http.post('https://example.com', async ({ request }) => {
          const { headers } = request
          const body = await request.text()

          if (
            headers.get('content-type') !== 'text/plain' ||
            body !== 'multiline string\nexample'
          ) {
            return new HttpResponse(null, {
              status: 400,
            })
          }

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'multiline string\nexample',
        followRedirects: 21,
        timeout: 10_000,
      }

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with text/yaml content-type', async () => {
      // arrange
      server.use(
        http.post('https://example.com', async ({ request }) => {
          const { headers } = request
          const body = await request.text()

          if (
            headers.get('content-type') !== 'text/yaml' ||
            body !== 'username: john@example.com\npassword: secret\n'
          ) {
            return new HttpResponse(null, {
              status: 400,
            })
          }

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'text/yaml' },
        body: { username: 'john@example.com', password: 'secret' } as never,
        followRedirects: 21,
        timeout: 10_000,
      }

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
    })

    it('should send request with application/xml content-type', async () => {
      // arrange
      server.use(
        http.post('https://example.com', async ({ request }) => {
          const { headers } = request
          const body = await request.text()

          if (
            headers.get('content-type') !== 'application/xml' ||
            !body.includes('john@example.com')
          ) {
            return new HttpResponse(null, {
              status: 400,
            })
          }

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'application/xml' },
        body: { username: 'john@example.com', password: 'secret' } as never,
        followRedirects: 21,
        timeout: 10_000,
      }

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
    })

    it('Should handle HTTP redirect with axios', async () => {
      // arrange
      setContext({
        ...getContext(),
        flags: {
          ...getContext().flags,
          'follow-redirects': 3,
        },
      })
      server.use(
        http.get(
          'https://example.com/get',
          () => new HttpResponse(null, { status: 200 })
        ),
        http.get(
          'https://example.com/redirect/:nredirect',
          async ({ params }) => {
            const { nredirect } = params
            const castRedirect = Number(nredirect)
            return new HttpResponse(null, {
              status: 302,
              headers: [
                [
                  'Location',
                  castRedirect === 1
                    ? 'https://example.com/get'
                    : `https://example.com/redirect/${castRedirect - 1}`,
                ],
              ],
            })
          }
        )
      )

      const requestConfig: RequestConfig = {
        url: 'https://example.com/redirect/3',
        method: 'GET',
        body: '',
        timeout: 10_000,
        followRedirects: 3,
      }

      const res = await httpRequest({
        requestConfig,
        responses: [],
      })

      expect(res.status).to.eq(200)
    })
    it('Should handle HTTP redirect with fetch', async () => {
      // arrange
      server.use(
        http.get(
          'https://example.com/get',
          () => new HttpResponse(null, { status: 200 })
        ),
        http.get(
          'https://example.com/redirect/:nredirect',
          async ({ params }) => {
            const { nredirect } = params
            const castRedirect = Number(nredirect)
            return new HttpResponse(null, {
              status: 302,
              headers: [
                [
                  'Location',
                  castRedirect === 1
                    ? 'https://example.com/get'
                    : `https://example.com/redirect/${castRedirect - 1}`,
                ],
              ],
            })
          }
        )
      )

      const requestConfig: RequestConfig = {
        url: 'https://example.com/redirect/3',
        method: 'GET',
        body: '',
        timeout: 10_000,
        followRedirects: 3,
      }

      const res = await httpRequest({
        requestConfig,
        responses: [],
      })

      expect(res.status).to.eq(200)
    })

    it('should send request with text-plain content-type even with allowUnauthorized option', async () => {
      // arrange
      server.use(
        http.post('https://example.com', async ({ request }) => {
          const { headers } = request
          const body = await request.text()

          if (
            headers.get('content-type') !== 'text/plain' ||
            body !== 'multiline string\nexample'
          ) {
            return new HttpResponse(null, {
              status: 400,
            })
          }

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'multiline string\nexample',
        followRedirects: 21,
        timeout: 10_000,
        allowUnauthorized: true,
      }

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
    })

    it('should follow redirect', async () => {
      // arrange
      server.use(
        http.get(
          'https://example.com/redirect-1',
          async () =>
            new HttpResponse(null, {
              status: 302,
              headers: {
                Location: '/redirect-2',
              },
            })
        ),
        http.get(
          'https://example.com/redirect-2',
          async () =>
            new HttpResponse(null, {
              status: 302,
              headers: {
                Location: '/',
              },
            })
        ),
        http.get(
          'https://example.com',
          async () =>
            new HttpResponse(null, {
              status: 200,
            })
        )
      )
      const request = {
        url: 'https://example.com/redirect-1',
        followRedirects: 3,
      } as RequestConfig

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
    })

    it('should not follow redirect', async () => {
      // arrange
      server.use(
        http.get(
          'https://example.com/redirect-1',
          async () =>
            new HttpResponse(null, {
              status: 302,
              headers: {
                Location: '/redirect-2',
              },
            })
        ),
        http.get(
          'https://example.com/redirect-2',
          async () =>
            new HttpResponse(null, {
              status: 301,
              headers: {
                Location: '/',
              },
            })
        ),
        http.get(
          'https://example.com',
          async () =>
            new HttpResponse(null, {
              status: 200,
            })
        )
      )
      const request = {
        url: 'https://example.com/redirect-1',
        followRedirects: 0,
      } as RequestConfig

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(302)
    })

    it('should send no body', async () => {
      // arrange
      let body
      server.use(
        http.get('https://example.com', async ({ request }) => {
          body = request.body

          return new HttpResponse(null, {
            status: 200,
          })
        })
      )
      const request = {
        url: 'https://example.com',
        body: null,
      } as RequestConfig

      // act
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

      // assert
      expect(res.status).to.eq(200)
      expect(body).to.eq(null)
    })
  })

  describe('Unit test', () => {
    describe('generateRequestChainingBody', () => {
      it('should generate request chaining body', () => {
        // arrange
        type TestTable = {
          body: Record<string, unknown> | string
          responses: ProbeRequestResponse[]
          expected: Record<string, unknown> | string
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
