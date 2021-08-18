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
import validateResponse from '..'
import { AxiosResponseWithExtraData } from '../../../interfaces/request'

describe('validateResponse', () => {
  const mockedAlerts = [
    { query: 'status-not-2xx', subject: '', message: '' },
    { query: 'response-time-greater-than-10-ms', subject: '', message: '' },
  ]

  const generateMockedResponse = (status: number, responseTime: number) => {
    return {
      status,
      config: {
        extraData: {
          responseTime,
        },
      },
    } as AxiosResponseWithExtraData
  }

  it('status-not-2xx = true && response-time-greater-than-10-ms = true', () => {
    const res = generateMockedResponse(300, 20)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: { query: 'status-not-2xx', subject: '', message: '' },
        responseValue: 300,
        status: true,
      },
      {
        alert: {
          query: 'response-time-greater-than-10-ms',
          subject: '',
          message: '',
        },
        responseValue: 20,
        status: true,
      },
    ])
  })

  it('status-not-2xx = false && response-time-greater-than-10-ms = true', () => {
    const res = generateMockedResponse(200, 20)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: { query: 'status-not-2xx', subject: '', message: '' },
        responseValue: 200,
        status: false,
      },
      {
        alert: {
          query: 'response-time-greater-than-10-ms',
          subject: '',
          message: '',
        },
        responseValue: 20,
        status: true,
      },
    ])
  })

  it('status-not-2xx = true && response-time-greater-than-10-ms = false', () => {
    const res = generateMockedResponse(300, 10)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: { query: 'status-not-2xx', subject: '', message: '' },
        responseValue: 300,
        status: true,
      },
      {
        alert: {
          query: 'response-time-greater-than-10-ms',
          subject: '',
          message: '',
        },
        responseValue: 10,
        status: false,
      },
    ])
  })

  it('status-not-2xx = false && response-time-greater-than-10-ms = false', () => {
    const res = generateMockedResponse(200, 10)
    const data = validateResponse(mockedAlerts, res)

    expect(data).to.eql([
      {
        alert: { query: 'status-not-2xx', subject: '', message: '' },
        responseValue: 200,
        status: false,
      },
      {
        alert: {
          query: 'response-time-greater-than-10-ms',
          subject: '',
          message: '',
        },
        responseValue: 10,
        status: false,
      },
    ])
  })
})
