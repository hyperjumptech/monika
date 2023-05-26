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
          status: 0,
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
