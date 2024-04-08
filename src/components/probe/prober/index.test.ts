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

import { type DefaultBodyType, HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from '@oclif/test'

import type { ProberMetadata } from '.'

import { createProber } from './factory'
import { getIncidents } from '../../incident'

describe('Prober', () => {
  describe('Initial incident state', () => {
    let probeRequestTotal = 0
    let webhookBody: DefaultBodyType = null
    const server = setupServer(
      http.get('https://example.com', () => {
        probeRequestTotal++
        return new HttpResponse(null, {
          status: 200,
        })
      }),
      http.post('https://example.com/webhook', async ({ request }) => {
        webhookBody = await request.json()
        return new HttpResponse(null, {
          status: 202,
        })
      })
    )

    before(() => {
      server.listen()
    })
    afterEach(() => {
      server.resetHandlers()
      probeRequestTotal = 0
      webhookBody = null
    })
    after(() => {
      server.close()
    })

    it('should not initialize probe state if last event is not specify', async () => {
      // arrange
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).eq(null)
      expect(getIncidents().length).eq(0)
    })

    it('should not initialize probe state if last event id is not specify', async () => {
      // arrange
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            createdAt: new Date(),
            recoveredAt: null,
          },
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).eq(null)
      expect(getIncidents().length).eq(0)
    })

    it('should not initialize probe state if last event recovered at is not null', async () => {
      // arrange
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            alertId: 'iCzgj',
            createdAt: new Date(),
            recoveredAt: new Date(),
          },
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).eq(null)
      expect(getIncidents().length).eq(0)
    })

    it('should not initialize probe state if alert is not found', async () => {
      // arrange
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            alertId: 'iCzgj',
            createdAt: new Date(),
            recoveredAt: null,
          },
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).eq(null)
      expect(getIncidents().length).eq(0)
    })

    it('should send recovery notification if recovered_at is null and target is healthy', async () => {
      // arrange
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            alertId: 'iCzgj',
            createdAt: new Date(),
            recoveredAt: null,
          },
          recoveryThreshold: 1,
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
              alerts: [
                {
                  id: 'iCzgj',
                  assertion: 'response.status != 200',
                  message: 'Server is down!',
                },
              ],
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })
      await sleep(200)

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).not.eq(null)
      expect(getIncidents().length).eq(0)
    })

    it('should not send incident notification if recovered_at is null and target is not healthy', async () => {
      // arrange
      server.use(
        http.get('https://example.com', () => {
          probeRequestTotal++
          return new HttpResponse(null, {
            status: 404,
          })
        })
      )
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            alertId: 'iCzgj',
            createdAt: new Date(),
            recoveredAt: null,
          },
          incidentThreshold: 1,
          recoveryThreshold: 1,
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
              alerts: [
                {
                  id: 'iCzgj',
                  assertion: 'response.status != 200',
                  message: 'Server is down!',
                },
              ],
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).eq(null)
      expect(getIncidents().length).eq(1)
    })

    it('should not send recovery notification if recovered_at is not null and target is healthy', async () => {
      // arrange
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            alertId: 'iCzgj',
            createdAt: new Date(),
            recoveredAt: new Date(),
          },
          recoveryThreshold: 1,
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
              alerts: [
                {
                  id: 'iCzgj',
                  assertion: 'response.status != 200',
                  message: 'Server is down!',
                },
              ],
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).eq(null)
      expect(getIncidents().length).eq(0)
    })

    it('should send incident notification if recovered_at is not null and target is not healthy', async () => {
      // arrange
      server.use(
        http.get('https://example.com', () => {
          probeRequestTotal++
          return new HttpResponse(null, {
            status: 404,
          })
        })
      )
      const proberMetadata: ProberMetadata = {
        counter: 0,
        notifications: [
          {
            id: 'NMEdP',
            type: 'webhook',
            data: { url: 'https://example.com/webhook' },
          },
        ],
        probeConfig: {
          alerts: [],
          id: 'bcDnX',
          interval: 2,
          name: 'Example',
          lastEvent: {
            alertId: 'iCzgj',
            createdAt: new Date(),
            recoveredAt: new Date(),
          },
          incidentThreshold: 1,
          recoveryThreshold: 1,
          requests: [
            {
              body: '',
              followRedirects: 21,
              timeout: 30_000,
              url: 'https://example.com',
              alerts: [
                {
                  id: 'iCzgj',
                  assertion: 'response.status != 200',
                  message: 'Server is down!',
                },
              ],
            },
          ],
        },
      }

      // act
      const prober = createProber(proberMetadata)
      await prober.probe({
        incidentRetryAttempt: 0,
        signal: new AbortController().signal,
      })
      await sleep(200)

      // assert
      expect(probeRequestTotal).eq(1)
      expect(webhookBody).not.eq(null)
      expect(getIncidents().length).eq(1)
    })
  })
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
