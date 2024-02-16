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
import { isValidURL } from '../../src/utils/is-valid-url.js'

describe('check if URL is valid', () => {
  it('should return true if URL using http protocol', () => {
    const valid = isValidURL('http://www.example.com')
    expect(valid).to.be.a('boolean')
    expect(valid).to.be.equals(true)
  })

  it('should return true if URL using https protocol', () => {
    const valid = isValidURL('https://www.example.com')
    expect(valid).to.be.a('boolean')
    expect(valid).to.be.equals(true)
  })

  it('should return false if not using http or https protocol', () => {
    const valid = isValidURL('www.example.com')
    expect(valid).to.be.a('boolean')
    expect(valid).to.be.equals(false)
  })
})
