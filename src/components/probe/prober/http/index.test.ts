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
import { AxiosError } from 'axios'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import sinon from 'sinon'
import * as httpRequest from '../../../../utils/http'
import { doProbe } from '../..'
import { initializeProbeStates } from '../../../../utils/probe-state'
import type { Probe } from '../../../../interfaces/probe'
import { getContext, resetContext, setContext } from '../../../../context'
import type { MonikaFlags } from '../../../../flag'
import { FAILED_REQUEST_ASSERTION } from '../../../../looper'
import { closeLog, openLogfile } from '../../../logger/history'

let urlRequestTotal = 0
let notificationAlert: Record<
  string,
  Record<string, Record<string, never>>
> = {}
const server = setupServer(
  rest.get('https://example.com', (_, res, ctx) => {
    urlRequestTotal += 1
    return res(ctx.status(200))
  }),
  rest.post('https://example.com/webhook', async (req, res, ctx) => {
    const requestBody = await req.json()
    if (requestBody?.body?.url) {
      notificationAlert[requestBody.body.url] = requestBody
    }

    return res(ctx.status(200))
  })
)
const probes: Probe[] = [
  {
    id: '1',
    name: 'Example',
    interval: 1,
    requests: [
      {
        url: 'https://example.com',
        body: '',
        timeout: 30,
      },
    ],
    alerts: [],
  },
]

