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

import type { Config } from '@oclif/core'
import { expect } from '@oclif/test'

import { sanitizeFlags } from '../flag'
import init from '.'

describe('Loader', () => {
  it('should enable auto update', async () => {
    // arrange
    const flags = sanitizeFlags({
      'auto-update': 'minor',
      prometheus: 3000,
      stun: -1,
      symonUrl: 'https://example.com',
      symonKey: '1234',
    })
    const cliConfig = { arch: 'arm64' } as Config

    // assert
    expect(init(flags, cliConfig)).to.eventually.throw()
  })

  it('should enable prometheus', async () => {
    // arrange
    const flags = sanitizeFlags({
      prometheus: 3000,
      stun: -1,
      symonUrl: 'https://example.com',
      symonKey: '1234',
    })
    const cliConfig = {} as Config

    // act
    await init(flags, cliConfig)

    // assert
    const resp = await fetch('http://localhost:3000/metrics')
    expect(resp.status).eq(200)
  })
})
