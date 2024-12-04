import { expect } from '@oclif/test'
import sinon from 'sinon'
import { probePostgres } from './index.js'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request.js'
import { moduleExports } from './request.js'

let postgresRequestStub: sinon.SinonStub

describe('PostgreSQL Prober', () => {
  beforeEach(() => {
    postgresRequestStub = sinon
      .stub(moduleExports, 'postgresRequest')
      .callsFake(
        async (_options): Promise<ProbeRequestResponse> => ({
          requestType: 'postgres',
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

  it('should probe using PostgresSQL', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      postgres: [
        {
          uri: '',
          host: 'localhost',
          port: 5432,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probePostgres(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('postgres')
    sinon.assert.calledOnce(postgresRequestStub)
  })

  it('should probe multiple probes', async () => {
    // arrange
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      postgres: [
        {
          uri: '',
          host: 'localhost',
          port: 5432,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
        {
          uri: '',
          host: 'localhost',
          port: 5432,
          database: 'monika_database_staging',
          username: 'monika_username_staging',
          password: 'monika_password_staging',
        },
      ],
    }

    // act
    const probeResults = await probePostgres(probeParams)

    // assert
    expect(probeResults.length).eq(2)
    sinon.assert.calledTwice(postgresRequestStub)
  })

  it('should return alert triggered', async () => {
    // arrange
    sinon.restore()
    postgresRequestStub = sinon
      .stub(moduleExports, 'postgresRequest')
      .callsFake(
        async (_options): Promise<ProbeRequestResponse> => ({
          requestType: 'postgres',
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
      postgres: [
        {
          uri: '',
          host: 'localhost',
          port: 5432,
          username: 'monika_username',
          password: 'monika_password',
          database: 'monika_database',
        },
      ],
    }

    // act
    const probeResults = await probePostgres(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(postgresRequestStub)
  })

  it('should use postgresDB uri', async () => {
    // arrange
    sinon.restore()
    postgresRequestStub = sinon
      .stub(moduleExports, 'postgresRequest')
      .callsFake(
        async (_options): Promise<ProbeRequestResponse> => ({
          requestType: 'postgres',
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
      postgres: [
        {
          host: 'localhost',
          port: 5432,
          username: 'monika_username',
          password: 'monika_password',
          database: 'monika_database',
          uri: 'postgresdb://monika_username:monika_password@localhost:5432',
        },
      ],
    }

    // act
    const probeResults = await probePostgres(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(postgresRequestStub)
  })
})