describe('HTTP Probe processing', () => {
  before(async () => {
    server.listen()
    await openLogfile()
  })
  beforeEach(() => {
    setContext({ flags: { repeat: 1 } as MonikaFlags })
  })
  afterEach(() => {
    resetContext()
    urlRequestTotal = 0
    notificationAlert = {}
    server.resetHandlers()
    sinon.restore()
  })
  after(async () => {
    server.close()
    await closeLog()
  })

  it('should not run probe if the probe is running', async () => {
    // arrange
    initializeProbeStates(probes)
    // wait until the interval passed
    const seconds = 1000
    await sleep(seconds)

    // act
    doProbe({
      probe: probes[0],
      notifications: [],
      signal: new AbortController().signal,
    })
    await doProbe({
      probe: probes[0],
      notifications: [],
      signal: new AbortController().signal,
    })
    // wait for random timeout
    await sleep(3 * seconds)

    // assert
    expect(urlRequestTotal).eq(1)
  })

  it('should not run probe if it is not the time', () => {
    // arrange
    initializeProbeStates(probes)

    // act
    doProbe({
      notifications: [],
      probe: { ...probes[0], interval: 10 },
      signal: new AbortController().signal,
    })

    // assert
    expect(urlRequestTotal).eq(0)
  })

  it('should not run probe if the cycle is end', async () => {
    // arrange
    initializeProbeStates(probes)
    setContext({
      ...getContext(),
      flags: { ...getContext().flags, repeat: 1 },
    })
    // wait until the interval passed
    const seconds = 1000
    await sleep(seconds)

    // act
    await doProbe({
      probe: probes[0],
      notifications: [],
      signal: new AbortController().signal,
    })
    await doProbe({
      probe: probes[0],
      notifications: [],
      signal: new AbortController().signal,
    })
    await doProbe({
      probe: probes[0],
      notifications: [],
      signal: new AbortController().signal,
    })
    // wait for random timeout
    await sleep(3 * seconds)

    // assert
    expect(urlRequestTotal).eq(1)
  })

  it('should run the probe', async () => {
    // arrange
    const uniqueProbes: Probe[] = Array.from({ length: 5 }).map((_, index) => ({
      ...probes[0],
      id: `${index}`,
    }))
    initializeProbeStates(uniqueProbes)
    // wait until the interval passed
    const seconds = 1000
    await sleep(seconds)

    // act
    await Promise.all(
      uniqueProbes.map((probe) =>
        doProbe({
          probe,
          notifications: [],
          signal: new AbortController().signal,
        })
      )
    )
    // wait for random timeout
    await sleep(3 * seconds)

    // assert
    expect(urlRequestTotal).eq(5)
  })

  it('should send incident notification if the request is failed', async () => {
    // arrange
    sinon.stub(httpRequest, 'sendHttpRequest').callsFake(async () => {
      throw new AxiosError('ECONNABORTED', undefined, undefined, {})
    })
    const probe = {
      ...probes[0],
      id: '2md9a',
      requests: [
        {
          url: 'https://example.com',
          body: '',
          timeout: 30,
        },
      ],
      alerts: [
        {
          id: 'Cqkjh',
          ...FAILED_REQUEST_ASSERTION,
        },
        {
          id: 'fKBzx',
          assertion: 'response.status == 200',
          message: 'The assertion failed.',
        },
      ],
    }
    initializeProbeStates([probe])
    // wait until the interval passed
    const seconds = 1000
    await sleep(seconds)

    // act
    await doProbe({
      probe,
      notifications: [
        {
          id: 'jFQBd',
          data: { url: 'https://example.com/webhook' },
          type: 'webhook',
        },
      ],
      signal: new AbortController().signal,
    })
    // wait for random timeout
    await sleep(3 * seconds)
    // wait for send notification function to resolve
    await sleep(2 * seconds)

    // assert
    expect(notificationAlert?.[probe.requests[0].url]?.body?.url).eq(
      'https://example.com'
    )
    expect(notificationAlert?.[probe.requests[0].url]?.body.alert).eq('')
  }).timeout(10_000)

  it('should send incident notification when assertion fails', async () => {
    // arrange
    server.use(
      rest.get('https://example.com', (_, res, ctx) => {
        urlRequestTotal += 1
        return res(ctx.status(404))
      })
    )
    const probe = {
      ...probes[0],
      id: '2md9o',
      alerts: [
        {
          id: 'P7-fN',
          assertion: 'response.status != 200',
          message: 'The assertion failed.',
        },
      ],
    }
    initializeProbeStates([probe])
    // wait until the interval passed
    const seconds = 1000
    await sleep(seconds)

    // act
    await doProbe({
      probe,
      notifications: [
        {
          id: 'jFQBd',
          data: { url: 'https://example.com/webhook' },
          type: 'webhook',
        },
      ],
      signal: new AbortController().signal,
    })
    // wait for random timeout
    await sleep(3 * seconds)
    // wait for send notification function to resolve
    await sleep(2 * seconds)

    // assert
    expect(notificationAlert?.[probe?.requests?.[0]?.url || 0]?.body?.url).eq(
      'https://example.com'
    )
    expect(notificationAlert?.[probe?.requests?.[0]?.url || 0]?.body?.alert).eq(
      'response.status != 200'
    )

    // restore
    server.resetHandlers()
  }).timeout(10_000)

  it('should send recovery notification', async () => {
    // arrange
    server.use(
      rest.get('https://example.com', (_, res, ctx) => {
        urlRequestTotal += 1
        return res(ctx.status(404))
      })
    )
    const probe = {
      ...probes[0],
      id: 'fj43l',
      incidentThreshold: 1,
      requests: [{ url: 'https://example.com', body: '', timeout: 30 }],
      alerts: [
        { id: 'jFQBd', assertion: 'response.status != 200', message: '' },
      ],
    }
    const notifications = [
      {
        id: 'jFQBd',
        data: { url: 'https://example.com/webhook' },
        type: 'webhook',
      },
    ]
    initializeProbeStates([probe])
    // wait until the interval passed
    const seconds = 1000
    await sleep(seconds)

    // act
    await doProbe({
      probe,
      notifications,
      signal: new AbortController().signal,
    })
    // wait for random timeout
    await sleep(3 * seconds)
    server.resetHandlers()
    // wait for the send notification function to resolve
    await sleep(3 * seconds)

    // assert
    expect(notificationAlert?.[probe.requests[0].url]?.body?.url).eq(
      'https://example.com'
    )
    expect(notificationAlert?.[probe.requests[0].url]?.body?.alert).eq(
      'response.status != 200'
    )
  }).timeout(10_000)
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
