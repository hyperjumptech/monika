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

import chai, { expect } from 'chai'
import spies from 'chai-spies'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { validateNotification } from '../../validator/notification'
import { send } from '../webhook'
import type { NotificationMessage } from '..'

chai.use(spies)

describe('notificationChecker - webhookNotification', () => {
  afterEach(() => {
    chai.spy.restore()
  })

  const notificationConfig = {
    id: 'webhook',
    type: 'webhook' as const,
  }

  it('should handle validation error - without URL', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: { url: '' },
        },
      ])
    } catch (error) {
      const message = '"Webhook URL" is not allowed to be empty'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })

  it('should handle validation error - invalid URL', async () => {
    try {
      await validateNotification([
        {
          ...notificationConfig,
          data: {
            url: 'example',
          },
        },
      ])
    } catch (error) {
      const message = '"Webhook URL" must be a valid uri'

      expect(() => {
        throw error
      }).to.throw(message)
    }
  })
})

describe('Webhook Notification', () => {
  describe('Send', () => {
    let body: Record<string, any> = {}
    const server = setupServer(
      rest.post('https://example.com', (req, res, ctx) => {
        body = req.body as Record<string, any>

        return res(ctx.status(200))
      })
    )

    beforeEach(() => server.listen({ onUnhandledRequest: 'bypass' }))
    afterEach(() => {
      body = {}
      server.close()
    })

    it('should send incident notification', async () => {
      // act
      await send({ url: 'https://example.com' }, {
        meta: {
          alertQuery: 'response.status != 200',
          probeID: 'ua53D',
          url: 'https://example.com',
          time: '2022-09-27 18:00:00.000',
          type: 'incident',
        },
      } as unknown as NotificationMessage)

      // assert
      expect(body).deep.eq({
        body: {
          alert: 'response.status != 200',
          url: 'https://example.com',
          time: '2022-09-27 18:00:00.000',
        },
      })
    })

    it('should send incident notification and use probeID as an identifier', async () => {
      // act
      await send({ url: 'https://example.com' }, {
        meta: {
          alertQuery: 'response.status != 200',
          probeID: 'ua53D',
          time: '2022-09-27 18:00:00.000',
          type: 'incident',
        },
      } as unknown as NotificationMessage)

      // assert
      expect(body).deep.eq({
        body: {
          alert: 'response.status != 200',
          url: 'ua53D',
          time: '2022-09-27 18:00:00.000',
        },
      })
    })

    it('should not send recovery notification', async () => {
      // act
      await send({ url: 'https://example.com' }, {
        meta: {
          alertQuery: 'response.status != 200',
          probeID: 'ua53D',
          time: '2022-09-27 18:00:00.000',
          type: 'start',
        },
      } as unknown as NotificationMessage)

      // assert
      expect(body).deep.eq({})
    })
  })
})
