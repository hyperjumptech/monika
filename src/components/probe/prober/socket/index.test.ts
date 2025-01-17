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
import { probeSocket } from './index.js'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request.js'
import { moduleExports } from './request.js'

let tcpRequestStub: sinon.SinonStub

describe('TCP Prober', () => {
  beforeEach(() => {
    tcpRequestStub = sinon.stub(moduleExports, 'tcpRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'tcp',
        data: '',
        body: '',
        status: 200,
        headers: '',
        responseTime: 0,
        result: probeRequestResult.failed,
      })
    )
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should probe using TCP', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      socket: {
        host: 'localhost',
        port: 22,
        data: '',
      },
    }

    // act
    const probeResults = await probeSocket(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('tcp')
    sinon.assert.calledOnce(tcpRequestStub)
  })

  it('should return alert triggered', async () => {
    // arrange
    sinon.restore()
    tcpRequestStub = sinon.stub(moduleExports, 'tcpRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'tcp',
        data: '',
        body: '',
        status: 0,
        headers: '',
        responseTime: 0,
        result: probeRequestResult.failed,
      })
    )
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      socket: {
        host: 'localhost',
        port: 22,
        data: '',
      },
    }

    // act
    const probeResults = await probeSocket(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(tcpRequestStub)
  })
})
