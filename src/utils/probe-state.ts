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

import { assign, createMachine, type EventObject, interpret } from 'xstate'

import type { Probe } from '../interfaces/probe'

type ProbeStateValue = any

type ProbeStateContext = {
  cycle: number
  lastStart: Date
  lastFinish: Date
} & EventObject

const probeStateMachine = createMachine<ProbeStateValue, ProbeStateContext>(
  {
    id: 'probe-state',
    predictableActionArguments: true,
    initial: 'idle',
    states: {
      idle: {
        on: {
          RUN: {
            target: 'running',
            actions: 'incrementCycle',
          },
        },
      },
      running: {
        on: {
          FINISH: {
            target: 'idle',
            actions: 'setLastFinish',
          },
        },
      },
    },
  },
  {
    actions: {
      incrementCycle: assign({
        cycle: (context) => (context as ProbeStateContext).cycle + 1,
        lastStart: () => new Date(),
      }),
      setLastFinish: assign({
        lastFinish: () => new Date(),
      }),
    },
  }
)

const probeInterpreters = new Map()

export function initializeProbeStates(probes: Probe[]): void {
  probeInterpreters.clear()

  for (const probe of probes) {
    syncProbeStateFrom(probe)
  }
}

export function syncProbeStateFrom(probe: Probe, cycle: number = 0) {
  const getLastStart = (probe: Probe) =>
    probe.lastEvent?.createdAt
      ? new Date(probe.lastEvent.createdAt)
      : new Date()

  const getLastFinish = (probe: Probe) =>
    probe.lastEvent?.recoveredAt
      ? new Date(probe.lastEvent.recoveredAt)
      : getLastStart(probe)

  const interpreter = interpret(
    probeStateMachine.withContext({
      cycle,
      lastStart: getLastStart(probe),
      lastFinish: getLastFinish(probe),
    })
  ).start()

  probeInterpreters.set(probe.id, interpreter)
}

export function removeProbeState(probeId: string) {
  probeInterpreters.delete(probeId)
}

export function setProbeRunning(probeId: string): string {
  const interpreter = probeInterpreters.get(probeId)

  if (!interpreter) {
    return ''
  }

  interpreter.send('RUN')

  return probeId
}

export function setProbeFinish(probeId: string): void {
  const interpreter = probeInterpreters.get(probeId)
  interpreter?.send('FINISH')
}

export function getProbeState(probeId: string): 'idle' | 'running' | undefined {
  const interpreter = probeInterpreters.get(probeId)
  return interpreter?.state?.value
}

export function getProbeContext(
  probeId: string
): ProbeStateContext | undefined {
  const interpreter = probeInterpreters.get(probeId)
  return interpreter?.state?.context
}
