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
import { type DefaultBodyType, HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import type { Config } from '../interfaces/config'
import type { Probe } from '../interfaces/probe'

import SymonClient from '.'
import { getContext, resetContext, setContext } from '../context'
import { deleteProbe, findProbe, getProbes } from '../components/config/probe'
import { validateProbes } from '../components/config/validation'
import { addIncident, findIncident } from '../components/incident'
import events from '../events'
import { sanitizeFlags } from '../flag'
import { getEventEmitter } from '../utils/events'
import { getErrorMessage } from '../utils/catch-error-handler'
import { getProbeState, initializeProbeStates } from '../utils/probe-state'

const config: Config = {
  version: 'f7c35f9f873da44bca433427b4d30fc5',
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
      requests: [
        {
          url: 'https://example.com',
          body: '',
          followRedirects: 21,
          timeout: 2000,
        },
      ],
      alerts: [],
    },
  ],
}
const myIP = '192.168.1.1' // hardcode so not dependent on getIp()
const server = setupServer(
  http.get('http://ip-api.com/json/192.168.1.1', () =>
    HttpResponse.json({
      city: 'jakarta',
      isp: 'hyperjump',
      country: 'Indonesia',
    })
  ),
  http.post('http://localhost:4000/api/v1/monika/client-handshake', () =>
    HttpResponse.json({
      statusCode: 'ok',
      message: 'Successfully handshaked with Symon',
      data: {
        monikaId: '1234',
      },
    })
  ),
  http.get('http://localhost:4000/api/v1/monika/1234/probes', () =>
    HttpResponse.json(
      {
        statusCode: 'ok',
        message: 'Successfully get probes configuration',
        data: config.probes,
      },
      { headers: { etag: config.version || '' } }
    )
  ),
  http.get('https://example.com', () => HttpResponse.json({})),
  http.get('http://localhost:4000/api/v1/monika/report', () =>
    HttpResponse.json({
      statusCode: 'ok',
      message: 'Successfully report to Symon',
    })
  )
)

