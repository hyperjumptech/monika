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
import sinon from 'sinon'
import { probePing } from '.'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request'
import * as request from './request'

let pingRequestStub: sinon.SinonStub

describe('Ping/ICMP Prober', () => {
  beforeEach(() => {
    pingRequestStub = sinon
      .stub(request, 'icmpRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          data: '',
          body: '',
          status: 0,
          result: probeRequestResult.failed,
          headers: '',
          responseTime: 0,
          isProbeResponsive: false,
        }
      })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should have no result when input param is empty', async () => {
    // act
    const probeResults = await probePing({ id: 'FgYCA', checkOrder: 1 })

    // assert
    expect(probeResults).deep.eq([])
    sinon.assert.notCalled(pingRequestStub)
  })

  it('should probe using Ping', async () => {
    // arrange
    const pingParams = {
      id: 'test-ping',
      checkOrder: 1,
      pings: [
        {
          uri: 'www.hyperjump.tech',
        },
      ],
    }

    // act
    const res = await probePing(pingParams)

    // assert
    expect(res.length).deep.eq(1)
    sinon.assert.calledOnce(pingRequestStub)
  })

  it('array of 2 pings should work', async () => {
    // arrange
    const pingParams = {
      id: 'test-ping',
      checkOrder: 1,
      pings: [
        {
          uri: 'www.hyperjump.tech',
        },
        {
          uri: 'google.com',
        },
      ],
    }

    // act
    const res = await probePing(pingParams)

    // assert
    expect(res.length).deep.eq(2)
    sinon.assert.calledTwice(pingRequestStub)
  })

  it('should result in an alert', async () => {
    // arrange
    sinon.restore()
    pingRequestStub = sinon
      .stub(request, 'icmpRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          data: '',
          body: '',
          status: 0,
          headers: '',
          responseTime: 0,
          result: probeRequestResult.failed,
          isProbeResponsive: true,
        }
      })
    const pingParams = {
      id: 'test-ping',
      checkOrder: 1,
      pings: [
        {
          uri: 'www.hyperjump.tech',
        },
      ],
    }

    // act
    const res = await probePing(pingParams)

    // assert
    expect(res[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(pingRequestStub)
  })
})
