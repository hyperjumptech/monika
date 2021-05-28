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

import chai, { expect } from 'chai'
import spies from 'chai-spies'

import { Config } from '../src/interfaces/config'
import { Probe } from '../src/interfaces/probe'
import { isIDValid, sanitizeProbe } from '../src/looper'

chai.use(spies)

describe('--ids flag validation', () => {
  const probe1: Probe = {
    id: '1',
    name: 'probe 1',
    requests: [],
    incidentThreshold: 1,
    recoveryThreshold: 1,
    alerts: [],
  }
  const probe2: Probe = {
    id: '2',
    name: 'probe 2',
    requests: [],
    incidentThreshold: 1,
    recoveryThreshold: 1,
    alerts: [],
  }

  const config: Config = {
    probes: [probe1, probe2],
  }
  it('it should return true when all id is found', () => {
    const input = '1, 2, 1'

    const result = isIDValid(config, input)
    expect(result).is.true
  })

  it('it should return false when id not found', () => {
    const input = '1,3,1'

    const result = isIDValid(config, input)
    expect(result).is.false
  })
})

describe('sanitized probe', () => {
  const DEFAULT_THRESHOLD = 5

  const probe1: Probe = {
    id: 'test',
    name: '',
    requests: [],
    incidentThreshold: 0,
    recoveryThreshold: 0,
    alerts: [],
  }

  it('it should default probe object', () => {
    const sanitizedProbe = sanitizeProbe(probe1, probe1.id)

    expect(sanitizedProbe.name).to.equal('monika_test')
    expect(sanitizedProbe.incidentThreshold).to.equal(DEFAULT_THRESHOLD)
    expect(sanitizedProbe.recoveryThreshold).to.equal(DEFAULT_THRESHOLD)
    expect(sanitizedProbe.alerts).to.have.lengthOf(2)
  })
})
