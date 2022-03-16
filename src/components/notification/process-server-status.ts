/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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
import { ValidatedResponse } from '../../plugins/validate-response'

export type ServerAlertStateContext = {
  incidentThreshold: number
  recoveryThreshold: number
  consecutiveFailures: number
  consecutiveSuccesses: number
  isFirstTimeSendEvent: boolean
}

type ShouldSendNotification = {
  probe: Probe
  alertQuery: string
  isAlertTriggered: boolean
  requestIndex: number
}

type ShouldSendNotificationReturn = {
  isFirstTime: boolean
  state: 'UP' | 'DOWN'
  shouldSendNotification: boolean
}

export const serverAlertStateInterpreters = new Map<
  string,
  Record<string, Interpreter<ServerAlertStateContext>>
>()

export const serverAlertStateMachine = createMachine<ServerAlertStateContext>(
  {
    id: 'server-alerts-state',
    initial: 'UP',
    states: {
      UP: {
        on: {
          FIST_TIME_EVENT_SENT: {
            actions: 'handleFirstTimeEventSent',
          },
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
          FIST_TIME_EVENT_SENT: {
            actions: 'handleFirstTimeEventSent',
          },
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
      handleFirstTimeEventSent: assign({
        isFirstTimeSendEvent: (_context) => false,
      }),
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

  const id = `${probe?.id}-${request?.id}-${request.url}`

  const results: Array<ServerAlertState> = []

  if (!serverAlertStateInterpreters.has(id!)) {
    const interpreters: Record<
      string,
      Interpreter<ServerAlertStateContext>
    > = {}

    for (const alert of validatedResponse.map((r) => r.alert)) {
      const stateMachine = serverAlertStateMachine.withContext({
        incidentThreshold,
        recoveryThreshold,
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        isFirstTimeSendEvent: true,
      })

      interpreters[alert.query] = interpret(stateMachine).start()
    }

    serverAlertStateInterpreters.set(id!, interpreters)
  }

  // Send event for successes and failures to state interpreter
  // then get latest state for each alert
  for (const validation of validatedResponse) {
    const { alert, isAlertTriggered } = validation
    const interpreter = serverAlertStateInterpreters.get(id!)![alert.query]

    const prevStateValue = interpreter.state.value

    interpreter.send(isAlertTriggered ? 'FAILURE' : 'SUCCESS')

    const stateValue = interpreter.state.value
    const stateContext = interpreter.state.context

    results.push({
      isFirstTime: stateContext.isFirstTimeSendEvent,
      alertQuery: alert.query,
      state: stateValue as 'UP' | 'DOWN',
      shouldSendNotification:
        stateContext.isFirstTimeSendEvent ||
        (stateValue === 'DOWN' && prevStateValue === 'UP') ||
        (stateValue === 'UP' && prevStateValue === 'DOWN'),
    })

    interpreter.send('FIST_TIME_EVENT_SENT')
  }

  return results
}

export function getNotificationState({
  probe,
  alertQuery,
  isAlertTriggered,
  requestIndex,
}: ShouldSendNotification): ShouldSendNotificationReturn {
  const { incidentThreshold, recoveryThreshold } = probe
  let id = ''

  if (probe?.socket) {
    id = `tcp-${probe?.id}-${probe?.socket.toString()}` // generate unique id for each socket
  } else {
    id = `http-${probe?.id}-${probe?.requests[requestIndex]?.url}` // generate id for http requests
  }

  if (!serverAlertStateInterpreters.has(id)) {
    const interpreters: Record<
      string,
      Interpreter<ServerAlertStateContext>
    > = {}
    const stateMachine = serverAlertStateMachine.withContext({
      incidentThreshold,
      recoveryThreshold,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      isFirstTimeSendEvent: true,
    })

    interpreters[alertQuery] = interpret(stateMachine).start()

    serverAlertStateInterpreters.set(id!, interpreters)
  }

  const interpreter = serverAlertStateInterpreters.get(id!)![alertQuery]
  const prevStateValue = interpreter?.state?.value

  interpreter?.send(isAlertTriggered ? 'FAILURE' : 'SUCCESS')

  const currentStateValue = interpreter?.state?.value
  const stateContext = interpreter?.state?.context

  interpreter.send('FIST_TIME_EVENT_SENT')

  return {
    isFirstTime: stateContext.isFirstTimeSendEvent,
    state: currentStateValue as 'UP' | 'DOWN',
    shouldSendNotification:
      stateContext.isFirstTimeSendEvent ||
      (currentStateValue === 'DOWN' &&
        (prevStateValue === 'UP' || !prevStateValue)) ||
      (currentStateValue === 'UP' && prevStateValue === 'DOWN'),
  }
}
