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
import sinon from 'sinon'

import type { MonikaFlags } from '../flag'
import type { Config } from '../interfaces/config'

import SymonClient from '.'
import { validateProbes } from '../components/config/validation'
import * as loggerHistory from '../components/logger/history'
import { setContext } from '../context'
import { getErrorMessage } from 'src/utils/catch-handler'

let getUnreportedLogsStub: sinon.SinonStub

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
    setContext({
      flags: {
        symonUrl: 'https://example.com',
        symonKey: 'random-key',
      } as MonikaFlags,
    })

    getUnreportedLogsStub = sinon
      .stub(loggerHistory, 'getUnreportedLogs')
      .resolves({ requests: [], notifications: [] })
  })
  afterEach(() => {
    server.resetHandlers()
    getUnreportedLogsStub.restore()
  })
  after(() => {
    server.close()
  })

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
    ],
  }

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
      ),
      rest.get(
        'http://localhost:4000/api/v1/monika/1234/probes',
        (_, res, ctx) =>
          res(
            ctx.set('etag', config.version || ''),
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: config.probes,
            })
          )
      )
    )

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    const reportSpy = sinon.spy(symon, 'report')
    await symon.initiate()
    await symon.stopReport()
    expect(symon.monikaId).equals('1234')

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

    expect(reportSpy.called).equals(true)
  }).timeout(15_000)

  it('should fetch probes config on initiate', async () => {
    server.use(
      rest.get(
        'http://localhost:4000/api/v1/monika/1234/probes',
        (_, res, ctx) =>
          res(
            ctx.set('etag', config.version || ''),
            ctx.json({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: config.probes,
            })
          )
      )
    )

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    sinon.spy(symon, 'report')

    expect(symon.config).to.be.null

    await symon.initiate()
    await symon.stopReport()

    expect(symon.config).deep.equals({
      ...config,
      probes: await validateProbes(config.probes),
    })
  }).timeout(15_000)

  it('should throw an error if the request to get probes is failed', async () => {
    // arrange
    server.resetHandlers()
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
      )
    )

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    let errorMessage = ''

    try {
      // act
      await symon.initiate()
    } catch (error: unknown) {
      errorMessage = getErrorMessage(error)
    }

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
    })
    sinon.spy(symon, 'report')
    symon.monikaId = '1234'

    // act
    await symon.notifyEvent({
      event: 'incident',
      alertId: 'alert86',
      response: { status: 400, time: 1000 },
    })

    // assert
    expect(body.monikaId).equals('1234')
    expect(body.event).equals('incident')
    expect(body.alertId).equals('alert86')
    expect(body.response).deep.equals({ status: 400, time: 1000 })
  }).timeout(15_000)
})
