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
import type { Probe } from '../../../interfaces/probe'
import {
  probeRequestResult,
  type ProbeRequestResponse,
} from '../../../interfaces/request'
import { PrometheusCollector } from './collector'

type ProbeResult = {
  probe: Probe
  requestIndex: number
  response: ProbeRequestResponse
}

describe('Prometheus collector', () => {
  describe('Collect probe request metrics', () => {
    it('should not throw', () => {
      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() => prometheusCollector.collectProbeTotal(10)).not.to.throw()
    })
  })

  describe('Collect probe request metrics', () => {
    it('should not throw', () => {
      // arrange
      const probeResult: ProbeResult = {
        probe: {
          id: '',
          name: '',
          interval: 0,
          requests: [
            {
              url: '',
              body: '',
              timeout: 0,
            },
          ],
          incidentThreshold: 0,
          recoveryThreshold: 0,
          alerts: [
            {
              id: 'fKBzx',
              assertion: '',
              message: '',
            },
          ],
        },
        requestIndex: 0,
        response: {
          data: '',
          body: '',
          status: 0,
          headers: '',
          responseTime: 0,
          result: probeRequestResult.failed,
          isProbeResponsive: false,
        },
      }

      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() =>
        prometheusCollector.collectProbeRequestMetrics(probeResult)
      ).not.to.throw()
    })

    it('should not throw with empty request', () => {
      // arrange
      const probeResult: ProbeResult = {
        probe: {
          id: '',
          name: '',
          interval: 0,
          requests: [],
          incidentThreshold: 0,
          recoveryThreshold: 0,
          alerts: [{ id: 'fKBzx', assertion: '', message: '' }],
        },
        requestIndex: 0,
        response: {
          data: '',
          body: '',
          status: 0,
          headers: '',
          responseTime: 0,
          result: probeRequestResult.failed,
          isProbeResponsive: false,
        },
      }

      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() =>
        prometheusCollector.collectProbeRequestMetrics(probeResult)
      ).not.to.throw()
    })

    it('should not throw with undefined request', () => {
      // arrange
      const probeResult = {
        probe: {
          id: '',
          name: '',
          interval: 0,
          incidentThreshold: 0,
          recoveryThreshold: 0,
          alerts: [
            {
              assertion: '',
            },
          ],
        },
        requestIndex: 0,
        response: {
          data: '',
          body: '',
          status: 0,
          headers: '',
          responseTime: 0,
          isProbeResponsive: false,
        },
      } as ProbeResult

      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() =>
        prometheusCollector.collectProbeRequestMetrics(probeResult)
      ).not.to.throw()
    })
  })

  describe('Collect triggered allert metrics', () => {
    it('should not throw', () => {
      // arrange
      const probeResult: Omit<ProbeResult, 'response'> & {
        alertQuery: string
      } = {
        probe: {
          id: '',
          name: '',
          interval: 0,
          requests: [
            {
              url: '',
              body: '',
              timeout: 0,
            },
          ],
          incidentThreshold: 0,
          recoveryThreshold: 0,
          alerts: [{ id: 'fKBzx', assertion: '', message: '' }],
        },
        requestIndex: 0,
        alertQuery: '',
      }

      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() =>
        prometheusCollector.collectTriggeredAlert(probeResult)
      ).not.to.throw()
    })

    it('should not throw with empty request', () => {
      // arrange
      const probeResult: Omit<ProbeResult, 'response'> & {
        alertQuery: string
      } = {
        probe: {
          id: '',
          name: '',
          interval: 0,
          requests: [],
          incidentThreshold: 0,
          recoveryThreshold: 0,
          alerts: [{ id: 'fKBzx', assertion: '', message: '' }],
        },
        requestIndex: 0,
        alertQuery: '',
      }

      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() =>
        prometheusCollector.collectTriggeredAlert(probeResult)
      ).not.to.throw()
    })

    it('should not throw with undefined request', () => {
      // arrange
      const probeResult = {
        probe: {
          id: '',
          name: '',
          interval: 0,
          incidentThreshold: 0,
          recoveryThreshold: 0,
          alerts: [
            {
              assertion: '',
            },
          ],
        },
        requestIndex: 0,
        alertQuery: '',
      } as Omit<ProbeResult, 'response'> & {
        alertQuery: string
      }

      // act
      const prometheusCollector = new PrometheusCollector()

      // assert
      expect(() =>
        prometheusCollector.collectTriggeredAlert(probeResult)
      ).not.to.throw()
    })
  })
})
