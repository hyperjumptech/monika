import { expect } from '@oclif/test'
import sinon from 'sinon'
import { probeRedis } from './index.js'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request.js'
import { moduleExports } from './request.js'

let redisPingStub: sinon.SinonStub

describe('Redis Prober', () => {
  beforeEach(() => {
    redisPingStub = sinon.stub(moduleExports, 'redisRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'redis',
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

  it('should probe using Redis', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      redis: [
        {
          host: 'localhost',
          port: 6379,
        },
      ],
    }

    // act
    const probeResults = await probeRedis(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('redis')
    sinon.assert.calledOnce(redisPingStub)
  })

  it('should probe using Redis url', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      redis: [
        {
          uri: 'redis://0.0.0.0:6379',
        },
      ],
    }

    // act
    const probeResults = await probeRedis(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('redis')
    sinon.assert.calledOnce(redisPingStub)
  })

  it('should probe multiple probes', async () => {
    // arrange
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      redis: [
        {
          host: 'localhost',
          port: 6379,
        },
        {
          host: 'localhost',
          port: 6379,
        },
      ],
    }

    // act
    const probeResults = await probeRedis(probeParams)

    // assert
    expect(probeResults.length).eq(2)
    sinon.assert.calledTwice(redisPingStub)
  })

  it('should return alert triggered', async () => {
    // arrange
    sinon.restore()
    redisPingStub = sinon.stub(moduleExports, 'redisRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'redis',
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
      redis: [
        {
          host: 'localhost',
          port: 6379,
        },
      ],
    }

    // act
    const probeResults = await probeRedis(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(redisPingStub)
  })
})
