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
import { probeMongo } from './index.js'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request.js'
import { moduleExports } from './request.js'

let mongoRequestStub: sinon.SinonStub

describe('MongoDB Prober', () => {
  beforeEach(() => {
    mongoRequestStub = sinon.stub(moduleExports, 'mongoRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'mongo',
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

  it('should probe using MongoDB', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      mongo: [
        {
          host: 'localhost',
          port: 2701,
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probeMongo(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('mongo')
    sinon.assert.calledOnce(mongoRequestStub)
  })

  it('should probe multiple probes', async () => {
    // arrange
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      mongo: [
        {
          host: 'localhost',
          port: 2701,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
        {
          host: 'localhost',
          port: 2701,
          database: 'monika_database_staging',
          username: 'monika_username_staging',
          password: 'monika_password_staging',
        },
      ],
    }

    // act
    const probeResults = await probeMongo(probeParams)

    // assert
    expect(probeResults.length).eq(2)
    sinon.assert.calledTwice(mongoRequestStub)
  })

  it('should return alert triggered', async () => {
    // arrange
    sinon.restore()
    mongoRequestStub = sinon.stub(moduleExports, 'mongoRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'mongo',
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
      mongo: [
        {
          host: 'localhost',
          port: 2701,
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probeMongo(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(mongoRequestStub)
  })

  it('should use mongoDB uri', async () => {
    // arrange
    sinon.restore()
    mongoRequestStub = sinon.stub(moduleExports, 'mongoRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'mongo',
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
      mongo: [
        {
          host: 'localhost',
          port: 2701,
          username: 'monika_username',
          password: 'monika_password',
          uri: 'mongodb://monika_username:monika_password@localhost:2701',
        },
      ],
    }

    // act
    const probeResults = await probeMongo(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(mongoRequestStub)
  })
})
