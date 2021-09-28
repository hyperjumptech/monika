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

import { assign, createMachine, interpret, Interpreter } from 'xstate'
import { Probe } from '../../interfaces/probe'
import { ServerAlertState } from '../../interfaces/probe-status'
import { RequestConfig } from '../../interfaces/request'
import { ValidatedResponse } from '../../plugins/validate-response'

export type ServerAlertStateContext = {
  incidentThreshold: number
  recoveryThreshold: number
  consecutiveFailures: number
  consecutiveSuccesses: number
}

const serverAlertStateInterpreters = new Map<
  RequestConfig,
  Record<string, Interpreter<ServerAlertStateContext>>
>()

export const resetServerAlertStates = () => {
  serverAlertStateInterpreters.clear()
}

export const serverAlertStateMachine = createMachine<ServerAlertStateContext>(
  {
    id: 'server-alerts-state',
    initial: 'UP',
    states: {
      UP: {
        on: {
          FAILURE: [
            {
              target: 'DOWN',
              cond: 'incidentThresholdReached',
              actions: 'handleFailure',
            },
            {
              actions: 'handleFailure',
            },
          ],
          SUCCESS: {
            actions: 'handleSuccess',
          },
        },
      },
      DOWN: {
        on: {
          FAILURE: {
            actions: 'handleFailure',
          },
          SUCCESS: [
            {
              target: 'UP',
              cond: 'recoveryThresholdReached',
              actions: 'handleSuccess',
            },
            {
              actions: 'handleSuccess',
            },
          ],
        },
      },
    },
  },
  {
    actions: {
      handleFailure: assign({
        consecutiveFailures: (context) => context.consecutiveFailures + 1,
        consecutiveSuccesses: (_context) => 0,
      }),
      handleSuccess: assign({
        consecutiveFailures: (_context) => 0,
        consecutiveSuccesses: (context) => context.consecutiveSuccesses + 1,
      }),
    },
    guards: {
      incidentThresholdReached: (context) => {
        return context.consecutiveFailures + 1 >= context.incidentThreshold
      },
      recoveryThresholdReached: (context) => {
        return context.consecutiveSuccesses + 1 >= context.recoveryThreshold
      },
    },
  }
)

export const processThresholds = ({
  probe,
  requestIndex,
  validatedResponse,
}: {
  probe: Probe
  requestIndex: number
  validatedResponse: ValidatedResponse[]
}) => {
  const { requests, incidentThreshold, recoveryThreshold } = probe
  const request = requests[requestIndex]

  const results: Array<ServerAlertState> = []

  if (!serverAlertStateInterpreters.has(request)) {
    const interpreters: Record<
      string,
      Interpreter<ServerAlertStateContext>
    > = {}

    validatedResponse
      .map((r) => r.alert)
      .forEach((alert) => {
        const stateMachine = serverAlertStateMachine.withContext({
          incidentThreshold,
          recoveryThreshold,
          consecutiveFailures: 0,
          consecutiveSuccesses: 0,
        })

        interpreters[alert.query] = interpret(stateMachine).start()
      })

    serverAlertStateInterpreters.set(request, interpreters)
  }

  // Send event for successes and failures to state interpreter
  // then get latest state for each alert
  validatedResponse.forEach((validation) => {
    const { alert, isAlertTriggered } = validation

    const interpreter = serverAlertStateInterpreters.get(request)![alert.query]

    const prevStateValue = interpreter.state.value

    interpreter.send(isAlertTriggered ? 'FAILURE' : 'SUCCESS')

    const state = interpreter.state

    results.push({
      alertQuery: alert.query,
      state: state.value as 'UP' | 'DOWN',
      shouldSendNotification:
        (state.value === 'DOWN' && prevStateValue === 'UP') ||
        (state.value === 'UP' && prevStateValue === 'DOWN'),
    })
  })

  return results
}