describe('Symon initiate', () => {
  before(() => {
    server.listen()
  })
  beforeEach(() => {
    resetContext()
    setContext({
      flags: sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
      }),
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
    resetContext()
  })

  it('should send handshake data on initiate', async () => {
    // arrange
    setContext({
      userAgent: 'v1.5.0',
      flags: sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
      }),
    })
    let body: DefaultBodyType = {}
    // mock the outgoing requests
    server.use(
      http.post(
        'http://localhost:4000/api/v1/monika/client-handshake',
        async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({
            statusCode: 'ok',
            message: 'Successful handshake with Symon',
            data: {
              monikaId: '1234',
            },
          })
        }
      )
    )

    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )
    await symon.initiate()
    await symon.stop()

    expect(body.publicIp).equals(myIP)
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
    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )

    expect(getContext().config).to.be.undefined

    await symon.initiate()
    await symon.stop()

    expect(getContext().config?.version).deep.eq(config.version)
    expect(getProbes()).deep.eq(await validateProbes(config.probes))
  }).timeout(15_000)

  it('should throw an error if the request to get probes is failed', async () => {
    // arrange
    server.use(
      http.post('http://localhost:4000/api/v1/monika/client-handshake', () =>
        HttpResponse.json({
          statusCode: 'ok',
          message: 'Successfully handshaked with Symon',
          data: {
            monikaId: '1234',
          },
        })
      ),
      http.get('http://localhost:4000/api/v1/monika/1234/probes', () => {
        throw new Error('Failed to get probes from Symon')
        // new HttpResponse(null, {
        //   status: 500,
        //   statusText: 'Failed to get probes from Symon',
        // })
      })
    )

    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )
    let errorMessage = ''

    try {
      // act
      await symon.initiate()
    } catch (error: unknown) {
      errorMessage = getErrorMessage(error)
    }

    await symon.stop()

    // assert
    expect(errorMessage).eq('Failed to get probes from Symon')
  }).timeout(15_000)

  it('should send event to Symon when incident or recovery happens', async () => {
    // arrange
    let body: DefaultBodyType = {}
    server.use(
      http.post(
        'http://localhost:4000/api/v1/monika/events',
        async ({ request }) => {
          body = await request.json()

          return HttpResponse.json({
            message: 'Successfully send incident event to Symon',
            data: null,
          })
        }
      )
    )
    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
        symonMonikaId: '1234',
      })
    )
    await symon.initiate()

    // act
    getEventEmitter().emit(events.probe.notification.willSend, {
      probeState: 'DOWN',
      validation: {
        response: {
          headers: '',
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
    const newProbe: Probe = {
      id: '3',
      name: 'New Probe',
      interval: 2,
      requests: [
        {
          url: 'https://example.com',
          body: '',
          followRedirects: 21,
          timeout: 2000,
        },
      ],
      alerts: [],
    }
    server.use(
      http.get('http://localhost:4000/api/v1/monika/1234/probe-changes', () =>
        HttpResponse.json({
          message: 'Successfully get probe changes',
          data: [{ type: 'add', probe: newProbe }],
        })
      )
    )
    const symonGetProbesIntervalMs = 100
    setContext({
      flags: sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      }),
    })
    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes().length).eq(2)

    // act
    // 4. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 5. Check the updated probe cache
    expect(getProbes().length).eq(3)

    await symon.stop()
  }).timeout(15_000)

  it('should update a probe', async () => {
    // arrange
    server.use(
      http.get('http://localhost:4000/api/v1/monika/1234/probe-changes', () =>
        HttpResponse.json({
          message: 'Successfully get probe changes',
          data: [
            {
              type: 'update',
              // eslint-disable-next-line camelcase
              probe_id: '1',
              probe: { ...findProbe('1'), interval: 2 },
            },
          ],
        })
      )
    )
    const symonGetProbesIntervalMs = 100
    setContext({
      flags: sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      }),
    })
    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes().length).eq(2)

    // act
    // 4. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 5. Check the updated probe cache
    expect(getProbes().length).eq(2)
    expect(findProbe('1')?.interval).eq(2)

    await symon.stop()
  }).timeout(15_000)

  it('should delete a probe', async () => {
    // arrange
    server.use(
      http.get('http://localhost:4000/api/v1/monika/1234/probe-changes', () =>
        HttpResponse.json({
          message: 'Successfully get probe changes',
          data: [
            {
              type: 'delete',
              // eslint-disable-next-line camelcase
              probe_id: '1',
              probe: {},
            },
          ],
        })
      )
    )
    const symonGetProbesIntervalMs = 100
    setContext({
      flags: sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      }),
    })
    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes().length).eq(2)

    // act
    // 4. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 5. Check the updated probe cache
    expect(getProbes().length).eq(1)

    await symon.stop()
  }).timeout(15_000)

  it('should disable a probe', async () => {
    // arrange
    server.use(
      http.get('http://localhost:4000/api/v1/monika/1234/probe-changes', () =>
        HttpResponse.json({
          message: 'Successfully get probe changes',
          data: [
            {
              type: 'disabled',
              // eslint-disable-next-line camelcase
              probe_id: '1',
              probe: {},
            },
          ],
        })
      )
    )

    const symonGetProbesIntervalMs = 100
    setContext({
      flags: sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'random-key',
        symonGetProbesIntervalMs,
      }),
    })
    const symon = new SymonClient(
      sanitizeFlags({
        symonUrl: 'http://localhost:4000',
        symonKey: 'abcd',
      })
    )

    // 1. Check initial probe cache
    expect(getProbes()).deep.eq([])

    // act
    // 2. Initiate Symon and get all the probes
    await symon.initiate()

    // assert
    // 3. Check the probe data after connected to Symon
    expect(getProbes().length).eq(2)
    initializeProbeStates(getProbes())
    addIncident({
      alert: { assertion: '', id: '', message: '' },
      probeID: config.probes[0].id,
      probeRequestURL: '',
    })
    addIncident({
      alert: { assertion: '', id: '', message: '' },
      probeID: config.probes[1].id,
      probeRequestURL: '',
    })

    // act
    // 4. Wait for the probe fetch to run
    await sleep(symonGetProbesIntervalMs)

    // assert
    // 5. Check the updated probe cache and state
    expect(getProbes().length).eq(1)
    expect(getProbeState('1')).to.be.undefined
    expect(getProbeState('2')).to.not.undefined
    expect(findIncident('1')).to.be.undefined
    expect(findIncident('2')).to.not.be.undefined

    await symon.stop()
  }).timeout(15_000)
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
