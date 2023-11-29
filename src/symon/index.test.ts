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
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { monikaFlagsDefaultValue, type MonikaFlags } from '../flag'
import type { Config } from '../interfaces/config'
import type { Probe } from '../interfaces/probe'

import SymonClient from '.'
import { getContext, resetContext, setContext } from '../context'
import { deleteProbe, getProbes } from '../components/config/probe'
import { validateProbes } from '../components/config/validation'
import events from '../events'
import { md5Hash } from '../utils/hash'
import { getEventEmitter } from '../utils/events'

const config: Config = {
  version: 'asdfg123',
  probes: [
    {
      id: '1',
      name: 'test',
      interval: 10,
      requests: [],
      alerts: [],
    },
    {
      id: '2',
      name: 'Example',
      interval: 10,
      requests: [{ url: 'https://example.com', body: '', timeout: 2000 }],
      alerts: [],
    },
  ],
}
const server = setupServer(
  rest.get('http://ip-api.com/json/192.168.1.1', (_, res, ctx) =>
    res(
      ctx.json({
        city: 'jakarta',
        isp: 'hyperjump',
        country: 'Indonesia',
      })
    )
  ),
  rest.post(
    'http://localhost:4000/api/v1/monika/client-handshake',
    (_, res, ctx) =>
      res(
        ctx.json({
          statusCode: 'ok',
          message: 'Successfully handshaked with Symon',
          data: {
            monikaId: '1234',
          },
        })
      )
  ),
  rest.post('http://localhost:4000/api/v1/monika/status', (_, res, ctx) =>
    res(ctx.status(200))
  ),
  rest.get('http://localhost:4000/api/v1/monika/1234/probes', (_, res, ctx) =>
    res(
      ctx.set('etag', config.version || ''),
      ctx.json({
        statusCode: 'ok',
        message: 'Successfully get probes configuration',
        data: config.probes,
      })
    )
  ),
  rest.get('https://example.com', (_, res, ctx) => res(ctx.json({}))),
  rest.get('http://localhost:4000/api/v1/monika/report', (_, res, ctx) =>
    res(
      ctx.json({
        statusCode: 'ok',
        message: 'Successfully report to Symon',
      })
    )
  )
)

