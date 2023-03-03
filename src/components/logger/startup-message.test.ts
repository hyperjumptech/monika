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
import type { Config } from '../../interfaces/config'
import type { MailgunData, SMTPData, WebhookData } from '../../interfaces/data'
import { generateStartupMessage } from './startup-message'

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
  describe('Symon mode', () => {
    it('should show running in Symon mode', () => {
      // act
      const message = generateStartupMessage({
        config: { probes: [] },
        isFirstRun: false,
        isSymonMode: true,
        isVerbose: false,
      })

      // assert
      expect(message).eq('Running in Symon mode')
    })
  })

  describe('Monika mode', () => {
    describe('Notification message', () => {
      it('should show has no notification warning', () => {
        // arrange
        const message = generateStartupMessage({
          config: { probes: [] },
          isFirstRun: false,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(message).include('Notifications has not been set')
      })
    })

    describe('Starting or Restarting', () => {
      it('should show starting', () => {
        // arrange
        const message = generateStartupMessage({
          config: defaultConfig,
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(message).include('Starting')
      })

      it('should show restarting', () => {
        // arrange
        const message = generateStartupMessage({
          config: defaultConfig,
          isFirstRun: false,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(message).include('Restarting')
      })

      it('should show probe and notification total', () => {
        // arrange
        const message = generateStartupMessage({
          config: defaultConfig,
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(message).include('Probes: 1')
        expect(message).include('Notifications: 1')
      })

      it('should show empty notification total', () => {
        // arrange
        const message = generateStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [],
          },
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: false,
        })

        // assert
        expect(message).include('Notifications: 0')
      })
    })
  })

  describe('Verbose', () => {
    describe('Probe detail', () => {
      it('should show probe detail', () => {
        // arrange
        const message = generateStartupMessage({
          config: {
            ...defaultConfig,
            probes: [
              {
                ...defaultConfig.probes[0],
                description: "Acme's company profile",
              },
            ],
          },
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('uYJaw')
        expect(message).include('Acme')
        expect(message).include("Acme's company profile")
        expect(message).include('-')
        expect(message).include('3000')
      })

      it('should show probe detail without description', () => {
        // arrange
        const message = generateStartupMessage({
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
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('uYJaw')
        expect(message).include('Acme Inc.')
        expect(message).include('-')
        expect(message).include('3000')
      })
    })

    describe('Probe request detail', () => {
      it('should show probe request detail with default method', () => {
        // arrange
        const message = generateStartupMessage({
          config: defaultConfig,
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('GET')
        expect(message).include('https://example.com')
      })

      it('should show probe detail', () => {
        // arrange
        const message = generateStartupMessage({
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
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('POST')
        expect(message).include('https://example.com')
      })
    })

    describe('Alert detail', () => {
      it('should show default alert', () => {
        // arrange
        const message = generateStartupMessage({
          config: defaultConfig,
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include(
          'response.status < 200 or response.status > 299'
        )
      })

      it('should show alert detail', () => {
        // arrange
        const message = generateStartupMessage({
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
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include(
          '[{"assertion":"response.status = 500","message":"HTTP status is 500"}]'
        )
      })
    })

    describe('Notification detail', () => {
      it('should show notification id and type', () => {
        // arrange
        const message = generateStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [{ id: 'UVIsL', type: 'desktop', data: undefined }],
          },
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('Notifications')
        expect(message).include('UVIsL')
        expect(message).include('desktop')
      })

      it('should show notification detail for SMTP', () => {
        // arrange
        const message = generateStartupMessage({
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
                  recipients: ['john@example.com', 'jane@example.com'],
                } as SMTPData,
              },
            ],
          },
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('john@example.com, jane@example.com')
        expect(message).include('example.com')
        expect(message).include('25')
        expect(message).include('name@example.com')
      })

      it('should show notification detail with domain', () => {
        // arrange
        const message = generateStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [
              {
                id: 'N3Omh',
                type: 'mailgun',
                data: {
                  recipients: ['john@example.com'],
                  domain: 'https://example.com',
                } as MailgunData,
              },
            ],
          },
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('https://example.com')
      })

      it('should show notification detail with url', () => {
        // arrange
        const message = generateStartupMessage({
          config: {
            ...defaultConfig,
            notifications: [
              {
                id: 'SxUhV',
                type: 'webhook',
                data: {
                  url: 'https://example.com',
                } as WebhookData,
              },
            ],
          },
          isFirstRun: true,
          isSymonMode: false,
          isVerbose: true,
        })

        // assert
        expect(message).include('https://example.com')
      })
    })
  })
})
