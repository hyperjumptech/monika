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
import {
  getDowntimeDuration,
  addIncident,
  removeIncident,
  getIncidents,
} from '.'

describe('Downtime counter', () => {
  it('should start counter', () => {
    // arrange
    const probeConfig = {
      alert: { id: 'PHbCL', assertion: '', message: '' },
      probeID: 'APDpe',
      url: 'https://example.com',
    }

    // act
    addIncident(probeConfig)

    // assert
    expect(getDowntimeDuration(probeConfig)).not.eq('0 seconds')
  })

  it('should stop counter', () => {
    // arrange
    const probeConfig = {
      alert: { id: 'VyYwG', assertion: '', message: '' },
      probeID: 'P1n9x',
      url: 'https://example.com',
    }

    // act
    addIncident(probeConfig)
    removeIncident(probeConfig)

    // assert
    expect(getDowntimeDuration(probeConfig)).eq('0 seconds')
  })

  it('should stop inexistent counter', () => {
    // arrange
    const probeConfig = {
      alert: { id: 'knUA4', assertion: '', message: '' },
      probeID: 'P1n9x',
      url: 'https://example.com',
    }

    // act
    removeIncident(probeConfig)

    // assert
    expect(getDowntimeDuration(probeConfig)).eq('0 seconds')
  })

  it('should return 0 seconds if not started yet', () => {
    // arrange
    const probeConfig = {
      alert: { id: '9c92j', assertion: '', message: '' },
      probeID: 'rwrs8',
      url: 'https://example.com',
    }

    // assert
    expect(getDowntimeDuration(probeConfig)).eq('0 seconds')
  })

  it('allow identical urls but different probeID', () => {
    // arrange
    const probeConfig = {
      alert: { id: 'VyYwG', assertion: '', message: '' },
      probeID: 'Pn9x',
      url: 'https://example.com',
    }
    const probeConfig2 = {
      alert: { id: 'VyYwG', assertion: '', message: '' },
      probeID: 'Pn9x-2',
      url: 'https://example.com',
    }

    // act
    addIncident(probeConfig)
    addIncident(probeConfig2)
    removeIncident(probeConfig)

    // assert
    expect(getIncidents()[0].probeID).eq(probeConfig2.probeID)
  })

  it('allow identical probe-ids but different urls', () => {
    // arrange
    const probeConfig = {
      alert: { id: 'VyYwG', assertion: '', message: '' },
      probeID: 'Pn9x',
      url: 'https://example.com',
    }
    const probeConfig2 = {
      alert: { id: 'VyYwG', assertion: '', message: '' },
      probeID: 'Pn9x',
      url: 'https://sub.example.com',
    }

    // act
    addIncident(probeConfig)
    addIncident(probeConfig2)
    removeIncident(probeConfig)

    // assert
    expect(getIncidents()[0].probeRequestURL).eq(probeConfig2.url)
  })
})
