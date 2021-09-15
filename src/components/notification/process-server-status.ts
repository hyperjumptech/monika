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
import { log } from '../../utils/pino'

type ServerAlertStateContext = {
  incidentThreshold: number
  recoveryThreshold: number
  consecutiveIncident: number
  consecutiveRecovery: number
  hasBeenDownAtLeastOnce: boolean
}

const serverAlertStateInterpreters = new Map<
  RequestConfig,
  Record<string, Interpreter<ServerAlertStateContext>>
>()

export const resetServerAlertStates = () => {
  serverAlertStateInterpreters.clear()
}

const serverAlertStateMachine = createMachine<ServerAlertStateContext>(
  {
    id: 'server-alerts-state',
    initial: 'UP',
    states: {
      UP: {
        on: {
          INCIDENT: [
            {
              target: 'DOWN',
              cond: 'reachIncidentThreshold',
              actions: 'handleIncident',
            },
            {
              actions: 'handleIncident',
            },
          ],
          RECOVERY: {
            actions: 'handleRecovery',
          },
        },
      },
      DOWN: {
        entry: 'handleDownState',
        on: {
          INCIDENT: {
            actions: 'handleIncident',
          },
          RECOVERY: [
            {
              target: 'UP',
              cond: 'reachRecoveryThreshold',
              actions: 'handleRecovery',
            },
            {
              actions: 'handleRecovery',
            },
          ],
        },
      },
    },
  },
  {
    actions: {
      handleIncident: assign({
        consecutiveIncident: (context) => context.consecutiveIncident + 1,
        consecutiveRecovery: (_context) => 0,
      }),
      handleRecovery: assign({
        consecutiveIncident: (_context) => 0,
        consecutiveRecovery: (context) => context.consecutiveRecovery + 1,
      }),
      handleDownState: assign({
        hasBeenDownAtLeastOnce: (_context) => true,
      }),
    },
    guards: {
      reachIncidentThreshold: (context) => {
        return context.consecutiveIncident + 1 >= context.incidentThreshold
      },
      reachRecoveryThreshold: (context) => {
        return context.consecutiveRecovery + 1 >= context.recoveryThreshold
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

  try {
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
            consecutiveIncident: 0,
            consecutiveRecovery: 0,
            hasBeenDownAtLeastOnce: false,
          })

          interpreters[alert.query] = interpret(stateMachine).start()
        })

      serverAlertStateInterpreters.set(request, interpreters)
    }

    // Send event for successes and failures to state interpreter
    // then get latest state for each alert
    validatedResponse.forEach((validation) => {
      const { alert, isAlertTriggered } = validation

      const interpreter = serverAlertStateInterpreters.get(request)![
        alert.query
      ]

      interpreter.send(isAlertTriggered ? 'INCIDENT' : 'RECOVERY')

      const state = interpreter.state

      results.push({
        alertQuery: alert.query,
        isDown: state.value === 'DOWN',
        shouldSendNotification:
          (state.value === 'DOWN' &&
            state.context.consecutiveIncident === incidentThreshold) ||
          (state.value === 'UP' &&
            state.context.consecutiveRecovery === recoveryThreshold &&
            state.context.hasBeenDownAtLeastOnce),
      })
    })

    return results
  } catch (error) {
    log.error(error.message)
    return []
  }
}
