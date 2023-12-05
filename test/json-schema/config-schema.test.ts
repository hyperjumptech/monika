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

import yaml from 'js-yaml'
import fs from 'fs'
import { expect } from 'chai'
import Ajv from 'ajv'

const ajv = new Ajv()
const defaultConfig = yaml.load(fs.readFileSync('monika.example.yml', 'utf8'))
import mySchema from '../../src/monika-config-schema.json'

const validate = ajv.compile(mySchema)

describe('json schema validation tests', () => {
  it('should return all ok for our sample config', () => {
    const isValid = validate(defaultConfig)
    expect(isValid).to.be.true
  })

  it('should detect bad probe, missing mandatory probe.id', () => {
    const isBadProbe = yaml.load(
      fs.readFileSync('./test/json-schema/test-configs/bad-probe.yml', 'utf8')
    )
    const isValid = validate(isBadProbe)
    expect(isValid).to.be.false
  })

  it('should detect extra fields probes.extrafields', () => {
    const badProbeExtra = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/bad-probe-extra.yml',
        'utf8'
      )
    )
    const isValid = validate(badProbeExtra)
    expect(isValid).to.be.false
  })

  it('should detect missing mandatory url in a probe.request.url', () => {
    const badRequest = yaml.load(
      fs.readFileSync('./test/json-schema/test-configs/bad-request.yml', 'utf8')
    )
    const isValid = validate(badRequest)
    expect(isValid).to.be.false
  })

  it('should detect missing probe.alert.assertion', () => {
    const badQuery = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/bad-assertion.yml',
        'utf8'
      )
    )
    const isValid = validate(badQuery)
    expect(isValid).to.be.false
  })

  it('should detect mandatory required notification.data.url', () => {
    const badDataUrl = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/bad-notif-url.yml',
        'utf8'
      )
    )
    const isValid = validate(badDataUrl)
    expect(isValid).to.be.false
  })

  it('should detect bad url formatting', () => {
    const badUrlFormat = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/bad-url-format.yml',
        'utf8'
      )
    )
    const isValid = validate(badUrlFormat)
    expect(isValid).to.be.false
  })

  it('should allow probe.request.body and probe.request.headers with any field:value pair', () => {
    const requestBodyHeader = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/body-headers.yml',
        'utf8'
      )
    )
    const isValid = validate(requestBodyHeader)
    expect(isValid).to.be.true
  })
})
