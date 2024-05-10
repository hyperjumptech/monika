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

const monika = './bin/run.js'

describe('Node CLI Testing', () => {
  it('shows version', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn('node', `${monika} -v`)
    await waitForText('@hyperjumptech/monika')

    const stdout = getStdout().join('\r\n')

    // assert
    expect(stdout).to.contain('@hyperjumptech/monika')

    await cleanup()
  })
  it('shows initializing file when no config', async () => {
    // arrange
    const { spawn, cleanup, exists, removeFile } = await prepareEnvironment()
    const assertText1 = 'No Monika configuration available, initializing...'
    const assertText2 =
      'monika.yml file has been created in this directory. You can change the URL to probe and other configurations in that monika.yml file.'

    // act
    const prevConfig = await exists('./monika.yml')
    if (prevConfig) {
      await removeFile('./monika.yml')
    }

    const { getStdout, waitForText } = await spawn('node', `${monika} -r 1`)
    await waitForText(assertText2)
    const stdout = getStdout().join('\r\n')

    // assert
    expect(stdout).to.contain(assertText1)
    expect(stdout).to.contain(assertText2)

    await cleanup()
  })
  it('shows starting message with valid json config', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 -c ./monika.example.json`
    )
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')

    // assert
    expect(stdout).to.contain('Starting Monika.')

    await cleanup()
  })
  it('shows starting message with valid yml config', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 -c ./monika.example.yml`
    )
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')

    // assert
    expect(stdout).to.contain('Starting Monika.')

    await cleanup()
  })

  it('should starts Monika with a JSON config from a URL', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 -c https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.json`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 1. Notifications: 1')

    await cleanup()
  })

  it('should starts Monika with a YAML config from a URL', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 -c https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 1. Notifications: 1')

    await cleanup()
  })

  it('should starts Monika with a HAR file', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 --har ./src/components/config/__tests__/form_encoded.har`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 1. Notifications: 1')

    await cleanup()
  })

  it('should starts Monika with an Insomnia file', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 --insomnia ./src/components/config/__tests__/petstore.insomnia.yaml`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 18. Notifications: 1')

    await cleanup()
  })

  it('should starts Monika with a Postman file', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 --postman ./src/components/config/__tests__/mock_files/grouped-postman_collection-v2.1.json`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 2. Notifications: 1')

    await cleanup()
  })

  it('should starts Monika with a Sitemap file', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 --sitemap ./src/components/config/__tests__/sitemap.xml`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 2. Notifications: 1')

    await cleanup()
  })

  it('should starts Monika with a text file', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 --text ./src/components/config/__tests__/textfile`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 2. Notifications: 1')

    await cleanup()
  })

  it('should overwrites native config', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 -c ./monika.example.yml --text ./src/components/config/__tests__/textfile`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 2. Notifications: 1')

    await cleanup()
  })

  it('should runs with multiple config', async () => {
    // arrange
    const { spawn, cleanup } = await prepareEnvironment()

    // act
    const { getStdout, waitForText } = await spawn(
      'node',
      `${monika} -r 1 -c ./monika.example.json ./monika.example.yml`
    )

    // assert
    await waitForText('Starting Monika.')
    const stdout = getStdout().join('\r\n')
    expect(stdout).to.contain('Starting Monika. Probes: 1. Notifications: 1')

    await cleanup()
  })

  it('Detect config file changes successfully', async () => {
    // arrange
    const { spawn, cleanup, writeFile } = await prepareEnvironment()

    const initFile = `
  probes:
    - id: '1'
      name: Google
      interval: 1
      requests:
        - url: https://google.com
  notifications:
    - id: unique-id-monika-notif,
      type: desktop
  `
    const changeFile = `
  probes:
    - id: '1'
      name: Google
      interval: 1
      requests:
        - url: https://google.com
    - id: '2'
      name: Github
      interval: 1
      requests:
        - url: https://github.com
  notifications:
  - id: unique-id-monika-notif,
    type: desktop
  `
    const updatedString = 'WARN: config file update detected'

    // act
    // write initial yml
    await writeFile('./cli-test.yml', initFile)

    // run monika
    const { getStdout, waitForText, kill, wait } = await spawn(
      'node',
      `${monika} -c cli-test.yml`
    )

    try {
      await waitForText('GET https://google.com')

      // write new yml containing github url
      await writeFile('./cli-test.yml', changeFile)
      await wait(5000)

      // assert
      const stdout = getStdout().join('\r\n')
      const stdoutBeforeConfigChange = stdout.split(updatedString)[0]
      const stdoutAfterConfigChange = stdout.split(updatedString)[1]
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
    } catch {
      console.error('catch error waiting for change file')
    }

    // Stop monika
    kill('SIGINT')
    await cleanup()
  })
})
