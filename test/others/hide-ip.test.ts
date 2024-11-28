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

import { test } from '@oclif/test'
import { resolve } from 'node:path'
import sinon from 'sinon'
import cmd from '../../src/commands/monika.js'
import * as IpUtil from '../../src/utils/public-ip.js'

describe('Monika should hide ip unless verbose', () => {
  let getPublicIPStub: sinon.SinonStub
  let fetchAndCacheNetworkInfoStub: sinon.SinonStub

  beforeEach(() => {
    getPublicIPStub = sinon.stub(IpUtil, 'getPublicIp' as never)
    fetchAndCacheNetworkInfoStub = sinon
      .stub(IpUtil, 'fetchAndCacheNetworkInfo' as never)
      .callsFake(async () => ({
        country: 'Earth',
        city: 'Gotham',
        hostname: 'localhost',
        isp: 'wayne.net',
        privateIp: '7.6.5.4',
        publicIp: '1.2.3.4',
      }))
  })

  afterEach(() => {
    getPublicIPStub.restore()
    fetchAndCacheNetworkInfoStub.restore()
  })

  test
    .stdout()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/simple-1p-1n.yaml')])
    )
    .it('should not call fetchAndCacheNetworkInfo()', () => {
      sinon.assert.notCalled(fetchAndCacheNetworkInfoStub)
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
    .it('should call fetchAndCacheNetworkInfo() when --verbose', () => {
      sinon.assert.calledOnce(fetchAndCacheNetworkInfoStub)
    })
})
