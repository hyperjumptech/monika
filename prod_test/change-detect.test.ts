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

import { exec } from 'child_process'
import * as fs from 'fs'
import { expect } from 'chai'

const initFile = `
probes:
  - id: 'test'
    name: 'original Config'
    requests:
      - url: https://httpbin.org/status/200
        method: GET
        timeout: 5000
        saveBody: false
        interval: 10

    alerts:
      - query: response.status == 500
        subject: response status
        message: response status message
    incidentThreshold: 3
    recoveryThreshold: 3

notifications:
  - id: my-desktop
    type: desktop
`
const changeFile = `
probes:
  - id: 'test'
    name: 'changedFile'
    requests:
      - url: https://httpbin.org/status/400
        method: GET
        timeout: 5000
        saveBody: false
        interval: 3

    alerts:
      - query: response.status == 500
        subject: response status
        message: response status message
    incidentThreshold: 3
    recoveryThreshold: 3

notifications:
  - id: my-desktop
    type: desktop
`
describe('Change Detection', () => {
  setTimeout(function () {
    fs.writeFileSync('./testConfig.yml', changeFile, 'utf-8')
  }, 1500)

  fs.writeFileSync('./testConfig.yml', initFile, 'utf-8')

  it('should detect changes in configs', () => {
    exec(`monika -r 10 -c ./testConfig.yml`, (_, out, _stderr) => {
      expect(out).to.contain('Restarting Monika.')
    })
  }).timeout(10000)
})
