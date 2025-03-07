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
import { sanitizeExpression } from '../../src/utils/expression-parser.js'

describe('sanitizeExpression', () => {
  it('sanitize "response.status == 500" expression', () => {
    const sanitized = sanitizeExpression('response.status == 500', ['response'])
    expect(sanitized).to.equals('__getValueByPath("response.status") == 500')
  })

  it('sanitize "response.body.data[0].title == "The Title"" expression', () => {
    const sanitized = sanitizeExpression(
      'response.body.data[0].title == "The Title"',
      ['response']
    )
    expect(sanitized).to.equals(
      '__getValueByPath("response.body.data[0].title") == "The Title"'
    )
  })

  it('sanitize "startsWith(lowerCase(response.body.title), "The")" expression', () => {
    const sanitized = sanitizeExpression(
      'startsWith(lowerCase(response.body.title), "The")',
      ['response']
    )
    expect(sanitized).to.equals(
      'startsWith(lowerCase(__getValueByPath("response.body.title")), "The")'
    )
  })
})
