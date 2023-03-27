import { expect } from 'chai'
import sinon from 'sinon'
import { probeSocket } from '.'
import { ProbeRequestResponse } from '../../../../interfaces/request'
import * as request from './request'

let tcpRequestStub: sinon.SinonStub

describe('TCP Prober', () => {
  beforeEach(() => {
    tcpRequestStub = sinon
      .stub(request, 'tcpRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'tcp',
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
    tcpRequestStub = sinon
      .stub(request, 'tcpRequest')
      .callsFake(async (_options): Promise<ProbeRequestResponse> => {
        return {
          requestType: 'tcp',
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
