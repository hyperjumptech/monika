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
  probeRequestResult,
  type ProbeRequestResponse,
} from '../../../interfaces/request'
import type { Probe } from '../../../interfaces/probe'
import { createProber } from '../../../components/probe/prober/factory'
import type { ServerAlertState } from '../../../interfaces/probe-status'
import type { ValidatedResponse } from '../../../plugins/validate-response'
import { serverAlertStateInterpreters } from '../../notification/process-server-status'

describe('validateResponse', () => {
  const mockedAlerts = [
    {
      assertion: 'response.status < 200 or response.status > 299',
      message: '',
    },
    { assertion: 'response.time > 10', message: '' },
  ]

  it('status-not-2xx = true && response-time-greater-than-10-ms = true', () => {
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: { alerts: mockedAlerts } as Probe,
    })
    const res = generateMockedResponse(300, 20, true)
    const data = prober.validateResponse(res)

    expect(data).to.eql([
      {
        alert: {
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
          isProbeResponsive: true,
        },
      },
      {
        alert: {
          assertion: 'response.time > 10',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 20,
          headers: {},
          status: 300,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
      },
    ])
  })

  it('status-not-2xx = false && response-time-greater-than-10-ms = true', () => {
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: { alerts: mockedAlerts } as Probe,
    })
    const res = generateMockedResponse(200, 20, true)
    const data = prober.validateResponse(res)

    expect(data).to.eql([
      {
        alert: {
          assertion: 'response.status < 200 or response.status > 299',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 20,
          headers: {},
          status: 200,
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
          responseTime: 20,
          headers: {},
          status: 200,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
      },
    ])
  })

  it('status-not-2xx = true && response-time-greater-than-10-ms = false', () => {
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: { alerts: mockedAlerts } as Probe,
    })
    const res = generateMockedResponse(300, 10, true)
    const data = prober.validateResponse(res)

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
          status: 300,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
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
          status: 300,
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
    ])
  })

  it('status-not-2xx = false && response-time-greater-than-10-ms = false', () => {
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: { alerts: mockedAlerts } as Probe,
    })
    const res = generateMockedResponse(200, 10, true)
    const data = prober.validateResponse(res)

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
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
    ])
  })

  it('should assert with additional query', () => {
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: { alerts: mockedAlerts } as Probe,
    })
    const res = generateMockedResponse(200, 10, true)
    const data = prober.validateResponse(res, [
      { assertion: 'response.time > 5', message: '' },
    ])

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
          isProbeResponsive: true,
        },
        isAlertTriggered: false,
      },
      {
        alert: {
          assertion: 'response.time > 5',
          message: '',
        },
        response: {
          data: '',
          body: '',
          responseTime: 10,
          headers: {},
          status: 200,
          isProbeResponsive: true,
        },
        isAlertTriggered: true,
      },
    ])
  })
})

describe('processThresholds', () => {
  beforeEach(() => {
    serverAlertStateInterpreters.clear()
  })

  const probe = {
    requests: [
      {
        method: 'GET',
        url: 'https://httpbin.org/status/200',
      },
      {
        method: 'POST',
        url: 'https://httpbin.org/status/201',
      },
    ],
    incidentThreshold: 2,
    recoveryThreshold: 2,
  } as Probe

  const successResponse = [
    {
      alert: { query: 'response.time > 1000' },
      isAlertTriggered: false,
    },
  ] as ValidatedResponse[]
  const failureResponse = [
    {
      alert: { query: 'response.time > 1000' },
      isAlertTriggered: true,
    },
  ] as ValidatedResponse[]

  it('should attach state calculation to each request', () => {
    // arrange
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: probe,
    })
    // failure happened first for request with index 0
    prober.processThresholds({
      requestIndex: 0,
      validatedResponse: failureResponse,
    })

    // processing request with index 1
    const result1 = prober.processThresholds({
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // failure happened only once for request with index 1, it does not reach threshold yet
    expect(result1[0].state).to.equals('UP')

    const result2 = prober.processThresholds({
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // second time failure happened for request with index 1, it reaches threshold
    expect(result2[0].state).to.equals('DOWN')
  })

  it('should compute shouldSendNotification based on threshold and previous state', () => {
    // arrange
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: probe,
    })
    let result!: ServerAlertState[]

    // trigger down state
    for (let i = 0; i < probe.incidentThreshold; i++) {
      result = prober.processThresholds({
        requestIndex: 1,
        validatedResponse: failureResponse,
      })
    }

    expect(result[0].state).to.equals('DOWN')

    // initial state is UP and now it is changed to DOWN, should send notification
    expect(result[0].shouldSendNotification).to.equals(true)

    // send success response once
    result = prober.processThresholds({
      requestIndex: 1,
      validatedResponse: successResponse,
    })

    // send failure response again as much threshold
    for (let i = 0; i < probe.incidentThreshold; i++) {
      result = prober.processThresholds({
        requestIndex: 1,
        validatedResponse: failureResponse,
      })
    }

    expect(result[0].state).to.equals('DOWN')

    // should not send notification again since state does not change
    expect(result[0].shouldSendNotification).to.equals(false)

    // send success response as much threshold
    for (let i = 0; i < probe.recoveryThreshold; i++) {
      result = prober.processThresholds({
        requestIndex: 1,
        validatedResponse: successResponse,
      })
    }

    expect(result[0].state).to.equals('UP')

    // should send notification since state change from DOWN to UP
    expect(result[0].shouldSendNotification).to.equals(true)

    // send failure response once
    result = prober.processThresholds({
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // send success response as much threshold
    for (let i = 0; i < probe.recoveryThreshold; i++) {
      result = prober.processThresholds({
        requestIndex: 1,
        validatedResponse: successResponse,
      })
    }

    expect(result[0].state).to.equals('UP')

    // should not send notification again since state does not change
    expect(result[0].shouldSendNotification).to.equals(false)
  })

  it('should accept socket probe', () => {
    // arrange
    const probe = {
      id: '_uwBu',
      socket: {
        host: 'localhost',
        port: '5432',
      },
    } as unknown as Probe
    const prober = createProber({
      counter: 0,
      notifications: [],
      probeConfig: probe,
    })

    // act
    const result = prober.processThresholds({
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // assert
    expect(result[0].state).eq('UP')
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
