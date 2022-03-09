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
import { interpret, Interpreter } from 'xstate'
import { Probe } from '../../../interfaces/probe'
import { ServerAlertState } from '../../../interfaces/probe-status'
import { ValidatedResponse } from '../../../plugins/validate-response'
import {
  getNotificationState,
  processThresholds,
  ServerAlertStateContext,
  serverAlertStateInterpreters,
  serverAlertStateMachine,
} from '../process-server-status'

describe('serverAlertStateMachine', () => {
  let interpreter: Interpreter<ServerAlertStateContext>

  beforeEach(() => {
    interpreter = interpret(
      serverAlertStateMachine.withContext({
        incidentThreshold: 5,
        recoveryThreshold: 5,
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        isFirstTimeSendEvent: true,
      })
    ).start()
  })

  it('should init with UP state', () => {
    expect(interpreter.state.value).to.equals('UP')
  })

  it('should change to DOWN state when consecutive failures reaches threshold', () => {
    interpreter.send(['FAILURE', 'FAILURE', 'FAILURE', 'FAILURE', 'FAILURE'])
    expect(interpreter.state.value).to.equals('DOWN')
  })

  it('should not change to DOWN state when consecutive failures do not reach threshold', () => {
    interpreter.send(['FAILURE', 'FAILURE', 'FAILURE'])
    expect(interpreter.state.value).to.equals('UP')
  })

  it('should not change to DOWN state when failures happened as much threshold or more but not consecutively', () => {
    interpreter.send([
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'SUCCESS',
      'FAILURE',
      'FAILURE',
    ])
    expect(interpreter.state.value).to.equals('UP')
  })

  it('should recover from DOWN state when consecutive successes reaches threshold', () => {
    interpreter.send([
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
    ])
    expect(interpreter.state.value).to.equals('UP')
  })

  it('should not recover from DOWN state when consecutive successes do not reach threshold', () => {
    interpreter.send([
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'SUCCESS',
      'SUCCESS',
    ])
    expect(interpreter.state.value).to.equals('DOWN')
  })

  it('should not recover from DOWN state when successes happened as much threshold or more but not consecutively', () => {
    interpreter.send([
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'FAILURE',
      'SUCCESS',
      'SUCCESS',
      'SUCCESS',
      'FAILURE',
      'SUCCESS',
      'SUCCESS',
    ])
    expect(interpreter.state.value).to.equals('DOWN')
  })
})

