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
import * as Handlebars from 'handlebars'
import registerFakes from '../../src/utils/fakes'

describe('Fake data', () => {
  registerFakes(Handlebars)

  it('should returns random string with length count which contains only alphabetical characters', () => {
    const case1 = Handlebars.compile('{{ alpha }}')
    expect(case1({})).to.have.lengthOf(8)

    const case2 = Handlebars.compile('{{ alpha 4 }}')
    expect(case2({})).to.have.lengthOf(4)
  })

  it('returns random string with length count which contains alphabets and digits', () => {
    const case1 = Handlebars.compile('{{ alphaNumeric }}')
    expect(case1({})).to.have.lengthOf(8)

    const case2 = Handlebars.compile('{{ alphaNumeric 4 }}')
    expect(case2({})).to.have.lengthOf(4)
  })

  it('should returns a random country', () => {
    const case1 = Handlebars.compile('{{ country }}')
    expect(case1({})).to.have.lengthOf.greaterThanOrEqual(4)
  })

  it('should returns a random country code', () => {
    const case1 = Handlebars.compile('{{ countryCode }}')
    expect(case1({})).to.have.lengthOf.greaterThanOrEqual(2)
  })

  it('should returns a random color string', () => {
    const case1 = Handlebars.compile('{{ color }}')
    expect(case1({})).to.have.lengthOf.greaterThanOrEqual(3)
  })

  it('should returns a random currency code', () => {
    const case1 = Handlebars.compile('{{ currency }}')
    expect(case1({})).to.have.lengthOf.greaterThanOrEqual(3)
  })

  it('should returns a random email address', () => {
    const case1 = Handlebars.compile('{{ email }}')
    expect(case1({})).to.match(/\S+@\S+\.\S+/)
  })

  it('should returns a random full name', () => {
    const case1 = Handlebars.compile('{{ fullName }}')
    expect(case1({}).split(' ')).to.have.lengthOf.greaterThanOrEqual(2)
  })

  it('should returns a random gender', () => {
    const case1 = Handlebars.compile('{{ gender }}')
    expect(case1({})).to.be.oneOf(['male', 'female'])

    const case2 = Handlebars.compile('{{ gender false }}')
    expect(case2({})).to.have.lengthOf.greaterThanOrEqual(3)
  })

  it('should returns a random latitude', () => {
    const case1 = Handlebars.compile('{{ latitude }}')
    expect(Number.parseFloat(case1({}))).to.be.within(-90, 90)

    const case2 = Handlebars.compile('{{ latitude 45 -45 }}')
    expect(Number.parseFloat(case2({}))).to.be.within(-45, 45)
  })

  it('should returns a random longitude', () => {
    const case1 = Handlebars.compile('{{ longitude }}')
    expect(Number.parseFloat(case1({}))).to.be.within(-180, 180)

    const case2 = Handlebars.compile('{{ longitude 90 -90 }}')
    expect(Number.parseFloat(case2({}))).to.be.within(-90, 90)
  })

  it('should returns a random lines', () => {
    const case1 = Handlebars.compile('{{ lines }}')
    expect(case1({}).split(' ')).to.have.lengthOf.greaterThanOrEqual(2)
  })

  it('should returns a random number', () => {
    const case1 = Handlebars.compile('{{ number }}')
    expect(Number.parseInt(case1({}), 10)).to.be.within(0, 100)

    const case2 = Handlebars.compile('{{ number 0 1000 }}')
    expect(Number.parseInt(case2({}), 10)).to.be.within(0, 1000)
  })

  it('should returns a random mongodb objectid', () => {
    const case1 = Handlebars.compile('{{ objectId }}')
    expect(case1({})).to.match(/^[\da-f]{24}$/i)
  })

  it('should returns a random status code', () => {
    const case1 = Handlebars.compile('{{ statusCode }}')
    expect(Number.parseInt(case1({}), 10)).to.be.within(100, 599)
  })

  it('should returns a random uuid', () => {
    const case1 = Handlebars.compile('{{ uuid }}')
    expect(case1({})).to.match(
      /^[\dA-Fa-f]{8}(?:\b-[\dA-Fa-f]{4}){3}\b-[\dA-Fa-f]{12}$/
    )
  })

  it('should returns a random word', () => {
    const case1 = Handlebars.compile('{{ word }}')
    expect(case1({})).to.have.lengthOf.greaterThanOrEqual(2)
  })

  it('should returns a random words', () => {
    const case1 = Handlebars.compile('{{ words }}')
    expect(case1({}).split(' ')).to.have.lengthOf(3)

    const case2 = Handlebars.compile('{{ words 5 }}')
    expect(case2({}).split(' ')).to.have.lengthOf(5)
  })

  it('should returns a timestamp', () => {
    const case1 = Handlebars.compile('{{ timestamp }}')
    // sometimes the rendered timestamp and current date differs by 1 ms which causes the test to fail intermittently.
    // so it's better to check the diff with lessThanOrEqual.
    const now = Date.now()
    const rendered = Number.parseInt(case1({}), 10)
    const diff = Math.abs(now - rendered)
    expect(diff).to.be.lessThanOrEqual(1)
  })

  it('should returns a isodate string', () => {
    const case1 = Handlebars.compile('{{ isodate }}')
    // chop off the milliseconds when comparing it
    expect(case1({}).split('.')[0]).to.be.equals(
      new Date().toISOString().split('.')[0]
    )
  })
})
