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
import { RequestInterceptor } from 'node-request-interceptor'
import withDefaultInterceptors from 'node-request-interceptor/lib/presets/default'
import SymonClient from '.'
import sinon from 'sinon'
import Stun from 'stun'
import { Config } from '../interfaces/config'
import * as loggerHistory from '../components/logger/history'
import { setContext } from '../context'
import { SYMON_API_VERSION } from '../flag'

let interceptor: RequestInterceptor
let testStunStub: sinon.SinonStub
let getUnreportedLogsStub: sinon.SinonStub

beforeEach(() => {
  interceptor = new RequestInterceptor(withDefaultInterceptors)

  interceptor.use((req) => {
    // mock the call to get isp and city
    if (req.url.origin === 'http://ip-api.com') {
      return {
        status: 200,
        body: JSON.stringify({
          city: 'jakarta',
          isp: 'hyperjump',
          country: 'Indonesia',
        }),
      }
    }
  })

  // mock the stun request
  testStunStub = sinon.stub(Stun, 'request').resolves({
    getXorAddress: () => {
      return {
        address: '192.168.1.1',
      }
    },
  })

  getUnreportedLogsStub = sinon
    .stub(loggerHistory, 'getUnreportedLogs')
    .resolves({ requests: [], notifications: [] })
})

afterEach(() => {
  interceptor.restore()
  testStunStub.restore()
  getUnreportedLogsStub.restore()
})

describe('Symon initiate', () => {
  it('should send handshake data on initiate', async () => {
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

    setContext({
      userAgent: 'v1.5.0',
    })
    let sentBody = ''
    // mock the outgoing requests
    interceptor.use((req) => {
      // mock the handshake to symon
      if (req.url.origin === 'http://localhost:4000') {
        if (req.url.pathname.endsWith('client-handshake')) {
          sentBody = req.body!
          return {
            status: 200,
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully handshaked with Symon',
              data: {
                monikaId: '1234',
              },
            }),
          }
        }

        if (req.url.pathname.endsWith('probes')) {
          return {
            status: 200,
            headers: {
              etag: config.version as string,
            },
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: config.probes,
            }),
          }
        }
      }
    })

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    sinon.spy(symon, 'report')

    await symon.initiate()
    await symon.stopReport()
    expect(symon.monikaId).equals('1234')

    const body = JSON.parse(sentBody)
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
  })

  it('should fetch probes config on initiate', async () => {
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

    interceptor.use((req) => {
      if (req.url.origin === 'http://localhost:4000') {
        if (req.url.pathname.endsWith('client-handshake')) {
          return {
            status: 200,
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully handshaked with Symon',
              data: {
                monikaId: '1234',
              },
            }),
          }
        }

        if (req.url.pathname.endsWith('probes')) {
          return {
            status: 200,
            headers: {
              etag: config.version as string,
            },
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
              data: config.probes,
            }),
          }
        }

        if (req.url.pathname.endsWith('report')) {
          return {
            status: 200,
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully report to Symon',
            }),
          }
        }
      }
    })

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    sinon.spy(symon, 'report')

    expect(symon.config).to.be.null

    await symon.initiate()
    await symon.stopReport()

    expect(symon.config).deep.equals(config)
  })

  it('should report on initiate', async () => {
    interceptor.use((req) => {
      if (req.url.origin === 'http://localhost:4000') {
        if (req.url.pathname.endsWith('client-handshake')) {
          return {
            status: 200,
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully handshaked with Symon',
              data: {
                monikaId: '1234',
              },
            }),
          }
        }

        if (req.url.pathname.endsWith('probes')) {
          return {
            status: 200,
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully get probes configuration',
            }),
          }
        }

        if (req.url.pathname.endsWith('report')) {
          return {
            status: 200,
            body: JSON.stringify({
              statusCode: 'ok',
              message: 'Successfully report to Symon',
            }),
          }
        }
      }
    })

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
    })
    const reportSpy = sinon.spy(symon, 'report')

    await symon.initiate()
    await symon.stopReport()

    expect(reportSpy.called).equals(true)
  })
})

describe('Send incident or recovery event', () => {
  it('should send event to Symon when incident or recovery happens', async () => {
    let sentBody = ''

    // mock the outgoing requests
    interceptor.use((req) => {
      if (req.url.href === 'http://localhost:4000/api/v1/monika/events') {
        sentBody = req.body as string

        return {
          status: 200,
          body: JSON.stringify({
            message: 'Successfully send incident event to Symon',
            data: null,
          }),
        }
      }
    })

    const symon = new SymonClient({
      symonUrl: 'http://localhost:4000',
      symonKey: 'abcd',
      'symon-api-version': SYMON_API_VERSION.v1,
    })
    sinon.spy(symon, 'report')
    symon.monikaId = '1234'

    await symon.notifyEvent({
      event: 'incident',
      alertId: 'alert86',
      response: { status: 400, time: 1000 },
    })

    const body = JSON.parse(sentBody)
    expect(body.monikaId).equals('1234')
    expect(body.event).equals('incident')
    expect(body.alertId).equals('alert86')
    expect(body.response).deep.equals({ status: 400, time: 1000 })
  })
})
