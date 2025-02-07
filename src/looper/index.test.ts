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

import type { MonikaFlags } from '../flag.js'
import type { Probe } from '../interfaces/probe.js'

import { resetContext, setContext } from '../context/index.js'
import { sanitizeProbe } from './index.js'

describe('Sanitize probe', () => {
  it('should remove alerts on Symon mode', () => {
    // arrange
    setContext({
      flags: {
        symonKey: 'secret-key',
        symonUrl: 'https://example.com',
      } as MonikaFlags,
    })
    const probe = {
      id: 'Example',
      requests: [{}],
      alerts: [
        { assertion: 'response.time > 30000', message: 'Run out of bandwidth' },
      ],
    } as Probe

    // act
    const result = sanitizeProbe(true, probe)
    resetContext()

    // assert
    expect(result.alerts).deep.eq([])
  })
})
