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

import { prepareEnvironment } from '@gmrchk/cli-testing-library'
import { expect } from 'chai'

describe('CLI Testing', () => {
  it('Detect config file changes successfully', async () => {
    const { spawn, cleanup, writeFile } = await prepareEnvironment()

    const initFile = `
probes:
  - id: 1
    name: Google
    interval: 1
    incidentThreshold: 6
    recoveryThreshold: 6
    requests:
      - url: https://google.com
notifications:
  - id: unique-id-monika-notif,
    type: desktop
`
    const changeFile = `
probes:
  - id: 1
    name: Google
    interval: 2
    incidentThreshold: 4
    recoveryThreshold: 4
    requests:
      - url: https://google.com
  - id: 2
    name: Github
    interval: 2
    incidentThreshold: 4
    recoveryThreshold: 4
    requests:
      - url: https://github.com
notifications:
- id: unique-id-monika-notif,
  type: desktop
`

    // write initial yml
    await writeFile('./cli-test.yml', initFile)

    // run monika
    const { getStdout, wait, kill } = await spawn(
      'node',
      './bin/run -c cli-test.yml'
    )
    await wait(8000)

    // write new yml containing github url
    await writeFile('./cli-test.yml', changeFile)
    await wait(5000)

    const stdout = getStdout().join('\r\n')
    const updatedString = 'WARN: config file update detected'
    const stdoutBeforeConfigChange = stdout.split(updatedString)[0]
    const stdoutAfterConfigChange = stdout.split(updatedString)[1]

    console.log('stdout:\r\n', getStdout())
    console.log('stdoutBeforeConfigChange:\r\n', stdoutBeforeConfigChange)
    console.log('stdoutAfterConfigChange:', stdoutAfterConfigChange)

    // expect starting monika
    expect(stdoutBeforeConfigChange).to.contain('Using config file')
    expect(stdoutBeforeConfigChange).to.contain('cli-test.yml')
    expect(stdoutBeforeConfigChange).to.contain(
      'Starting Monika. Probes: 1. Notifications: 1'
    )
    expect(stdoutBeforeConfigChange).to.contain('GET https://google.com')

    // expect new yml including url github
    expect(stdoutAfterConfigChange).to.contain('Using config file:')
    expect(stdoutAfterConfigChange).to.contain('cli-test.yml')
    expect(stdoutAfterConfigChange).to.contain(
      'Restarting Monika. Probes: 2. Notifications: 1'
    )
    expect(stdoutAfterConfigChange).to.contain('GET https://github.com')

    // Stop monika
    kill('SIGINT')

    await cleanup()
  })
})