describe('Symon initiate', () => {
  before(() => {
    server.listen()
  })
  beforeEach(() => {
    resetContext()
    setContext({
      flags: {
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs:
          monikaFlagsDefaultValue.symonGetProbesIntervalMs,
      } as MonikaFlags,
    })

    // reset probe cache
    for (const { id } of getProbes()) {
      deleteProbe(id)
    }
  })
  afterEach(() => {
    server.resetHandlers()
  })
  after(() => {
    server.close()
  })

  it('should send handshake data on initiate', async () => {
    setContext({
      userAgent: 'v1.5.0',
      flags: {
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
      } as MonikaFlags,
    })
    let body: any
    // mock the outgoing requests
    server.use(
      rest.post(
        'http://localhost:4000/api/v1/monika/client-handshake',
        async (req, res, ctx) => {
          body = await req.json()

          return res(
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully handshaked with Symon',
              data: {
                monikaId: '1234',
              },
            })
          )
        }
      )
    )

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    await symon.initiate()
    await symon.stop()

    expect(body.publicIp).equals('192.168.1.1')
    expect(body.pid).greaterThan(0)
    expect(body.macAddress).length.greaterThan(0)
    expect(body.isp).equals('hyperjump')
    expect(body.city).equals('jakarta')
    expect(body.country).equals('Indonesia')
    expect(body.hostname).length.greaterThan(0)
    expect(body.privateIp).length.greaterThan(0)
    expect(body.os).length.greaterThan(0)
    expect(body.version).equals('v1.5.0')
  }).timeout(15_000)

  it('should fetch probes config on initiate', async () => {
    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })

    expect(getContext().config).to.be.undefined

    await symon.initiate()
    await symon.stop()

    expect(getContext().config).deep.equals({
      ...config,
      probes: await validateProbes(config.probes),
    })
    expect(getProbes()).deep.eq(await validateProbes(config.probes))
  }).timeout(15_000)

  it('should throw an error if the request to get probes is failed', async () => {
    // arrange
    server.use(
      rest.post(
        'http://localhost:4000/api/v1/monika/client-handshake',
        (_, res, ctx) =>
          res(
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully handshaked with Symon',
              data: {
                monikaId: '1234',
              },
            })
          )
      ),
      rest.get('http://localhost:4000/api/v1/monika/1234/probes', () => {
        throw new Error('Failed')
      })
    )

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    let errorMessage = ''

    try {
      // act
      await symon.initiate()
    } catch (error: any) {
      errorMessage = error?.message
    }

    await symon.stop()

    // assert
    expect(errorMessage).eq('Failed to get probes from Symon')
  }).timeout(15_000)

  it('should send event to Symon when incident or recovery happens', async () => {
    // arrange
    let body: any
    server.use(
      rest.post(
        'http://localhost:4000/api/v1/monika/events',
        async (req, res, ctx) => {
          body = await req.json()

          return res(
            ctx.json({
              message: 'Successfully send incident event to Symon',
              data: null,
            })
          )
        }
      )
    )
    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
      symonMonikaId: '1234',
    })
    await symon.initiate()

    // act
    getEventEmitter().emit(events.probe.notification.willSend, {
      probeState: 'DOWN',
      validation: {
        response: {
          status: 400,
          responseTime: 1000,
        },
      },
      alertId: 'p422i',
    })
    await symon.stop()

    // assert
    expect(body.monikaId).equals('1234')
    expect(body.event).equals('incident')
    expect(body.alertId).equals('p422i')
    expect(body.response).deep.equals({
      headers: {},
      status: 400,
      time: 1000,
    })
  }).timeout(15_000)

  it('should add a new probe', async () => {
    // arrange
    const symonGetProbesIntervalMs = 100
    setContext({
      flags: {
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      } as MonikaFlags,
    })
    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes()).deep.eq(await validateProbes(config.probes))

    // arrange
    // 4. Simulate adding a probe
    const newProbe: Probe = {
      id: '3',
      name: 'New Probe',
      interval: 2,
      requests: [{ url: 'https://example.com', body: '', timeout: 2000 }],
      alerts: [],
    }
    server.use(
      rest.get(
        'http://localhost:4000/api/v1/monika/1234/probes',
        (_, res, ctx) => {
          const newProbes: Probe[] = [...config.probes, newProbe]

          return res(
            ctx.set('etag', md5Hash(newProbes)),
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: newProbes,
            })
          )
        }
      )
    )

    // act
    // 5. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 6. Check the updated probe cache
    expect(getProbes()).deep.eq(
      await validateProbes([...config.probes, newProbe])
    )

    // act
    // 7. Wait for probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 8. Should not update the probe cache
    expect(getProbes()).deep.eq(
      await validateProbes([...config.probes, newProbe])
    )
    await symon.stop()
  }).timeout(15_000)

  it('should update a probe', async () => {
    // arrange
    const symonGetProbesIntervalMs = 100
    setContext({
      flags: {
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      } as MonikaFlags,
    })
    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes()).deep.eq(await validateProbes(config.probes))

    // arrange
    // 4. Simulate updating a probe
    const updatedProbes: Probe[] = [{ ...config.probes[0], interval: 5 }]
    server.use(
      rest.get(
        'http://localhost:4000/api/v1/monika/1234/probes',
        (_, res, ctx) => {
          const newProbes: Probe[] = updatedProbes

          return res(
            ctx.set('etag', md5Hash(newProbes)),
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: newProbes,
            })
          )
        }
      )
    )

    // act
    // 5. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 6. Check the updated probe cache
    expect(getProbes()).deep.eq(await validateProbes(updatedProbes))

    await symon.stop()
  }).timeout(15_000)

  it('should delete a probe', async () => {
    // arrange
    const symonGetProbesIntervalMs = 100
    setContext({
      flags: {
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      } as MonikaFlags,
    })
    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes()).deep.eq(await validateProbes(config.probes))

    // arrange
    // 4. Simulate deleting a probe
    const updatedProbes: Probe[] = config.probes.filter(({ id }) => id === '1')
    server.use(
      rest.get(
        'http://localhost:4000/api/v1/monika/1234/probes',
        (_, res, ctx) =>
          res(
            ctx.set('etag', md5Hash(updatedProbes)),
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: updatedProbes,
            })
          )
      )
    )

    // act
    // 5. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 6. Check the updated probe cache
    expect(getProbes()).deep.eq(await validateProbes(updatedProbes))

    await symon.stop()
  }).timeout(15_000)
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
