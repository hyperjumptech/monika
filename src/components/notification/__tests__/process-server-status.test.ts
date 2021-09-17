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
import { ValidatedResponse } from '../../../plugins/validate-response'
import {
  processThresholds,
  resetServerAlertStates,
  ServerAlertStateContext,
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
        hasBeenDownAtLeastOnce: false,
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
    resetServerAlertStates()
  })

  it('should attach threshold calculation to each request', () => {
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

    const validatedResponse = [
      {
        alert: { query: 'response.time > 1000' },
        isAlertTriggered: true,
      },
    ] as ValidatedResponse[]

    // failure happened first for request with index 0
    processThresholds({
      probe,
      requestIndex: 0,
      validatedResponse,
    })

    // processing request with index 1
    const result1 = processThresholds({
      probe,
      requestIndex: 1,
      validatedResponse,
    })

    // failure happened only once for request with index 1, it does not reach threshold yet
    expect(result1[0].state).to.equals('UP')

    const result2 = processThresholds({
      probe,
      requestIndex: 1,
      validatedResponse,
    })

    // second time failure happened for request with index 1, it reaches threshold
    expect(result2[0].state).to.equals('DOWN')
  })
})
