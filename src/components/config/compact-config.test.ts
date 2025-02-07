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
import { compactProbes, getDecompactedProbesById } from './compact-config.js'
import type { Probe } from '../../interfaces/probe.js'

describe('Probe Compaction', () => {
  describe('compactProbes', () => {
    it('should return original probes if no identical probes found', () => {
      const probes: Probe[] = [
        {
          id: '1',
          name: 'Test 1',
          interval: 30,
          requests: [
            { url: 'http://test1.com', followRedirects: 5, timeout: 10_000 },
          ],
          alerts: [],
        },
        {
          id: '2',
          name: 'Test 2',
          interval: 60,
          requests: [
            { url: 'http://test2.com', followRedirects: 5, timeout: 10_000 },
          ],
          alerts: [],
        },
      ]

      const result = compactProbes(probes)
      expect(result).to.deep.equal(probes)
    })

    it('should merge identical HTTP probes', () => {
      const probes: Probe[] = [
        {
          id: '1',
          name: 'Test 2',
          alerts: [],
          interval: 30,
          requests: [
            {
              url: 'http://test.com',
              followRedirects: 5,
              timeout: 10_000,
              alerts: [
                {
                  id: 'alert1',
                  assertion: 'response_time < 200',
                  message: 'Response too slow',
                },
              ],
            },
          ],
        },
        {
          id: '2',
          name: 'Test 2',
          alerts: [],
          interval: 30,
          requests: [
            {
              url: 'http://test.com',
              followRedirects: 5,
              timeout: 10_000,
              alerts: [
                {
                  id: 'alert2',
                  assertion: 'response_time < 200',
                  message: 'Response too slow',
                },
              ],
            },
          ],
        },
      ]

      const result = compactProbes(probes)
      expect(result).to.have.lengthOf(1)
      expect(result[0].requests?.[0].alerts).to.have.lengthOf(1)
    })

    it('should merge identical socket probes', () => {
      const probes: Probe[] = [
        {
          id: '1',
          interval: 30,
          name: 'Test 1',
          alerts: [],
          socket: {
            host: 'test.com',
            port: 80,
            data: 'test',
            alerts: [
              {
                id: 'alert1',
                assertion: 'response_time < 200',
                message: 'Response too slow',
              },
            ],
          },
        },
        {
          id: '2',
          interval: 30,
          name: 'Test 2',
          alerts: [],
          socket: {
            host: 'test.com',
            port: 80,
            data: 'test',
            alerts: [
              {
                id: 'alert2',
                assertion: 'response_time < 200',
                message: 'Response too slow',
              },
            ],
          },
        },
      ]

      const result = compactProbes(probes)
      expect(result).to.have.lengthOf(1)
      expect(result[0].socket?.alerts).to.have.lengthOf(1)
    })

    it('should not merge probes with multiple probe types', () => {
      const probes: Probe[] = [
        {
          id: '1',
          interval: 30,
          name: 'Test 1',
          alerts: [],
          requests: [
            { url: 'http://test.com', followRedirects: 5, timeout: 10_000 },
          ],
          socket: {
            host: 'test.com',
            port: 80,
            data: 'test',
            alerts: [
              {
                id: 'alert1',
                assertion: 'response_time < 200',
                message: 'Response too slow',
              },
            ],
          },
        },
        {
          id: '2',
          interval: 30,
          name: 'Test 2',
          alerts: [],
          requests: [
            { url: 'http://test.com', followRedirects: 5, timeout: 10_000 },
          ],
          socket: { host: 'test.com', port: 80, data: 'test' },
        },
      ]

      const result = compactProbes(probes)
      expect(result).to.deep.equal(probes)
    })

    it('should not merge probes with request chaining', () => {
      const probes: Probe[] = [
        {
          id: '1',
          interval: 30,
          name: 'Test 1',
          alerts: [],
          requests: [
            { url: 'http://test1.com', followRedirects: 5, timeout: 10_000 },
            { url: 'http://test2.com', followRedirects: 5, timeout: 10_000 },
          ],
        },
        {
          id: '2',
          interval: 30,
          name: 'Test 2',
          alerts: [],
          requests: [
            { url: 'http://test1.com', followRedirects: 5, timeout: 10_000 },
            { url: 'http://test2.com', followRedirects: 5, timeout: 10_000 },
          ],
        },
      ]

      const result = compactProbes(probes)
      expect(result).to.deep.equal(probes)
    })
  })

  describe('getDecompactedProbesById', () => {
    it('should return original probe by id', () => {
      const probes: Probe[] = [
        {
          id: '1',
          name: 'Test 1',
          interval: 30,
          alerts: [],
          requests: [
            {
              url: 'http://test.com',
              followRedirects: 5,
              timeout: 10_000,
            },
          ],
        },
      ]

      compactProbes(probes) // Sets decompactedProbes
      const result = getDecompactedProbesById('1')
      expect(result).to.deep.equal(probes[0])
    })

    it('should return undefined for non-existent probe id', () => {
      const probes: Probe[] = []
      compactProbes(probes)
      const result = getDecompactedProbesById('nonexistent')
      expect(result).to.be.undefined
    })

    it('should deduplicate identical alerts when merging probes', () => {
      const probes: Probe[] = [
        {
          id: '1',
          name: 'Test 1',
          interval: 30,
          alerts: [],
          requests: [
            {
              url: 'http://test.com',
              followRedirects: 5,
              timeout: 10_000,
              alerts: [
                {
                  id: 'alert1',
                  assertion: 'response_time < 200',
                  message: 'Response too slow',
                },
                {
                  id: 'alert2',
                  assertion: 'response_time < 200',
                  message: 'Response too slow',
                },
              ],
            },
          ],
        },
      ]

      const result = compactProbes(probes)
      expect(result[0].requests?.[0].alerts).to.have.lengthOf(1)
      expect(result[0].requests?.[0].alerts?.[0]).to.deep.equal({
        id: 'alert1',
        assertion: 'response_time < 200',
        message: 'Response too slow',
      })
    })

    it('should deduplicate alerts across multiple probes', () => {
      const probes: Probe[] = [
        {
          id: '1',
          name: 'Test 1',
          interval: 30,
          alerts: [],
          socket: {
            host: 'test.com',
            port: 80,
            data: 'test',
            alerts: [
              {
                id: 'alert1',
                assertion: 'response_time < 200',
                message: 'Response too slow',
              },
            ],
          },
        },
        {
          id: '2',
          name: 'Test 2',
          interval: 30,
          alerts: [],
          socket: {
            host: 'test.com',
            port: 80,
            data: 'test',
            alerts: [
              {
                id: 'alert2',
                assertion: 'response_time < 200',
                message: 'Response too slow',
              },
            ],
          },
        },
        {
          id: '3',
          name: 'Test 3',
          interval: 30,
          alerts: [],
          socket: {
            host: 'test.com',
            port: 80,
            data: 'test',
            alerts: [
              {
                id: 'alert1',
                assertion: 'response_time < 200',
                message: 'Response too slow',
              },
            ],
          },
        },
      ]

      const result = compactProbes(probes)
      expect(result).to.have.lengthOf(1)
      expect(result[0].socket?.alerts).to.have.lengthOf(1)
    })
  })
})
