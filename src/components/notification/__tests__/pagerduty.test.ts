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
import { NotificationMessage } from '../../../interfaces/notification'
import { newPagerDuty } from '../channel/pagerduty'

describe('PagerDuty notification', () => {
  describe('check the slug', () => {
    it('should return the slug', () => {
      // arrange
      const pagerduty = newPagerDuty()

      // assert
      expect(pagerduty.slug).eq('pagerduty')
    })
  })

  describe('validate configuration', () => {
    it('should validate probe ID', () => {
      // arrange
      const pagerduty = newPagerDuty()

      // act
      const error = pagerduty.validateConfig([
        { key: 'IV2Wu3GRXL3PCaddevIRd' },
      ] as any)

      // assert
      expect(error).eq('PagerDuty notification: "Probe ID" is required')
    })

    it('should validate PagerDuty key', () => {
      // arrange
      const pagerduty = newPagerDuty()

      // act
      const error = pagerduty.validateConfig([
        { probeID: '65DDKmmB9mSaeE-8bMXRN' },
      ] as any)

      // assert
      expect(error).eq('PagerDuty notification: "Key" is required')
    })

    it('should sucessfully validate the configuration', () => {
      // arrange
      const pagerduty = newPagerDuty()

      // act
      const error = pagerduty.validateConfig([
        { key: 'IV2Wu3GRXL3PCaddevIRd', probeID: '65DDKmmB9mSaeE-8bMXRN' },
      ])

      // assert
      expect(error).eq('')
    })
  })

  describe('send the event', () => {
    it('should ignore non incident/recovery event', async () => {
      // arrange
      const pagerduty = newPagerDuty()
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
      await pagerduty.send(
        [{ key: 'IV2Wu3GRXL3PCaddevIRd', probeID: '65DDKmmB9mSaeE-8bMXRN' }],
        message
      )

      // assert
      expect(true).eq(true)
    })

    it('should send incident event', async () => {
      // arrange
      const pagerduty = newPagerDuty()
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
      let body: Record<string, any> = {}
      const server = setupServer(
        rest.post(
          'https://events.pagerduty.com/v2/enqueue',
          (req, res, ctx) => {
            body = req?.body as Record<string, any>
            return res(ctx.status(202))
          }
        )
      )

      // act
      server.listen()
      await pagerduty.send(
        [{ key: routingKey, probeID: '65DDKmmB9mSaeE-8bMXRN' }],
        message
      )
      server.close()

      // assert
      expect(body).to.deep.eq({
        routing_key: routingKey,
        dedup_key: dedupKey,
        event_action: 'trigger',
        payload: {
          summary: summary,
          source: publicIpAddress,
          severity: 'error',
          group: probeID,
        },
      })
    })

    it('should send recovery event', async () => {
      // arrange
      const pagerduty = newPagerDuty()
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
      let body: Record<string, any> = {}
      const server = setupServer(
        rest.post(
          'https://events.pagerduty.com/v2/enqueue',
          (req, res, ctx) => {
            body = req?.body as Record<string, any>
            return res(ctx.status(202))
          }
        )
      )

      // act
      server.listen()
      await pagerduty.send(
        [{ key: routingKey, probeID: '65DDKmmB9mSaeE-8bMXRN' }],
        message
      )
      server.close()

      // assert
      expect(body).to.deep.eq({
        routing_key: routingKey,
        dedup_key: dedupKey,
        event_action: 'resolve',
      })
    })
  })
})
