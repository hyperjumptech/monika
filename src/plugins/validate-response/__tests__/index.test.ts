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
import validateResponse from '..'
import {
  type ProbeRequestResponse,
  probeRequestResult,
} from '../../../interfaces/request'

describe('validateResponse', () => {
  const mockedAlerts = [
    {
      id: 'jFQBd',
      assertion: 'response.status < 200 or response.status > 299',
      message: '',
    },
    { id: 'dxNM8', assertion: 'response.time > 10', message: '' },
  ]

  it('status-not-2xx = true && response-time-greater-than-10-ms = true', () => {
    const res = generateMockedResponse(300, 20, true)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: {
          id: 'jFQBd',
          assertion: 'response.status < 200 or response.status > 299',
          message: '',
        },
        isAlertTriggered: true,
        response: {
          data: '',
          body: '',
          responseTime: 20,
          headers: {},
          status: 300,
          result: 1,
          isProbeResponsive: true,
        },
      },
      {
        alert: { id: 'dxNM8', assertion: 'response.time > 10', message: '' },
        response: {
          data: '',
          body: '',
          responseTime: 20,
          headers: {},
          status: 300,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
      },
    ])
  })

  it('status-not-2xx = false && response-time-greater-than-10-ms = true', () => {
    const res = generateMockedResponse(200, 20, true)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: {
          id: 'jFQBd',
          assertion: 'response.status < 200 or response.status > 299',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 20,
          headers: {},
          status: 200,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
      {
        alert: { id: 'dxNM8', assertion: 'response.time > 10', message: '' },
        response: {
          data: '',
          body: '',
          responseTime: 20,
          headers: {},
          status: 200,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
      },
    ])
  })

  it('status-not-2xx = true && response-time-greater-than-10-ms = false', () => {
    const res = generateMockedResponse(300, 10, true)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: {
          id: 'jFQBd',
          assertion: 'response.status < 200 or response.status > 299',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 10,
          headers: {},
          status: 300,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
      },
      {
        alert: { id: 'dxNM8', assertion: 'response.time > 10', message: '' },
        response: {
          data: '',
          body: '',
          responseTime: 10,
          headers: {},
          status: 300,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
    ])
  })

  it('status-not-2xx = false && response-time-greater-than-10-ms = false', () => {
    const res = generateMockedResponse(200, 10, true)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: {
          assertion: 'response.status < 200 or response.status > 299',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 10,
          headers: {},
          status: 200,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
      {
        alert: {
          assertion: 'response.time > 10',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 10,
          headers: {},
          status: 200,
          result: 1,
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
    ])
  })
})

function generateMockedResponse(
  status: number,
  responseTime: number,
  isProbeResponsive: boolean
): ProbeRequestResponse {
  return {
    data: '',
    body: '',
    status,
    responseTime,
    headers: {},
    result: isProbeResponsive
      ? probeRequestResult.success
      : probeRequestResult.failed,
    isProbeResponsive,
  }
}
