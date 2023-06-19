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

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { doProbe, getProbeStatesWithValidAlert } from '.'
import type { ServerAlertState } from '../../interfaces/probe-status'
import { initializeProbeStates } from '../../utils/probe-state'
import type { Probe } from '../../interfaces/probe'
import { afterEach, beforeEach } from 'mocha'
import { getContext, resetContext, setContext } from '../../context'

let urlRequestTotal = 0
const server = setupServer(
  rest.get('https://example.com', (_, res, ctx) => {
    urlRequestTotal += 1
    return res(ctx.status(200))
  })
)
const probes: Probe[] = [
  {
    id: '1',
    name: 'Example',
    interval: 1,
    requests: [
      {
        url: 'https://example.com',
        body: '',
        timeout: 30,
      },
    ],
    incidentThreshold: 1,
    recoveryThreshold: 1,
    alerts: [],
  },
]

beforeEach(() => server.listen())
afterEach(() => {
  urlRequestTotal = 0
  server.close()
})

describe('Probe processing', () => {
  describe('getProbeStatesWithValidAlert function', () => {
    const probeStates: ServerAlertState[] = [
      {
        isFirstTime: false,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: false,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: false,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'UP',
        shouldSendNotification: false,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'UP',
        shouldSendNotification: true,
      },
      {
        isFirstTime: true,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: true,
      },
      {
        isFirstTime: false,
        alertQuery: '',
        state: 'DOWN',
        shouldSendNotification: true,
      },
    ]

    it('should return probe states with valid alert', () => {
      // arrange
      const expected: ServerAlertState[] = [
        {
          isFirstTime: true,
          alertQuery: '',
          state: 'DOWN',
          shouldSendNotification: true,
        },
        {
          isFirstTime: false,
          alertQuery: '',
          state: 'DOWN',
          shouldSendNotification: true,
        },
      ]

      // act
      const probeStatesWithValidAlert =
        getProbeStatesWithValidAlert(probeStates)

      // assert
      expect(probeStatesWithValidAlert).deep.eq(expected)
    })
  })

  describe('HTTP Probe', () => {
    it('should not run probe if the probe is running', async () => {
      // arrange
      initializeProbeStates(probes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      doProbe({ probe: probes[0], notifications: [] })
      await doProbe({ probe: probes[0], notifications: [] })
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      expect(urlRequestTotal).eq(1)
    })

    it('should not run probe if it is not the time', () => {
      // arrange
      initializeProbeStates(probes)

      // act
      doProbe({ probe: probes[0], notifications: [] })

      // assert
      expect(urlRequestTotal).eq(0)
    })

    it('should not run probe if the cycle is end', async () => {
      // arrange
      initializeProbeStates(probes)
      setContext({
        ...getContext(),
        flags: { ...getContext().flags, repeat: 1 },
      })
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await doProbe({ probe: probes[0], notifications: [] })
      await doProbe({ probe: probes[0], notifications: [] })
      await doProbe({ probe: probes[0], notifications: [] })
      // wait for random timeout
      await sleep(3 * seconds)

      resetContext()

      // assert
      expect(urlRequestTotal).eq(1)
    })

    it('should run the probe', async () => {
      // arrange
      const uniqueProbes: Probe[] = Array.from({ length: 5 }).map(
        (_, index) => ({
          ...probes[0],
          id: `${index}`,
        })
      )
      initializeProbeStates(uniqueProbes)
      // wait until the interval passed
      const seconds = 1000
      await sleep(seconds)

      // act
      await Promise.all(
        uniqueProbes.map((probe) => doProbe({ probe, notifications: [] }))
      )
      // wait for random timeout
      await sleep(3 * seconds)

      // assert
      expect(urlRequestTotal).eq(5)
    })
  })
})

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })
}
