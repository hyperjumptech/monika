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

let interceptor: RequestInterceptor
let testStunStub: sinon.SinonStub

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
})

afterEach(() => {
  interceptor.restore()
  testStunStub.restore()
})

describe('Symon Handshake', () => {
  it('should send handshake data on initiate', async () => {
    let sentBody = ''
    // mock the outgoing requests
    interceptor.use((req: any) => {
      // mock the handshake to symon
      if (['http://localhost:4000'].includes(req.url.origin)) {
        sentBody = req.body
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
    })

    const symon = new SymonClient('http://localhost:4000', 'abcd')
    await symon.initiate()
    expect(symon.monikaId).equals('1234')

    const body = JSON.parse(sentBody)
    expect(body.publicIp).equals('192.168.1.1')
    expect(body.pid).greaterThan(0)
    expect(body.macAddress).length.greaterThan(0)
    expect(body.isp).equals('hyperjump')
    expect(body.city).equals('jakarta')
    expect(body.host).length.greaterThan(0)
    expect(body.privateIp).length.greaterThan(0)
  })
})

describe('Send incident or recovery event', () => {
  it('should send event to Symon when incident or recovery happens', async () => {
    let sentBody = ''

    // mock the outgoing requests
    interceptor.use((req) => {
      if (
        req.url.href === 'http://localhost:4000/api/v1/monika/client-handshake'
      ) {
        return {
          status: 200,
          body: JSON.stringify({
            message: 'Successfully handshaked with Symon',
            data: {
              monikaId: '1234',
            },
          }),
        }
      }

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

    const symon = new SymonClient('http://localhost:4000/api', 'abcd')
    await symon.initiate()

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
