import { expect } from '@oclif/test'
import sinon from 'sinon'
import { probeMariaDB } from './index.js'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../../interfaces/request.js'
import * as request from './request.js'

let mariaDBRequestStub: sinon.SinonStub

describe('Maria DB/MySQL Prober', () => {
  beforeEach(() => {
    mariaDBRequestStub = sinon.stub(request, 'mariaRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'mariadb',
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

  it('should return empty result', async () => {
    // act
    const probeResults = await probeMariaDB({ id: 'FgYCA', checkOrder: 1 })

    // assert
    expect(probeResults).deep.eq([])
    sinon.assert.notCalled(mariaDBRequestStub)
  })

  it('should probe using Maria DB', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      mariaDB: [
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probeMariaDB(probeParams)

    // assert
    expect(probeResults.length).deep.eq(1)
    expect(probeResults[0].logMessage).include('mariadb')
    sinon.assert.calledOnce(mariaDBRequestStub)
  })

  it('should probe using Maria DB if both of the database is filled', async () => {
    // arrange
    const probeParams = {
      id: 'FgYCA',
      checkOrder: 1,
      mariaDB: [
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
      mysql: [
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probeMariaDB(probeParams)

    // assert
    expect(probeResults.length).eq(1)
    expect(probeResults[0].logMessage).include('mariadb')
    sinon.assert.calledOnce(mariaDBRequestStub)
  })

  it('should probe using MySQL', async () => {
    // arrange
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      mysql: [
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probeMariaDB(probeParams)

    // assert
    expect(probeResults.length).eq(1)
    expect(probeResults[0].logMessage).include('mysql')
    sinon.assert.calledOnce(mariaDBRequestStub)
  })

  it('should probe multiple probes', async () => {
    // arrange
    const probeParams = {
      id: 'wTBPV',
      checkOrder: 1,
      mariaDB: [
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database_staging',
          username: 'monika_username_staging',
          password: 'monika_password_staging',
        },
      ],
    }

    // act
    const probeResults = await probeMariaDB(probeParams)

    // assert
    expect(probeResults.length).eq(2)
    sinon.assert.calledTwice(mariaDBRequestStub)
  })

  it('should return alert triggered', async () => {
    // arrange
    sinon.restore()
    mariaDBRequestStub = sinon.stub(request, 'mariaRequest').callsFake(
      async (_options): Promise<ProbeRequestResponse> => ({
        requestType: 'mariadb',
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
      mariaDB: [
        {
          host: 'localhost',
          port: 3306,
          database: 'monika_database',
          username: 'monika_username',
          password: 'monika_password',
        },
      ],
    }

    // act
    const probeResults = await probeMariaDB(probeParams)

    // assert
    expect(probeResults[0].isAlertTriggered).eq(true)
    sinon.assert.calledOnce(mariaDBRequestStub)
  })
})
