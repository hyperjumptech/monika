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

/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2022 Hyperjump Technology                                        *
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
import mySchema from '../../monika-config-schema.json'

ajv.addVocabulary(['name', 'fileMatch', 'url']) // add custom Scheme Store keywords, reference: https://www.schemastore.org/json/

const validate = ajv.compile(mySchema)

describe('json schema validation tests', () => {
  it('should return all ok for our sample config', () => {
    const valid = validate(defaultConfig)
    expect(valid).to.be.true
  })

  it('should detect bad probe, missing mandatory probe.id', () => {
    const badProbe = yaml.load(
      fs.readFileSync('./test/json-schema/test-configs/bad-probe.yml', 'utf8')
    )
    const valid = validate(badProbe)
    expect(valid).to.be.false
  })

  it('should detect extra fields probes.extrafields', () => {
    const badProbeExtra = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/bad-probe-extra.yml',
        'utf8'
      )
    )
    const valid = validate(badProbeExtra)
    expect(valid).to.be.false
  })

  it('should detect missing mandatory url in a probe.request.url', () => {
    const badRequest = yaml.load(
      fs.readFileSync('./test/json-schema/test-configs/bad-request.yml', 'utf8')
    )
    const valid = validate(badRequest)
    expect(valid).to.be.false
  })

  it('should detect bad probe.incidentThreshold.type', () => {
    const badType = yaml.load(
      fs.readFileSync('./test/json-schema/test-configs/bad-type.yml', 'utf8')
    )
    const valid = validate(badType)
    expect(valid).to.be.false
  })

  it('should detect missing probe.alert.query', () => {
    const badQuery = yaml.load(
      fs.readFileSync('./test/json-schema/test-configs/bad-query.yml', 'utf8')
    )
    const valid = validate(badQuery)
    expect(valid).to.be.false
  })

  it('should detect mandatory required notification.data.url', () => {
    const badDataUrl = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/bad-notif-url.yml',
        'utf8'
      )
    )
    const valid = validate(badDataUrl)
    expect(valid).to.be.false
  })

  it('should allow probe.request.body and probe.request.headers with any fields', () => {
    const requestBodyHeader = yaml.load(
      fs.readFileSync(
        './test/json-schema/test-configs/body-headers.yml',
        'utf8'
      )
    )
    const valid = validate(requestBodyHeader)
    expect(valid).to.be.true
  })
})
