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

import { expect } from 'chai'
import sinon from 'sinon'
import { probeScript } from '.'
import { ProbeRequestResponse } from '../../../../interfaces/request'
import * as request from './request'

let scriptRequestStub: sinon.SinonStub

describe('Script Prober', () => {
  beforeEach(() => {
    scriptRequestStub = sinon
      .stub(request, 'scriptRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'script',
          data: '',
          body: '',
          status: 200,
          headers: '',
          responseTime: 0,
          isProbeResponsive: false,
        }
      })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should probe using Script', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      script: [
        {
          cmd: 'echo Hello World',
        },
      ],
    }

    // act
    const probeResults = await probeScript(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('script')
    sinon.assert.calledOnce(scriptRequestStub)
  })

  it('should probe multiple probes', async () => {
    // arrange
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      script: [
        {
          cmd: 'echo Hello World',
        },
        {
          cmd: 'echo Good-buy',
        },
      ],
    }

    // act
    const probeResults = await probeScript(probeParams)

    // assert
    expect(probeResults.length).eq(2)
    sinon.assert.calledTwice(scriptRequestStub)
  })

  it('should return alert triggered', async () => {
    // arrange
    sinon.restore()
    scriptRequestStub = sinon
      .stub(request, 'scriptRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'script',
          data: '',
          body: '',
          status: 1,
          headers: '',
          responseTime: 0,
          isProbeResponsive: false,
        }
      })
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      script: [
        {
          cmd: 'echo Hello World',
        },
      ],
    }

    // act
    const probeResults = await probeScript(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(scriptRequestStub)
  })
})
