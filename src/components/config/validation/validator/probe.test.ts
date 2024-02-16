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

import type { Probe } from '../../../../interfaces/probe.js'

import { FAILED_REQUEST_ASSERTION } from '../../../../looper/index.js'
import { validateProbes } from './probe.js'
import { resetContext, setContext } from '../../../../context/index.js'
import type { MonikaFlags } from '../../../../flag.js'

describe('Probe validation', () => {
  describe('Probe sanitization', () => {
    it('should set default request method', async () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [{ url: 'https://example.com' }],
      } as Probe

      // act
      const validatedProbes = await validateProbes([probe])

      // assert
      expect(validatedProbes[0].requests?.[0].method).eq('GET')
    })

    it('should set default alerts for HTTP probe.js', async () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          {
            alerts: [{ query: 'response.status < 200' }],
            method: 'GET',
            url: 'https://example.com',
          },
        ],
      } as Probe

      // act
      const validatedProbes = await validateProbes([probe])

      // assert
      expect(validatedProbes[0].alerts[0].assertion).eq(
        'response.status < 200 or response.status > 299'
      )
      expect(validatedProbes[0].alerts[0].message).eq(
        'HTTP Status is {{ response.status }}, expecting 2xx'
      )
      expect(validatedProbes[0].alerts[1].assertion).eq('response.time > 2000')
      expect(validatedProbes[0].alerts[1].message).eq(
        'Response time is {{ response.time }}ms, expecting less than 2000ms'
      )
    })

    it('should change probe alert query to alert assertion', async () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [{ url: 'https://example.com' }],
        alerts: [{ query: 'response.status < 200' }],
      } as Probe

      // act
      const validatedProbes = await validateProbes([probe])

      // assert
      expect(validatedProbes[0].alerts[0].assertion).eq(probe.alerts[0].query)
    })

    it('should change request alert query to alert assertion', async () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          {
            alerts: [{ query: 'response.status < 200' }],
            method: 'GET',
            url: 'https://example.com',
          },
          {
            alerts: [{ query: 'response.status < 200' }],
            url: 'https://example.com',
          },
        ],
      } as Probe

      // act
      const validatedProbes = await validateProbes([probe])

      // assert
      expect(validatedProbes[0].requests?.[0]?.alerts?.[0].assertion).eq(
        probe?.requests?.[0].alerts?.[0].query
      )
      expect(validatedProbes[0].requests?.[1]?.alerts?.[0].assertion).eq(
        probe?.requests?.[1].alerts?.[0].query
      )
    })

    it('should add probe name', async () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [
          {
            method: 'GET',
            alerts: [{ query: 'response.status < 200' }],
            url: 'https://example.com',
          },
        ],
      } as Probe

      // act
      const validatedProbes = await validateProbes([probe])

      // assert
      expect(validatedProbes[0].name).eq('monika_Example')
    })

    it('should set default alerts for non HTTP probe.js', async () => {
      // arrange
      const probe = {
        id: 'Example',
        redis: [
          {
            uri: 'redis://localhost:6379',
          },
        ],
      } as unknown as Probe

      // act
      const result = await validateProbes([probe])

      // assert
      expect(result[0].alerts[0].assertion).eq('')
      expect(result[0].alerts[0].message).eq(FAILED_REQUEST_ASSERTION.message)
    })

    it('should throws an error if alert assertion is invalid', () => {
      // arrange
      const probe = {
        id: 'Example',
        requests: [{ url: 'https://example.com' }],
        alerts: [{ assertion: 'response.time > 1000 ms' }],
      } as unknown as Probe

      // act & assert
      expect(validateProbes([probe])).to.eventually.throw()
    })

    it('should set the alerts empty if the probe if alert assertion is invalid in Symon mode', async () => {
      // arrange
      setContext({
        flags: {
          symonKey: 'bDF8j',
          symonUrl: 'https://example.com',
        } as MonikaFlags,
      })
      const probes = [
        {
          id: 'Example',
          requests: [{ url: 'https://example.com' }],
          alerts: [{ assertion: 'response.time > 1000 ms' }],
        },
        {
          id: 'Example 2',
          requests: [{ url: 'https://example.com' }],
          alerts: [{ assertion: 'response.time > 1000' }],
        },
        {
          id: 'Example 3',
          requests: [{ url: 'https://example.com' }],
          alerts: [{ assertion: 'response.status == 200' }],
        },
      ] as unknown as Probe[]

      // act
      const validatedProbes = await validateProbes(probes)

      // assert
      expect(
        validatedProbes.find(({ id }) => id === 'Example')?.alerts
      ).deep.eq([''])
      expect(
        validatedProbes.find(({ id }) => id === 'Example 2')?.alerts
      ).deep.eq([{ assertion: 'response.time > 1000' }])
      expect(
        validatedProbes.find(({ id }) => id === 'Example 3')?.alerts
      ).deep.eq([{ assertion: 'response.status == 200' }])

      resetContext()
    })
  })
})
