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

import { assign, createMachine, Interpreter } from 'xstate'

export type ServerAlertStateContext = {
  incidentThreshold: number
  recoveryThreshold: number
  consecutiveFailures: number
  consecutiveSuccesses: number
  isFirstTimeSendEvent: boolean
}

export const serverAlertStateInterpreters = new Map<
  string,
  Record<string, Interpreter<ServerAlertStateContext>>
>()

export const serverAlertStateMachine = createMachine<ServerAlertStateContext>(
  {
    id: 'server-alerts-state',
    predictableActionArguments: true,
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
