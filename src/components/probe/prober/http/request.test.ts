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
// import { HttpResponse, http } from 'msw'
import { setContext } from '../../../../context'
import type { MonikaFlags } from '../../../../context/monika-flags'
import type {
  ProbeRequestResponse,
  RequestConfig,
} from '../../../../interfaces/request'
import { generateRequestChainingBody, httpRequest } from './request'
import { XMLParser } from 'fast-xml-parser'
import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer'

describe('probingHTTP', () => {
  describe('httpRequest function', () => {
    it('should render correct headers', async () => {
      let verifyHeader: any = {}
      let tokens = ['1', '2']
      let sentToken = ''
      const appExpress = express()
      appExpress.get('/get_key', (_, res) => {
        const token = tokens[tokens.length - 1]
        tokens = tokens.slice(0, -1)
        sentToken = token
        res.status(200).json({ token })
      })

      appExpress.post('/verify', (req, res) => {
        verifyHeader = req.headers.authorization
        res.status(200).json({ verified: 'true' })
      })

      const server = appExpress.listen(4000, 'localhost')

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

      const results: any[] = []
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
                sentToken: verifyHeader,
                expectedToken: sentToken,
              })
            }
          } catch {}
        }
      }

      server.close()

      expect(results.length).to.above(0)
      for (const result of results) {
        expect(result.sentToken).to.be.equals(result.expectedToken)
      }
    })

    it('should submit correct form', async () => {
      const appExpress = express()
      appExpress.use(bodyParser.urlencoded({ extended: true }))
      appExpress.post('/login', (req, res) => {
        if (
          req
            .header('content-type')
            ?.includes('application/x-www-form-urlencoded') &&
          req.body.username === 'example@example.com' &&
          req.body.password === 'example'
        ) {
          res.status(200).send()
        } else {
          res.status(400).send()
        }
      })
      const server = appExpress.listen(4000, 'localhost')

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
      server.close()
      expect(result.status).to.be.equals(200)
    })

    it('should send request with multipart/form-data content-type', async () => {
      // arrange
      const appExpress = express()
      const m = multer()
      appExpress.post('/', m.none(), (req, res) => {
        if (
          req.header('content-type')?.includes('multipart/form-data') &&
          req.body?.username === 'john@example.com' &&
          req.body?.password === 'drowssap'
        ) {
          res.status(200).send()
        } else {
          res.status(400).send()
        }
      })
      const server = appExpress.listen(4000, 'localhost')

      const request: RequestConfig = {
        url: 'http://localhost:4000',
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data' },
        body: { username: 'john@example.com', password: 'drowssap' } as any,
        timeout: 10_000,
      }

      const flags = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags })
      // act
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
      const appExpress = express()
      appExpress.use(bodyParser.text())
      appExpress.post('/', (req, res) => {
        if (
          req.header('content-type')?.includes('text/plain') &&
          req.body === 'multiline string\nexample'
        ) {
          res.status(200).send()
        } else {
          res.status(400).send()
        }
      })
      const server = appExpress.listen(4000, 'localhost')
      const request: RequestConfig = {
        url: 'http://localhost:4000',
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'multiline string\nexample' as any,
        timeout: 10_000,
      }

      // act
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
      const appExpress = express()
      appExpress.use(bodyParser.text({ type: 'text/yaml' }))
      appExpress.post('/', (req, res) => {
        if (
          req.header('content-type')?.includes('text/yaml') &&
          req.body === 'username: john@example.com\npassword: secret\n'
        ) {
          res.status(200).send()
        } else {
          res.status(400).send()
        }
      })
      const request: RequestConfig = {
        url: 'http://localhost:4000',
        method: 'POST',
        headers: { 'content-type': 'text/yaml' },
        body: { username: 'john@example.com', password: 'secret' } as any,
        timeout: 10_000,
      }
      const server = appExpress.listen(4000, 'localhost')

      // act
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
      const appExpress = express()
      appExpress.use(bodyParser.text({ type: 'application/xml' }))
      appExpress.post('/', (req, res) => {
        const parsedReqBody = new XMLParser().parse(req.body)
        console.log('express given', req.body)
        if (
          req.header('content-type')?.includes('application/xml') &&
          parsedReqBody?.username === 'john@example.com' &&
          parsedReqBody?.password === 'secret'
        ) {
          res.status(200).send()
        } else {
          res.status(400).send()
        }
      })
      const request: RequestConfig = {
        url: 'http://localhost:4000',
        method: 'POST',
        headers: { 'content-type': 'application/xml' },
        body: { username: 'john@example.com', password: 'secret' } as any,
        timeout: 10_000,
      }
      const server = appExpress.listen(4000, 'localhost')

      // act
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })
      server.close()

      // assert
      expect(res.status).to.eq(200)
      expect(server.listening).to.eq(false)
    })

    it('should send request with text-plain content-type even with allowUnauthorized option', async () => {
      // arrange
      const request: RequestConfig = {
        url: 'https://example.com',
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'multiline string\nexample' as any,
        timeout: 10_000,
        allowUnauthorized: true,
      }

      // act
      const flag = { followRedirects: 0 } as unknown as MonikaFlags
      setContext({ flags: flag })
      const res = await httpRequest({
        requestConfig: request,
        responses: [],
      })

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
