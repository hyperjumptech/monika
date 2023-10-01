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
import SymonClient from '.'
import sinon from 'sinon'
import Stun from 'stun'
import { Config } from '../interfaces/config'
import * as loggerHistory from '../components/logger/history'
import { setContext } from '../context'
import express from 'express'
import bodyParser from 'body-parser'

let testStunStub: sinon.SinonStub
let getUnreportedLogsStub: sinon.SinonStub

beforeEach(() => {
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
          incidentThreshold: 5,
          recoveryThreshold: 5,
          alerts: [],
        },
      ],
    }

    setContext({
      userAgent: 'v1.5.0',
    })
    let sentBody: any
    // mock the outgoing requests
    const appExpress = express()
    appExpress.use(bodyParser.json())
    appExpress.post('/api/v1/monika/status', (req, res) => {
      res.status(200).send()
    })
    appExpress.post('/api/v1/monika/client-handshake', (req, res) => {
      sentBody = req.body
      res
        .status(200)
        .json({
          statusCode: 'ok',
          message: 'Successfully handshaked with Symon',
          data: {
            monikaId: '1234',
          },
        })
        .send()
    })
    appExpress.get('/api/v1/monika/1234/probes', (req, res) => {
      res
        .status(200)
        .json({
          statusCode: 'ok',
          message: 'Successfully get probes configuration',
          data: config.probes,
        })
        .send()
    })
    const server = appExpress.listen(5001, 'localhost')

    const symon = new SymonClient({
      symonUrl: 'http://localhost:5001',
      symonKey: 'abcd',
    })
    sinon.spy(symon, 'report')

    await symon.initiate()
    await symon.stopReport()
    server.close()
    expect(symon.monikaId).equals('1234')

    expect(sentBody?.publicIp).matches(
      /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/gm
    )
    expect(sentBody?.pid).greaterThan(0)
    expect(sentBody?.macAddress).length.greaterThan(0)
    expect(sentBody?.isp).length.greaterThan(0)
    expect(sentBody?.city).length.greaterThan(0)
    expect(sentBody?.country).length.greaterThan(0)
    expect(sentBody?.hostname).length.greaterThan(0)
    expect(sentBody?.privateIp).length.greaterThan(0)
    expect(sentBody?.os).length.greaterThan(0)
    expect(sentBody?.version).equals('v1.5.0')
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
          incidentThreshold: 5,
          recoveryThreshold: 5,
          alerts: [],
        },
      ],
    }

    const appExpress = express()
    appExpress.all('*', (req, res) => {
      if (req.path.endsWith('client-handshake')) {
        res.status(200).json({
          statusCode: 'ok',
          message: 'Successfully handshaked with Symon',
          data: {
            monikaId: '1234',
          },
        })
      }

      if (req.path.endsWith('status')) {
        res.status(200).send()
      }

      if (req.path.endsWith('probes')) {
        res
          .status(200)
          .header('etag', config.version as string)
          .json({
            statusCode: 'ok',
            message: 'Successfully get probes configuration',
            data: config.probes,
          })
      }

      if (req.path.endsWith('report')) {
        res.status(200).json({
          statusCode: 'ok',
          message: 'Successfully report to Symon',
        })
      }
    })
    const server = appExpress.listen(5002, 'localhost')

    const symon = new SymonClient({
      symonUrl: 'http://localhost:5002',
      symonKey: 'abcd',
    })
    sinon.spy(symon, 'report')

    await symon.initiate()
    await symon.stopReport()
    server.close()

    expect(symon.config).deep.equals(config)
  })

  it('should report on initiate', async () => {
    const appExpress = express()
    appExpress.all('*', (req, res) => {
      if (req.path.endsWith('client-handshake')) {
        res.status(200).json({
          statusCode: 'ok',
          message: 'Successfully handshaked with Symon',
          data: {
            monikaId: '1234',
          },
        })
      }

      if (req.path.endsWith('status')) {
        res.status(200).send()
      }

      if (req.path.endsWith('probes')) {
        res.status(200).json({
          statusCode: 'ok',
          message: 'Successfully get probes configuration',
        })
      }

      if (req.path.endsWith('report')) {
        res.status(200).json({
          statusCode: 'ok',
          message: 'Successfully report to Symon',
        })
      }
    })
    const server = appExpress.listen(5003, 'localhost')

    const symon = new SymonClient({
      symonUrl: 'http://localhost:5003',
      symonKey: 'abcd',
    })
    const reportSpy = sinon.spy(symon, 'report')

    await symon.initiate()
    await symon.stopReport()
    server.close()

    expect(reportSpy.called).equals(true)
  })
})

describe('Send incident or recovery event', () => {
  it('should send event to Symon when incident or recovery happens', async () => {
    let sentBody: any

    // mock the outgoing requests
    const appExpress = express()
    appExpress.use(bodyParser.json())
    appExpress.all('*', (req, res) => {
      if (req.path.endsWith('events')) {
        sentBody = req.body
        res.status(200).json({
          message: 'Successfully send incident event to Symon',
          data: null,
        })
      }
    })
    const server = appExpress.listen(5004, 'localhost')

    const symon = new SymonClient({
      symonUrl: 'http://localhost:5004',
      symonKey: 'abcd',
      'symon-api-version': 'v1',
    })
    sinon.spy(symon, 'report')
    symon.monikaId = '1234'

    await symon.notifyEvent({
      event: 'incident',
      alertId: 'alert86',
      response: { status: 400, time: 1000 },
    })
    server.close()

    const body = sentBody
    expect(body.monikaId).equals('1234')
    expect(body.event).equals('incident')
    expect(body.alertId).equals('alert86')
    expect(body.response).deep.equals({ status: 400, time: 1000 })
  })
})
