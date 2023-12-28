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

// So this file is in test but not run as part of the testing suite.
// This test run independently against monika's (config) update detector.
// To run this test just call : npx ts-node ./test/others/change-config-loop.js and objserve monika doesnt die.

import { writeFileSync } from 'fs'

const initFile = `
probes:
  - id: 'test'
    name: 'original Config'
    requests:
      - url: https://httpbin.org/status/200
        method: GET
        timeout: 5000
        saveBody: false
        interval: 1

    alerts:
      - assertion: response.status == 500
        subject: response status
        message: response status message

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
        interval: 1

    alerts:
      - assertion: response.status == 500
        subject: response status
        message: response status message

notifications:
  - id: my-desktop
    type: desktop
`

function changefile() {
  writeFileSync('./testchange.yml', changeFile, 'utf8')
}

function restorefile() {
  writeFileSync('./testchange.yml', initFile, 'utf8')
}

function sleep(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const BASE_DELAY = 200 // ms
let iteration = 0
let flag = true
async function test() {
  console.log('starting.....')
  for (;;) {
    iteration++

    const ms = BASE_DELAY + Math.floor(Math.random() * 500)
    // eslint-disable-next-line no-await-in-loop
    await sleep(ms) // pseudorandom 200..700ms delay

    if (flag) {
      restorefile()
      console.log('restoring file. iteration:', iteration, 'delay:', ms)
    } else {
      changefile()
      console.log('changeing file. iteration:', iteration, 'delay:', ms)
    }

    flag = !flag // toggle
  }
}

await test()
