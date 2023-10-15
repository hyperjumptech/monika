import { test } from '@oclif/test'
import path from 'path'
import chai from 'chai'
import spies from 'chai-spies'
import cmd from '../../src/commands/monika'
import sinon from 'sinon'
import * as IpUtil from '../../src/utils/public-ip'
import { RequestInterceptor } from 'node-request-interceptor'
import withDefaultInterceptors from 'node-request-interceptor/lib/presets/default'

const { resolve } = path
chai.use(spies)

let interceptor: RequestInterceptor

describe.only('Monika should hide ip unless verbose', () => {
  let getPublicIPStub: any
  let getPublicNetworkInfoStub: any

  beforeEach(() => {
    interceptor = new RequestInterceptor(withDefaultInterceptors)

    getPublicIPStub = sinon.stub(IpUtil, 'getPublicIp' as never)

    getPublicNetworkInfoStub = sinon
      .stub(IpUtil, 'getPublicNetworkInfo' as never)
      .callsFake(async () => ({
        country: 'Earth',
        city: 'Gotham',
        hostname: 'localhost',
        isp: 'wayne.net',
        privateIp: '7.6.5.4',
        publicIp: '1.2.3.4',
      }))

    interceptor.use((req) => {
      // mock the call to get isp and city
      if (req.url.origin === 'http://localhost:3000') {
        return {
          status: 200,
          body: JSON.stringify({
            statusCode: 'ok',
            message: 'Successfully handshaked with Symon',
            data: {
              monikaId: '1234',
            },
          }),
        }
      }
    })
  })
  afterEach(() => {
    getPublicIPStub.restore()
    getPublicNetworkInfoStub.restore()
  })

  test
    .stdout()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/simple-1p-1n.yaml')])
    )
    .it('should not call getPublicNetworkInfo()', () => {
      sinon.assert.notCalled(getPublicNetworkInfoStub)
    })

  test
    .stdout()
    .do(() =>
      cmd.run([
        '--config',
        resolve('./test/testConfigs/simple-1p-1n.yaml'),
        '--verbose',
      ])
    )
    .it('should call getPublicNetworkInfo() when --verbose', () => {
      sinon.assert.calledOnce(getPublicNetworkInfoStub)
    })
})
