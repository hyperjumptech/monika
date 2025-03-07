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

import { getContext, setContext } from '../../context/index.js'
import type { Probe } from '../../interfaces/probe.js'
import { validateProbes } from './validation/index.js'

describe('Configuration validation', () => {
  it('should use default follow redirect from flag', async () => {
    // arrange
    const probes: Probe[] = [
      {
        id: 'hrf6g',
        requests: [
          {
            body: '',
            url: 'https://example.com',
            timeout: 1000,
          },
        ],
      } as Probe,
    ]
    // act
    const validatedProbes = await validateProbes(probes)

    // assert
    expect(validatedProbes[0].requests![0].followRedirects).eq(21)
  })

  it('should use follow redirect from flag', async () => {
    // arrange
    setContext({ flags: { ...getContext().flags, 'follow-redirects': 0 } })
    const probes: Probe[] = [
      {
        id: 'hrf6g',
        requests: [
          {
            body: '',
            url: 'https://example.com',
            timeout: 1000,
          },
        ],
      } as Probe,
    ]
    // act
    const validatedProbes = await validateProbes(probes)

    // assert
    expect(validatedProbes[0].requests![0].followRedirects).eq(0)
  })

  it('should use follow redirect from config', async () => {
    // arrange
    setContext({ flags: { ...getContext().flags, 'follow-redirects': 0 } })
    const probes: Probe[] = [
      {
        id: 'hrf6g',
        requests: [
          {
            body: '',
            followRedirects: 1,
            url: 'https://example.com',
            timeout: 1000,
          },
        ],
      } as Probe,
    ]
    // act
    const validatedProbes = await validateProbes(probes)

    // assert
    expect(validatedProbes[0].requests![0].followRedirects).eq(1)
  })
})
