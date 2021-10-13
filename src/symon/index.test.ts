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
import chai from 'chai'
import spies from 'chai-spies'
import Stun from 'stun'

chai.use(spies)

describe('Symon Handshake', () => {
  let interceptor: any
  let testStunStub: any

  beforeEach(() => {
    interceptor = new RequestInterceptor(withDefaultInterceptors)

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

      // mock the call to get isp and city
      if (['http://ip-api.com'].includes(req.url.origin)) {
        return {
          status: 200,
          body: JSON.stringify({
            city: 'jakarta',
            isp: 'hyperjump',
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
