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
import queryExpression from '../query-expression'
import { probeRequestResult } from '../../../../interfaces/request'

describe('queryExpression', () => {
  it('should handle response time query', () => {
    const res = {
      data: '',
      body: '',
      status: 200,
      headers: {},
      responseTime: 150,
      result: probeRequestResult.success,
    }

    const result = queryExpression(res, 'response.time > 1000')

    expect(result).to.be.false
  })

  it('should handle response status query', () => {
    const res = {
      data: '',
      body: '',
      status: 200,
      headers: {},
      responseTime: 200,
      result: probeRequestResult.success,
    }

    const result = queryExpression(res, 'response.status != 200')

    expect(result).to.be.false
  })

  it('should handle response size query', () => {
    const res = {
      data: '',
      body: '',
      status: 200,
      headers: { 'content-length': '2000' },
      responseTime: 200,
      result: probeRequestResult.success,
    }

    const result = queryExpression(res, 'response.size < 1000')

    expect(result).to.be.false
  })

  it('should handle response headers query', () => {
    const res = {
      data: '',
      body: '',
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      responseTime: 200,
      result: probeRequestResult.success,
    }

    const result = queryExpression(
      res,
      "response.headers['content-type'] != 'application/json'"
    )

    expect(result).to.be.false
  })

  it('should handle response body query', () => {
    const res = {
      status: 200,
      headers: {},
      responseTime: 200,
      data: {
        message: 'Hello',
      },
      body: {
        message: 'Hello',
      },
      result: probeRequestResult.success,
    }

    const result = queryExpression(
      res,
      "startsWith(response.body.message, 'Hello')"
    )

    expect(result).to.be.false
  })
})
