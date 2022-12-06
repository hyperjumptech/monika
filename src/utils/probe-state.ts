import { assign, createMachine, EventObject, interpret } from 'xstate'

import { Probe } from '../interfaces/probe'

type ProbeStateValue = any

type ProbeStateContext = {
  cycle: number
  lastStart: Date
  lastFinish: Date
} & EventObject

const probeStateMachine = createMachine<ProbeStateValue, ProbeStateContext>(
  {
    id: 'probe-state',
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
    const createdAt = probe.lastEvent?.createdAt
      ? new Date(probe.lastEvent.createdAt)
      : new Date()

    const recoveredAt = probe.lastEvent?.recoveredAt
      ? new Date(probe.lastEvent.recoveredAt)
      : new Date()

    const interpreter = interpret(
      probeStateMachine.withContext({
        cycle: 0,
        lastStart: createdAt,
        lastFinish: probe.lastEvent?.recoveredAt ? recoveredAt : createdAt,
      })
    ).start()

    probeInterpreters.set(probe.id, interpreter)
  }
}

export function setProbeRunning(probeId: string): void {
  const interpreter = probeInterpreters.get(probeId)
  interpreter.send('RUN')
}

export function setProbeFinish(probeId: string): void {
  const interpreter = probeInterpreters.get(probeId)
  interpreter.send('FINISH')
}

export function getProbeState(probeId: string): ProbeStateValue {
  const interpreter = probeInterpreters.get(probeId)
  return interpreter.state.value
}

export function getProbeContext(probeId: string): ProbeStateContext {
  const interpreter = probeInterpreters.get(probeId)
  return interpreter.state.context
}