describe('processThresholds', () => {
  beforeEach(() => {
    serverAlertStateInterpreters.clear()
  })

  const probe = {
    requests: [
      {
        id: '1',
        method: 'GET',
        url: 'https://httpbin.org/status/200',
      },
      {
        id: '2',
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
    // failure happened first for request with index 0
    processThresholds({
      probe,
      requestIndex: 0,
      validatedResponse: failureResponse,
    })

    // processing request with index 1
    const result1 = processThresholds({
      probe,
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // failure happened only once for request with index 1, it does not reach threshold yet
    expect(result1[0].state).to.equals('UP')

    const result2 = processThresholds({
      probe,
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // second time failure happened for request with index 1, it reaches threshold
    expect(result2[0].state).to.equals('DOWN')
  })

  it('should compute shouldSendNotification based on threshold and previous state', () => {
    let result!: ServerAlertState[]

    // trigger down state
    for (let i = 0; i < probe.incidentThreshold; i++) {
      result = processThresholds({
        probe,
        requestIndex: 1,
        validatedResponse: failureResponse,
      })
    }

    expect(result[0].state).to.equals('DOWN')

    // initial state is UP and now it is changed to DOWN, should send notification
    expect(result[0].shouldSendNotification).to.equals(true)

    // send success response once
    result = processThresholds({
      probe,
      requestIndex: 1,
      validatedResponse: successResponse,
    })

    // send failure response again as much threshold
    for (let i = 0; i < probe.incidentThreshold; i++) {
      result = processThresholds({
        probe,
        requestIndex: 1,
        validatedResponse: failureResponse,
      })
    }

    expect(result[0].state).to.equals('DOWN')

    // should not send notification again since state does not change
    expect(result[0].shouldSendNotification).to.equals(false)

    // send success response as much threshold
    for (let i = 0; i < probe.recoveryThreshold; i++) {
      result = processThresholds({
        probe,
        requestIndex: 1,
        validatedResponse: successResponse,
      })
    }

    expect(result[0].state).to.equals('UP')

    // should send notification since state change from DOWN to UP
    expect(result[0].shouldSendNotification).to.equals(true)

    // send failure response once
    result = processThresholds({
      probe,
      requestIndex: 1,
      validatedResponse: failureResponse,
    })

    // send success response as much threshold
    for (let i = 0; i < probe.recoveryThreshold; i++) {
      result = processThresholds({
        probe,
        requestIndex: 1,
        validatedResponse: successResponse,
      })
    }

    expect(result[0].state).to.equals('UP')

    // should not send notification again since state does not change
    expect(result[0].shouldSendNotification).to.equals(false)
  })
})

describe('Send notification based on threshold', () => {
  const probe = {
    requests: [
      {
        id: '1',
        method: 'GET',
        url: 'https://httpbin.org/status/200',
      },
      {
        id: '2',
        method: 'POST',
        url: 'https://httpbin.org/status/201',
      },
    ],
    incidentThreshold: 2,
    recoveryThreshold: 2,
  } as Probe

  describe('not send notification', () => {
    it('the incident does not cross the threshold', () => {
      const probe3 = {
        requests: [
          {
            id: '1',
            method: 'GET',
            url: 'https://httpbin.org/status/200',
          },
          {
            id: '2',
            method: 'POST',
            url: 'https://httpbin.org/status/201',
          },
        ],
        incidentThreshold: 3,
        recoveryThreshold: 3,
      } as Probe

      // act
      getNotificationState({
        probe: probe3,
        alertQuery: 'response.size < 0',
        isAlertTriggered: true,
        requestIndex: 0,
      })

      const { state, shouldSendNotification } = getNotificationState({
        probe,
        alertQuery: 'response.size < 0',
        isAlertTriggered: true,
        requestIndex: 0,
      })

      // assert
      expect(state).eq('UP')
      expect(shouldSendNotification).eq(false)
    })

    it('the recovery does not cross the threshold', () => {
      // act
      getNotificationState({
        probe,
        alertQuery: 'response.size < 1',
        isAlertTriggered: true,
        requestIndex: 0,
      })
      getNotificationState({
        probe,
        alertQuery: 'response.size < 1',
        isAlertTriggered: true,
        requestIndex: 0,
      })
      const { state, shouldSendNotification } = getNotificationState({
        probe,
        alertQuery: 'response.size < 1',
        isAlertTriggered: false,
        requestIndex: 0,
      })

      // assert
      expect(state).eq('DOWN')
      expect(shouldSendNotification).eq(false)
    })
  })

  describe('send notification', () => {
    it('the incident cross the threshold', () => {
      // act
      const { shouldSendNotification } = getNotificationState({
        probe,
        alertQuery: 'response.size < 2',
        isAlertTriggered: true,
        requestIndex: 0,
      })

      // assert
      expect(shouldSendNotification).eq(true)
    })

    it('the recovery cross the threshold', () => {
      // act
      getNotificationState({
        probe,
        alertQuery: 'response.size < 3',
        isAlertTriggered: true,
        requestIndex: 0,
      })
      getNotificationState({
        probe,
        alertQuery: 'response.size < 3',
        isAlertTriggered: true,
        requestIndex: 0,
      })
      getNotificationState({
        probe,
        alertQuery: 'response.size < 3',
        isAlertTriggered: false,
        requestIndex: 0,
      })
      const { state, shouldSendNotification } = getNotificationState({
        probe,
        alertQuery: 'response.size < 3',
        isAlertTriggered: false,
        requestIndex: 0,
      })

      // assert
      expect(state).eq('UP')
      expect(shouldSendNotification).eq(true)
    })
  })
})
