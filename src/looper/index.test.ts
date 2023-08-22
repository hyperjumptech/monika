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
import { DEFAULT_THRESHOLD, sanitizeProbe } from '.'
import type { Probe } from '../interfaces/probe'

describe('Looper', () => {
  describe('sanitizeProbe', () => {
    it('should change probe alert query to alert assertion', () => {
      // arrange
      const probe = {
        id: 'Example',
        alerts: [{ query: 'response.status < 200' }],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result.alerts[0].assertion).eq(probe.alerts[0].query)
    })

    it('should set default request method', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [{ url: 'https://example.com' }],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result?.requests?.[0].method).eq('GET')
    })

    it('should change request alert query to alert assertion', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          { method: 'GET', alerts: [{ query: 'response.status < 200' }] },
          { alerts: [{ query: 'response.status < 200' }] },
        ],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result?.requests?.[0]?.alerts?.[0].assertion).eq(
        probe?.requests?.[0].alerts?.[0].query
      )
      expect(result?.requests?.[1]?.alerts?.[0].assertion).eq(
        probe?.requests?.[1].alerts?.[0].query
      )
    })

    it('should add probe name', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          { method: 'GET', alerts: [{ query: 'response.status < 200' }] },
        ],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result.name).eq('monika_Example')
    })

    it('should set default incidentThreshold', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          { method: 'GET', alerts: [{ query: 'response.status < 200' }] },
        ],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result.incidentThreshold).eq(DEFAULT_THRESHOLD)
    })

    it('should set default recoveryThreshold', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          { method: 'GET', alerts: [{ query: 'response.status < 200' }] },
        ],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result.recoveryThreshold).eq(DEFAULT_THRESHOLD)
    })

    it('should set default alerts for HTTP probe', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          { method: 'GET', alerts: [{ query: 'response.status < 200' }] },
        ],
      } as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result.alerts).deep.eq([
        {
          assertion: 'response.status < 200 or response.status > 299',
          message: 'HTTP Status is {{ response.status }}, expecting 200',
        },
        {
          assertion: 'response.time > 2000',
          message:
            'Response time is {{ response.time }}ms, expecting less than 2000ms',
        },
      ])
    })

    it('should set default alerts for non HTTP probe', () => {
      // arrange
      const probe = {
        id: 'Example',
      } as unknown as Probe

      // act
      const result = sanitizeProbe(false, probe)

      // assert
      expect(result.alerts).deep.eq([
        {
          assertion: 'response.status < 200 or response.status > 299',
          message: 'Probe is not accesible',
        },
      ])
    })

    it('should remove alerts on Symon mode', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [{}],
      } as Probe

      // act
      const result = sanitizeProbe(true, probe)

      // assert
      expect(result.alerts).deep.eq([])
    })
  })
})
