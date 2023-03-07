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
import { assert } from 'chai'
import type { Probe } from '../../interfaces/probe'
import { sortProbes } from './sort'

// arrange
const probes: Probe[] = [
  {
    id: '9t65v',
    name: 'Example',
    interval: 3000,
    requests: [],
    incidentThreshold: 0,
    recoveryThreshold: 0,
    alerts: [],
  },
  {
    id: '5zm60',
    name: 'Example 2',
    interval: 3000,
    requests: [],
    incidentThreshold: 0,
    recoveryThreshold: 0,
    alerts: [],
  },
]

describe('Sort probes', () => {
  describe('Without id flag', () => {
    it('should not change probe order', () => {
      // act
      const sortedProbes = sortProbes(probes)

      // assert
      expect(sortedProbes).deep.eq(probes)
    })
  })

  describe('With id flag', () => {
    it('should throw due to invalid id', () => {
      // assert
      assert.throws(() => sortProbes(probes, 'm91us'))
    })

    it('should order probes by id flag', () => {
      // act
      const sortedProbes = sortProbes(probes, '5zm60,9t65v')

      // assert
      expect(sortedProbes[0]).deep.eq(probes[1])
      expect(sortedProbes[1]).deep.eq(probes[0])
    })

    it('should order probes by id flag (duplicate id)', () => {
      // act
      const sortedProbes = sortProbes(probes, '5zm60,9t65v,5zm60')

      // assert
      expect(sortedProbes[0]).deep.eq(probes[1])
      expect(sortedProbes[1]).deep.eq(probes[0])
      expect(sortedProbes[2]).deep.eq(probes[1])
    })

    it('should order probes by spaced id flag', () => {
      // act
      const sortedProbes = sortProbes(probes, '5zm60, 9t65v')

      // assert
      expect(sortedProbes[0]).deep.eq(probes[1])
      expect(sortedProbes[1]).deep.eq(probes[0])
    })
  })
})
