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

import type { Probe } from '../../interfaces/probe'

import {
  addProbe,
  deleteProbe,
  findProbe,
  getProbes,
  setProbes,
  updateProbe,
} from './probe'

const probe: Probe = {
  alerts: [],
  id: 'xVUcW',
  interval: 10,
  name: 'Sample Probe',
}

describe('Probe cache', () => {
  beforeEach(() => {
    for (const { id } of getProbes()) {
      deleteProbe(id)
    }
  })
  it('should add a probe', () => {
    // act
    addProbe(probe)

    // assert
    expect(findProbe(probe.id)).eq(probe)
  })

  it('should update a probe', () => {
    // arrange
    addProbe(probe)
    const updatedName = 'Updated Probe'

    // act
    const isUpdated = updateProbe(probe.id, { ...probe, name: updatedName })

    // assert
    expect(isUpdated).eq(true)
    expect(findProbe(probe.id)?.name).eq(updatedName)
  })

  it('should not update a nonexistent probe', () => {
    // arrange
    const updatedName = 'Updated Probe'

    // act
    const isUpdated = updateProbe('9WpFB', { ...probe, name: updatedName })

    // assert
    expect(isUpdated).eq(false)
    expect(findProbe('9WpFB')).undefined
  })

  it('should get all probes', () => {
    // arrange
    addProbe(probe)

    // act
    const probes = getProbes()

    // assert
    expect(probes.length).eq(1)
  })

  it('should not remove a nonexistent probe', () => {
    // arrange
    addProbe(probe)

    // act
    const isDeleted = deleteProbe('9WpFB')

    // assert
    expect(isDeleted).eq(false)
    expect(getProbes().length).eq(1)
  })

  it('should remove a probe', () => {
    // arrange
    addProbe(probe)

    // act
    const isDeleted = deleteProbe(probe.id)

    // assert
    expect(isDeleted).eq(true)
    expect(getProbes().length).eq(0)
  })

  it('should set probes', () => {
    // arrange
    addProbe(probe)
    expect(getProbes().length).eq(1)

    // act
    setProbes([probe])

    // assert
    expect(getProbes().length).eq(1)
  })
})
