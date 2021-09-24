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
import responseChecker from '..'
import { ProbeRequestResponse } from '../../../../interfaces/request'

describe('responseChecker', () => {
  describe('status-not-2xx', () => {
    const generateMockedResponse = (status: number) => {
      return {
        status,
        headers: {},
      } as ProbeRequestResponse
    }

    it('should handle when response status is 100', () => {
      const res = generateMockedResponse(100)
      const data = responseChecker(
        {
          query: 'response.status < 200 or response.status > 299',
          message: '',
        },
        res
      )

      expect(data).to.equals(true)
    })

    it('should handle when response status is 200', () => {
      const res = generateMockedResponse(200)
      const data = responseChecker(
        {
          query: 'response.status < 200 or response.status > 299',
          message: '',
        },
        res
      )

      expect(data).to.equals(false)
    })

    it('should handle when response status is 201', () => {
      const res = generateMockedResponse(201)
      const data = responseChecker(
        {
          query: 'response.status < 200 or response.status > 299',
          message: '',
        },
        res
      )

      expect(data).to.equals(false)
    })

    it('should handle when response status is 300', () => {
      const res = generateMockedResponse(300)
      const data = responseChecker(
        {
          query: 'response.status < 200 or response.status > 299',
          message: '',
        },
        res
      )

      expect(data).to.equals(true)
    })

    it('should handle when response status is 400', () => {
      const res = generateMockedResponse(400)
      const data = responseChecker(
        {
          query: 'response.status < 200 or response.status > 299',
          message: '',
        },
        res
      )

      expect(data).to.equals(true)
    })

    it('should handle when response status is 500', () => {
      const res = generateMockedResponse(500)
      const data = responseChecker(
        {
          query: 'response.status < 200 or response.status > 299',
          message: '',
        },
        res
      )

      expect(data).to.equals(true)
    })
  })

  describe('res-time-greater-than-x', () => {
    const generateMockedResponse = (responseTime: number) => {
      return {
        data: '',
        status: 200,
        responseTime, // milliseconds
        headers: {},
      }
    }

    it('seconds - should handle when response time is greater than alert defined response time', () => {
      const res = generateMockedResponse(20000)
      const data = responseChecker(
        { query: 'response.time > 10000', message: '' },
        res
      )

      expect(data).to.equals(true)
    })

    it('seconds - should handle when response time is less than alert defined response time', () => {
      const res = generateMockedResponse(10000)
      const data = responseChecker(
        { query: 'response.time > 20000', message: '' },
        res
      )

      expect(data).to.equals(false)
    })

    it('milliseconds - should handle when response time is greater than alert defined response time', () => {
      const res = generateMockedResponse(20)
      const data = responseChecker(
        { query: 'response.time > 10', message: '' },
        res
      )

      expect(data).to.equals(true)
    })

    it('milliseconds - should handle when response time is less than alert defined response time', () => {
      const res = generateMockedResponse(10)
      const data = responseChecker(
        { query: 'response.time > 20', message: '' },
        res
      )

      expect(data).to.equals(false)
    })
  })
})
