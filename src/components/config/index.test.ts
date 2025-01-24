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

import { readFile, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { expect } from '@oclif/test'
import chai from 'chai'
import spies from 'chai-spies'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'

import { getContext, resetContext, setContext } from '../../context'
import events from '../../events'
import type { Config } from '../../interfaces/config'
import { sanitizeFlags } from '../../flag'
import { getErrorMessage } from '../../utils/catch-error-handler'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import { sanitizeConfig } from './sanitize'
import {
  getValidatedConfig,
  isSymonModeFrom,
  initConfig,
  updateConfig,
} from '.'
import { validateProbes } from './validation'

describe('getValidatedConfig', () => {
  beforeEach(() => {
    resetContext()
  })

  it('should throw error when config is empty', () => {
    expect(() => getValidatedConfig()).to.throw(
      'Configuration setup has not been run yet'
    )
  })

  it('should not throw error when config is empty in symon mode', () => {
    // arrange
    setContext({
      flags: sanitizeFlags({
        symonKey: 'bDF8j',
        symonUrl: 'https://example.com',
      }),
    })

    // act & assert
    expect(getValidatedConfig().version).eq('efde57d3b97ff787384fc2afde824615')
  })

  it('should return empty array for probes when config is empty in Symon mode', () => {
    // arrange
    setContext({
      flags: sanitizeFlags({
        symonKey: 'bDF8j',
        symonUrl: 'https://example.com',
      }),
    })

    // act and assert
    expect(getValidatedConfig().probes).deep.eq([])
  })
})

describe('isSymonModeFrom', () => {
  it('should return true', () => {
    // act
    const isSymonMode = isSymonModeFrom({
      symonKey: 'secret-key',
      symonUrl: 'https://example.com',
    })

    // assert
    expect(isSymonMode).eq(true)
  })

  it('should return false when symon key and url is empty', () => {
    // act
    const isSymonMode = isSymonModeFrom({
      symonKey: '',
      symonUrl: '',
    })

    // assert
    expect(isSymonMode).eq(false)
  })

  it('should return false when symon key is empty', () => {
    // act
    const isSymonMode = isSymonModeFrom({
      symonKey: '',
      symonUrl: 'https://example.com',
    })

    // assert
    expect(isSymonMode).eq(false)
  })

  it('should return false when symon url is empty', () => {
    // act
    const isSymonMode = isSymonModeFrom({
      symonKey: 'secret-key',
      symonUrl: '',
    })

    // assert
    expect(isSymonMode).eq(false)
  })
})

describe('updateConfig', () => {
  beforeEach(() => {
    resetContext()
  })

  it('should throw error when config is invalid', async () => {
    // arrange
    let errorMessage = ''

    try {
      // act
      await updateConfig({ probes: [{}] } as Config)
    } catch (error: unknown) {
      errorMessage = getErrorMessage(error)
    }

    // assert
    expect(errorMessage).contain('Monika configuration is invalid')
  })

  it('should update config', async () => {
    // arrange
    const config = {
      notifications: [],
      probes: await validateProbes([
        {
          id: '1',
          name: '',
          interval: 1000,
          requests: [
            {
              url: 'https://example.com',
              body: '',
              followRedirects: 21,
              timeout: 1000,
            },
          ],
          alerts: [],
        },
      ]),
    }
    let configFromEmitter = ''
    const eventEmitter = getEventEmitter()
    eventEmitter.once(events.config.updated, (data) => {
      configFromEmitter = data
    })

    // act
    await updateConfig(config)

    // assert
    expect(getContext().config).to.deep.eq(sanitizeConfig(config))
    expect(configFromEmitter).not.eq('')
  })

  it('should should not update config if there is no changes', async () => {
    // arrange
    const config: Config = {
      probes: [
        {
          id: '1',
          name: '',
          interval: 1000,
          requests: [
            {
              url: 'https://example.com',
              body: '',
              followRedirects: 21,
              timeout: 1000,
            },
          ],
          alerts: [],
        },
      ],
    }
    let configFromEmitter = ''
    const eventEmitter = getEventEmitter()
    const eventListener = (data: string) => {
      configFromEmitter = data
    }

    // act
    await updateConfig(config)
    eventEmitter.once(events.config.updated, eventListener)
    await updateConfig(config)

    // assert
    expect(configFromEmitter).eq('')
    eventEmitter.removeListener(events.config.updated, eventListener)
  })
})

describe('Setup Config', () => {
  const server = setupServer()
  chai.use(spies)
  let logMessages: string[] = []

  before(() => {
    server.listen({ onUnhandledRequest: 'bypass' })
  })

  beforeEach(async () => {
    if (existsSync('monika.yml')) {
      await rename('monika.yml', 'monika_backup.yml')
    }

    setContext({
      ...getContext(),
      flags: { ...getContext().flags, config: [] },
    })

    chai.spy.on(log, 'info', (message: string) => {
      logMessages.push(message)
    })
  })

  afterEach(async () => {
    server.resetHandlers()
    if (existsSync('monika_backup.yml')) {
      await rename('monika_backup.yml', 'monika.yml')
    }

    chai.spy.restore()
    logMessages = []
  })

  after(() => {
    server.close()
  })

  it('should create example config if config does not exist', async () => {
    // act
    await initConfig()

    // assert
    expect(existsSync('monika.yml')).eq(true)
  })

  it('should create local example config if the url is unreachable', async () => {
    // arrange
    server.use(
      http.get(
        'https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml',
        () => HttpResponse.error()
      )
    )

    // act
    await initConfig()

    // assert
    expect(existsSync('monika.yml')).eq(true)
    expect(await readFile('monika.yml', { encoding: 'utf8' })).include(
      'http://example.com'
    )
  })

  it('log config changes info', async () => {
    // arrange
    server.use(
      http.get(
        'https://raw.githubusercontent.com/hyperjumptech/monika/main/monika.example.yml',
        () => HttpResponse.error()
      )
    )
    setContext({ config: sanitizeConfig({ probes: [], version: '0.0.1' }) })

    // act
    await initConfig()

    // assert
    expect(
      logMessages.find(
        (message) => message === 'Config changes. Updating config...'
      )
    ).not.undefined
  })
})

describe('sanitizeConfig', () => {
  beforeEach(() => {
    resetContext()
  })

  it('should sanitize probes in normal mode', () => {
    // arrange
    const config = {
      probes: [
        {
          id: '1',
          name: 'Test probe',
          interval: 1000,
          requests: [
            {
              url: 'https://example.com',
              body: '',
              followRedirects: 21,
              timeout: 1000,
            },
          ],
          alerts: [],
        },
      ],
    }

    // act
    const result = sanitizeConfig(config)

    // assert
    expect(result.probes[0].alerts).to.have.lengthOf(1)
    expect(result.probes[0].alerts[0]).to.include({
      assertion: '',
      message: 'Probe not accessible',
    })
  })

  it('should sanitize probes in Symon mode', () => {
    // arrange
    setContext({
      flags: sanitizeFlags({
        symonKey: 'test-key',
        symonUrl: 'https://example.com',
      }),
    })
    const config = {
      probes: [
        {
          id: '1',
          name: 'Test probe',
          interval: 30_000,
          requests: [
            {
              url: 'https://example.com',
              body: '',
              followRedirects: 21,
              timeout: 1000,
            },
          ],
          alerts: [],
        },
      ],
    }

    // act
    const result = sanitizeConfig(config)

    // assert
    expect(result.probes[0].alerts).to.have.lengthOf(0)
    expect(result.probes[0].id).to.equal('1')
    expect(result.probes[0].interval).to.equal(30_000)
  })

  it('should preserve existing config properties', () => {
    // arrange
    const config: Config = {
      version: '1.0.0',
      notifications: [{ id: 'test-1', type: 'smtp' }],
      certificate: {
        domains: ['example.com'],
        reminder: 15,
      },
      probes: [],
    }

    // act
    const result = sanitizeConfig(config)

    // assert
    expect(result.version).to.equal('1.0.0')
    expect(result.notifications).to.deep.equal([{ id: 'test-1', type: 'smtp' }])
    expect(result.certificate?.reminder).to.equal(15)
  })
})
