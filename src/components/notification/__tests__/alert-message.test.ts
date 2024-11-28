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

import { expect } from '@oclif/test'
import { format, subDays } from 'date-fns'
import { resetContext, setContext } from '../../../context/index.js'
import { getMessageForAlert } from '../alert-message.js'
import { probeRequestResult } from '../../../interfaces/request.js'

afterEach(() => {
  resetContext()
})

describe('Alert message', () => {
  describe('Incident', () => {
    it('should return Monika version', async () => {
      // arrange
      setContext({
        userAgent: '@hyperjumptech/monika/1.2.3 linux-x64 node-14.17.0',
      })

      // act
      const alertMessage = await getMessageForAlert({
        probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127ac',
        url: '',
        alert: { id: 'fKBzx', assertion: '', message: '' },
        ipAddress: '',
        isRecovery: false,
        response: {
          data: '',
          body: '',
          status: 404,
          headers: '',
          responseTime: 1000,
          result: probeRequestResult.success,
        },
      })

      // assert
      expect(alertMessage.body).to.include(
        'Version: @hyperjumptech/monika/1.2.3 linux-x64 node-14.17.0'
      )
    })

    it('should return Incident on subject', async () => {
      // arrange
      setContext({
        userAgent: '@hyperjumptech/monika/1.2.3 linux-x64 node-14.17.0',
      })

      // act
      const alertMessage = await getMessageForAlert({
        probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127ac',
        url: '',
        alert: { id: 'fKBzx', assertion: '', message: '' },
        ipAddress: '',
        isRecovery: false,
        response: {
          data: '',
          body: '',
          status: 404,
          headers: '',
          responseTime: 1000,
          result: probeRequestResult.success,
        },
      })

      // assert
      expect(alertMessage.subject).to.equal('New Incident from Monika')
    })
  })

  describe('Recovery', () => {
    it('should return Recovery on subject', async () => {
      // arrange
      setContext({
        userAgent: '@hyperjumptech/monika/1.2.3 linux-x64 node-14.17.0',
        incidents: [
          {
            probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127ac',
            probeRequestURL: '',
            alert: { id: 'Eya6D', assertion: '', message: '' },
            createdAt: new Date(),
          },
        ],
      })

      // act
      const alertMessage = await getMessageForAlert({
        probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127ac',
        url: '',
        alert: { id: 'fKBzx', assertion: '', message: '' },
        ipAddress: '',
        isRecovery: true,
        response: {
          data: '',
          body: '',
          status: 404,
          headers: '',
          responseTime: 1000,
          result: probeRequestResult.success,
        },
      })

      // assert
      expect(alertMessage.subject).to.equal('New Recovery from Monika')
    })

    it('should return incident duration', async () => {
      // arrange
      const incidentDateTime = subDays(new Date(), 3)
      const incidentDuration = '3 days'
      setContext({
        userAgent: '@hyperjumptech/monika/1.2.3 linux-x64 node-14.17.0',
        incidents: [
          {
            probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127aa',
            probeRequestURL: '',
            alert: { id: 'CJaQk', assertion: '', message: '' },
            createdAt: incidentDateTime,
          },
          {
            probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127aa',
            probeRequestURL: 'https://example.com',
            alert: { id: 'CJaQk', assertion: '', message: '' },
            createdAt: incidentDateTime,
          },
          {
            probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127ab',
            probeRequestURL: '',
            alert: { id: 'CJaQk', assertion: '', message: '' },
            createdAt: incidentDateTime,
          },
          {
            probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127ac',
            probeRequestURL: 'https://example.com',
            alert: { id: 'CJaQk', assertion: '', message: '' },
            createdAt: incidentDateTime,
          },
        ],
      })

      // act
      const alertMessage = await getMessageForAlert({
        probeID: 'f76fef86-7331-4bfd-a7e9-f4ba105127aa',
        url: '',
        alert: { id: 'fKBzx', assertion: '', message: '' },
        ipAddress: '',
        isRecovery: true,
        response: {
          data: '',
          body: '',
          status: 404,
          headers: '',
          responseTime: 1000,
          result: probeRequestResult.success,
        },
      })

      // assert
      const humanReadableIncidentDateTime = format(
        incidentDateTime,
        'yyyy-MM-dd HH:mm:ss XXX'
      )

      expect(alertMessage.body).to.include(
        `Target is back to normal after ${incidentDuration}. The incident happened at ${humanReadableIncidentDateTime}`
      )
    })
  })
})
