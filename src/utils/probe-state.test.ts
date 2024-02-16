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

import { expect } from 'chai'
import type { Probe } from '../interfaces/probe.js'
import {
  getProbeContext,
  getProbeState,
  initializeProbeStates,
  setProbeFinish,
  setProbeRunning,
} from './probe-state.js'
import sinon from 'sinon'

describe('probe-state', () => {
  const timeNow = new Date()
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers(timeNow.getTime())
  })

  afterEach(() => {
    clock.restore()
  })

  describe('Initial probe.js', () => {
    it('should set initial state', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)

      // assert
      expect(getProbeState('1')).eq('idle')
      expect(getProbeContext('1')).deep.eq({
        cycle: 0,
        lastStart: timeNow,
        lastFinish: timeNow,
      })
    })

    it('should set initial state with predefined lastStart', () => {
      // arrange
      const lastEventCreatedAt = new Date()
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
          lastEvent: {
            createdAt: lastEventCreatedAt,
          },
        },
      ]

      // act
      initializeProbeStates(probes)

      // assert
      const probeState = getProbeState('1')
      const probeCtx = getProbeContext('1')
      expect(probeState).eq('idle')
      expect(probeCtx).deep.eq({
        cycle: 0,
        lastStart: lastEventCreatedAt,
        lastFinish: timeNow,
      })
    })

    it('should set initial state with predefined lastFinish', () => {
      // arrange
      const lastEventCreatedAt = new Date()
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
          lastEvent: {
            recoveredAt: lastEventCreatedAt,
          },
        },
      ]

      // act
      initializeProbeStates(probes)

      // assert
      expect(getProbeState('1')).eq('idle')
      expect(getProbeContext('1')).deep.eq({
        cycle: 0,
        lastStart: timeNow,
        lastFinish: lastEventCreatedAt,
      })
    })

    it('should set initial state with predefined lastFinish and lastStart', () => {
      // arrange
      const lastEventCreatedAt = new Date()
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
          lastEvent: {
            createdAt: lastEventCreatedAt,
            recoveredAt: lastEventCreatedAt,
          },
        },
      ]

      // act
      initializeProbeStates(probes)

      // assert
      expect(getProbeState('1')).eq('idle')
      expect(getProbeContext('1')).deep.eq({
        cycle: 0,
        lastStart: lastEventCreatedAt,
        lastFinish: lastEventCreatedAt,
      })
    })
  })

  describe('Change state', () => {
    it('should set change to running', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')

      // assert
      expect(getProbeState('1')).eq('running')
    })

    it('should set change to idle', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')
      setProbeFinish('1')

      // assert
      expect(getProbeState('1')).eq('idle')
    })

    it('should not change the state', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeFinish('1')

      // assert
      expect(getProbeState('1')).eq('idle')
    })

    it('should update the cycle', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')

      // assert
      expect(getProbeContext('1')?.cycle).eq(1)
    })

    it('should update the cycle only once', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')
      setProbeRunning('1')

      // assert
      expect(getProbeContext('1')?.cycle).eq(1)
    })

    it('should update the cycle on transition from idle to run', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')
      setProbeFinish('1')
      setProbeRunning('1')

      // assert
      expect(getProbeContext('1')?.cycle).eq(2)
    })

    it('should update last start on transition from idle to running', () => {
      // arrange
      clock.restore()
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')

      // assert
      expect(getProbeContext('1')?.lastStart).not.undefined
      expect(getProbeContext('1')?.lastStart).not.eq(timeNow)
    })

    it('should update last finish on transition from running to idle', () => {
      // arrange
      clock.restore()
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('1')
      setProbeFinish('1')

      // assert
      expect(getProbeContext('1')?.lastFinish).not.undefined
      expect(getProbeContext('1')?.lastFinish).not.eq(timeNow)
    })

    it('should ignore not found probeId', () => {
      // arrange
      const probes: Probe[] = [
        {
          alerts: [],
          id: '1',
          interval: 1,
          name: 'Example',
          requests: [{ url: 'https://example.com', body: '', timeout: 2 }],
        },
      ]

      // act
      initializeProbeStates(probes)
      setProbeRunning('2')
      setProbeFinish('2')

      // assert
      const probeState = getProbeState('2')
      expect(probeState).to.be.undefined

      const probeCtx = getProbeContext('2')
      expect(probeCtx).to.be.undefined
    })
  })
})
