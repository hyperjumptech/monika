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
import { getProbeStatesWithValidAlert } from '.'
import type { ServerAlertState } from '../../interfaces/probe-status'

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

    it('should return probe states with valid alert for Symon mode', () => {
      // arrange
      const isSymonMode = true
      const expected: ServerAlertState[] = [
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

      // act
      const probeStatesWithValidAlert = getProbeStatesWithValidAlert(
        probeStates,
        isSymonMode
      )

      // assert
      expect(probeStatesWithValidAlert).deep.eq(expected)
    })

    it('should return probe states with valid alert for non Symon mode', () => {
      // arrange
      const isSymonMode = false
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
      const probeStatesWithValidAlert = getProbeStatesWithValidAlert(
        probeStates,
        isSymonMode
      )

      // assert
      expect(probeStatesWithValidAlert).deep.eq(expected)
    })
  })
})
