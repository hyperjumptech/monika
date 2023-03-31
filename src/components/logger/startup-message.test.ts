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

import chai, { expect } from 'chai'
import spies from 'chai-spies'
import type { Config } from '../../interfaces/config'
import { log } from '../../utils/pino'
import { logStartupMessage } from './startup-message'

chai.use(spies)

const defaultConfig: Config = {
  probes: [
    {
      id: 'uYJaw',
      name: 'Acme Inc.',
      interval: 3000,
      requests: [
        { url: 'https://example.com', headers: {}, body: '', timeout: 0 },
      ],
      incidentThreshold: 1,
      recoveryThreshold: 1,
      alerts: [],
    },
  ],
  notifications: [{ id: 'UVIsL', type: 'desktop', data: undefined }],
}

describe('Startup message', () => {
  // arrange
  let logMessage = ''
  let consoleLogMessage = ''

  beforeEach(() => {
    chai.spy.on(log, 'info', (message: string) => {
      logMessage = message
    })
    chai.spy.on(console, 'log', (message: string) => {
      consoleLogMessage = message
    })
  })

  afterEach(() => {
    chai.spy.restore()
    logMessage = ''
    consoleLogMessage = ''
  })

  describe('Symon mode', () => {
    it('should show running in Symon mode', () => {
      // act
      logStartupMessage({
        config: { probes: [] },
        configFlag: [],
        isFirstRun: false,
        isSymonMode: true,
        isVerbose: false,
      })

      // assert
      expect(logMessage).eq('Running in Symon mode')
    })
  })

  describe('Monika mode', () => {
    describe('Notification message', () => {
      it('should show has no notification warning', () => {
        // arrange
        logStartupMessage({
          config: { probes: [] },
          configFlag: [],
          isFirstRun: false,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(consoleLogMessage).include('Notifications has not been set')
      })
    })

    describe('Starting or Restarting', () => {
      it('should show starting', () => {
        // arrange
        logStartupMessage({
          config: defaultConfig,
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(consoleLogMessage).include('Starting')
      })

      it('should show restarting', () => {
        // arrange
        logStartupMessage({
          config: defaultConfig,
          configFlag: [],
          isFirstRun: false,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(consoleLogMessage).include('Restarting')
      })

      it('should show probe and notification total', () => {
        // arrange
        logStartupMessage({
          config: defaultConfig,
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(consoleLogMessage).include('Probes: 1')
        expect(consoleLogMessage).include('Notifications: 1')
      })

      it('should show empty notification total', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(consoleLogMessage).include('Notifications: 0')
      })
    })
  })

  describe('Verbose', () => {
    describe('Probe detail', () => {
      it('should show probe detail', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            probes: [
              {
                ...defaultConfig.probes[0],
                description: "Acme's company profile",
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('uYJaw')
        expect(consoleLogMessage).include('Acme')
        expect(consoleLogMessage).include("Acme's company profile")
        expect(consoleLogMessage).include('-')
        expect(consoleLogMessage).include('3000')
      })

      it('should show probe detail without description', () => {
        // arrange
        logStartupMessage({
          config: {
            probes: [
              {
                id: 'uYJaw',
                name: 'Acme Inc.',
                interval: 3000,
                requests: [],
                incidentThreshold: 1,
                recoveryThreshold: 1,
                alerts: [],
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('uYJaw')
        expect(consoleLogMessage).include('Acme Inc.')
        expect(consoleLogMessage).include('-')
        expect(consoleLogMessage).include('3000')
      })
    })

    describe('Probe request detail', () => {
      it('should show probe request detail with default method', () => {
        // arrange
        logStartupMessage({
          config: defaultConfig,
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('GET')
        expect(consoleLogMessage).include('https://example.com')
      })

      it('should show probe detail', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            probes: [
              ...defaultConfig.probes,
              {
                id: 'N3Omh',
                name: 'Example',
                interval: 3000,
                requests: [
                  {
                    method: 'POST',
                    url: 'https://example.com',
                    headers: {},
                    body: '',
                    timeout: 0,
                  },
                ],
                incidentThreshold: 1,
                recoveryThreshold: 1,
                alerts: [],
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('POST')
        expect(consoleLogMessage).include('https://example.com')
      })
    })

    describe('Alert detail', () => {
      it('should show default alert', () => {
        // arrange
        logStartupMessage({
          config: defaultConfig,
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include(
          'response.status < 200 or response.status > 299'
        )
      })

      it('should show alert detail', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            probes: [
              {
                ...defaultConfig.probes[0],
                alerts: [
                  {
                    assertion: 'response.status = 500',
                    message: 'HTTP status is 500',
                  },
                ],
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include(
          '[{"assertion":"response.status = 500","message":"HTTP status is 500"}]'
        )
      })
    })

    describe('Notification detail', () => {
      it('should show notification id and type', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [{ id: 'UVIsL', type: 'desktop', data: undefined }],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('Notifications')
        expect(consoleLogMessage).include('UVIsL')
        expect(consoleLogMessage).include('desktop')
      })

      it('should show notification detail for SMTP', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [
              {
                id: '97AnH',
                type: 'smtp',
                data: {
                  hostname: 'example.com',
                  port: 25,
                  username: 'name@example.com',
                  password: '',
                  recipients: ['john@example.com', 'jane@example.com'],
                },
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('john@example.com, jane@example.com')
        expect(consoleLogMessage).include('example.com')
        expect(consoleLogMessage).include('25')
        expect(consoleLogMessage).include('name@example.com')
      })

      it('should show notification detail with domain', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [
              {
                id: 'N3Omh',
                type: 'mailgun',
                data: {
                  recipients: ['john@example.com'],
                  domain: 'https://example.com',
                  apiKey: '',
                },
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('https://example.com')
      })

      it('should show notification detail with url', () => {
        // arrange
        logStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [
              {
                id: 'SxUhV',
                type: 'webhook',
                data: {
                  url: 'https://example.com',
                },
              },
            ],
          },
          configFlag: [],
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })
        // assert
        expect(consoleLogMessage).include('https://example.com')
      })
    })
  })

  describe('Config file', () => {
    it('should show remote config message', () => {
      // act
      logStartupMessage({
        config: defaultConfig,
        configFlag: ['https://example.com/monika.yaml'],
        isFirstRun: false,
        isSymonMode: false,
        isVerbose: false,
      })

      // assert
      expect(logMessage).include('remote config')
    })

    it('should show file config message', () => {
      // act
      logStartupMessage({
        config: defaultConfig,
        configFlag: ['./monika.yaml'],
        isFirstRun: false,
        isSymonMode: false,
        isVerbose: false,
      })

      // assert
      expect(logMessage).include('config file')
    })
  })
})
