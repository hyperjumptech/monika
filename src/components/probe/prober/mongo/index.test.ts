import { expect } from 'chai'
import sinon from 'sinon'
import { probeMongo } from '.'
import { ProbeRequestResponse } from '../../../../interfaces/request'
import * as request from './request'

let mongoRequestStub: sinon.SinonStub

describe('MongoDB Prober', () => {
  beforeEach(() => {
    mongoRequestStub = sinon
      .stub(request, 'mongoRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'mongo',
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
    mongoRequestStub = sinon
      .stub(request, 'mongoRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'mongo',
          data: '',
          body: '',
          status: 0,
          headers: '',
          responseTime: 0,
          isProbeResponsive: false,
        }
      })
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
    mongoRequestStub = sinon
      .stub(request, 'mongoRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'mongo',
          data: '',
          body: '',
          status: 0,
          headers: '',
          responseTime: 0,
          isProbeResponsive: false,
        }
      })
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
