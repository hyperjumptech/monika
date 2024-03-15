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
import { http } from 'msw'
import { setupServer } from 'msw/node'
import type { NotificationMessage } from '../../channel'
import { send, validator } from '../pagerduty'

describe('PagerDuty notification', () => {
  describe('validate configuration', () => {
    it('should validate probe ID', () => {
      // act
      const error = validator.validate([{ key: 'IV2Wu3GRXL3PCaddevIRd' }])

      // assert
      expect(error.error?.message).eq('"Probe ID" is required')
    })

    it('should validate PagerDuty key', () => {
      // act
      const error = validator.validate([{ probeID: '65DDKmmB9mSaeE-8bMXRN' }])

      // assert
      expect(error.error?.message).eq('"Key" is required')
    })

    it('should sucessfully validate the configuration', () => {
      // act
      const error = validator.validate([
        { key: 'IV2Wu3GRXL3PCaddevIRd', probeID: '65DDKmmB9mSaeE-8bMXRN' },
      ])

      // assert
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(error.error).eq(undefined)
    })
  })

  describe('send the event', () => {
    let body = {}
    const server = setupServer(
      http.post(
        'https://events.pagerduty.com/v2/enqueue',
        async ({ request }) => {
          body = await request.json()

          return res(ctx.status(202))
        }
      ),
      http.post(
        'https://events.pagerduty.com/v2/enqueue',
        async ({ request }) => {
          body = await request.json()

          return res(ctx.status(202))
        }
      )
    )

    before(() => {
      server.listen()
    })

    afterEach(() => {
      body = {}
      server.resetHandlers()
    })

    after(() => {
      server.close()
    })

    it('should ignore non incident/recovery event', async () => {
      // arrange
      const message: NotificationMessage = {
        subject: '',
        body: '',
        summary: '',
        meta: {
          type: 'start',
          time: '',
          hostname: '',
          privateIpAddress: '',
          publicIpAddress: '',
          version: '',
        },
      }

      // act
      await send(
        [{ key: 'IV2Wu3GRXL3PCaddevIRd', probeID: '65DDKmmB9mSaeE-8bMXRN' }],
        message
      )

      // assert
      expect(true).eq(true)
    })

    it('should send incident event', async () => {
      // arrange
      const routingKey = 'IV2Wu3GRXL3PCaddevIRd'
      const message: NotificationMessage = {
        subject: '',
        body: '',
        summary: 'HTTP Status > 200',
        meta: {
          type: 'incident',
          probeID: '65DDKmmB9mSaeE-8bMXRN',
          url: 'http://example.com/login',
          alertQuery: 'response.status > 200',
          time: '',
          hostname: '',
          privateIpAddress: '',
          publicIpAddress: '192.168.1.1',
          version: '',
        },
      }
      const { summary, meta } = message
      const { probeID, url, alertQuery, publicIpAddress } = meta
      const dedupKey = `${probeID}:${url}:${alertQuery}`.replace(' ', '')

      // act
      await send(
        [{ key: routingKey, probeID: '65DDKmmB9mSaeE-8bMXRN' }],
        message
      )

      // assert
      expect(body).to.deep.eq({
        /* eslint-disable camelcase */
        routing_key: routingKey,
        dedup_key: dedupKey,
        event_action: 'trigger',
        /* eslint-enable camelcase */
        payload: {
          summary,
          source: publicIpAddress,
          severity: 'error',
          group: probeID,
        },
      })
    })

    it('should send recovery event', async () => {
      // arrange
      const routingKey = 'IV2Wu3GRXL3PCaddevIRd'
      const message: NotificationMessage = {
        subject: '',
        body: '',
        summary: 'HTTP Status > 200',
        meta: {
          type: 'recovery',
          probeID: '65DDKmmB9mSaeE-8bMXRN',
          url: 'http://example.com/login',
          alertQuery: 'response.status > 200',
          time: '',
          hostname: '',
          privateIpAddress: '',
          publicIpAddress: '192.168.1.1',
          version: '',
        },
      }
      const { meta } = message
      const { probeID, url, alertQuery } = meta
      const dedupKey = `${probeID}:${url}:${alertQuery}`.replace(' ', '')

      // act
      await send(
        [{ key: routingKey, probeID: '65DDKmmB9mSaeE-8bMXRN' }],
        message
      )

      // assert
      expect(body).to.deep.eq({
        /* eslint-disable camelcase */
        routing_key: routingKey,
        dedup_key: dedupKey,
        event_action: 'resolve',
        /* eslint-enable camelcase */
      })
    })
  })
})
