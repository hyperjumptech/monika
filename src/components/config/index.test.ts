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
import { getConfig, isSymonModeFrom, updateConfig } from '.'
import { getContext, resetContext, setContext } from '../../context'
import type { Config } from '../../interfaces/config'
import events from '../../events'
import { md5Hash } from '../../utils/hash'
import { getEventEmitter } from '../../utils/events'
import type { MonikaFlags } from '../../context/monika-flags'

describe('getConfig', () => {
  afterEach(() => {
    resetContext()
  })

  it('should throw error when config is empty', () => {
    expect(() => getConfig()).to.throw(
      'Configuration setup has not been run yet'
    )
  })

  it('should return empty array when config is empty in Symon mode', () => {
    // arrange
    setContext({
      flags: {
        symonKey: 'bDF8j',
        symonUrl: 'https://example.com',
      } as MonikaFlags,
    })

    // act and assert
    expect(getConfig()).deep.eq({ probes: [] })
  })

  it('should return config', () => {
    // arrange
    const config = {
      probes: [
        {
          id: '1',
          name: 'example',
          interval: 1000,
          incidentThreshold: 1,
          recoveryThreshold: 1,
          alerts: [],
          requests: [{ body: '', url: 'https://example.com', timeout: 1000 }],
        },
      ],
    }
    setContext({ config })

    // assert
    expect(getConfig()).to.deep.eq(config)
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
  afterEach(() => {
    resetContext()
  })

  it('should throw error when config is invalid', async () => {
    // arrange
    let errorMessage = ''

    try {
      // act
      await updateConfig({ probes: [] })
    } catch (error: any) {
      errorMessage = error.message
    }

    // assert
    expect(errorMessage).eq(
      'Probes object does not exists or has length lower than 1!'
    )
  })

  it('should update config', async () => {
    // arrange
    const config: Config = {
      probes: [
        {
          id: '1',
          name: '',
          interval: 1000,
          requests: [{ url: 'https://example.com', body: '', timeout: 1000 }],
          incidentThreshold: 1,
          recoveryThreshold: 1,
          alerts: [],
        },
      ],
    }
    let configFromEmitter = ''
    const eventEmitter = getEventEmitter()
    eventEmitter.once(events.config.updated, (data) => {
      configFromEmitter = data
    })

    // act
    await updateConfig(config)

    // assert
    expect(getContext().config).to.deep.eq({
      ...config,
      version: md5Hash(config),
    })
    expect(configFromEmitter).not.eq('')
  })

  it('should should not update config', async () => {
    // arrange
    const config: Config = {
      probes: [
        {
          id: '1',
          name: '',
          interval: 1000,
          requests: [{ url: 'https://example.com', body: '', timeout: 1000 }],
          incidentThreshold: 1,
          recoveryThreshold: 1,
          alerts: [],
        },
      ],
    }
    setContext({ config: { ...config, version: md5Hash(config) } })
    let configFromEmitter = ''
    const eventEmitter = getEventEmitter()
    const eventListener = (data: any) => {
      configFromEmitter = data
    }

    eventEmitter.once(events.config.updated, eventListener)

    // act
    await updateConfig(config)

    // assert
    expect(configFromEmitter).eq('')
    eventEmitter.removeListener(events.config.updated, eventListener)
  })
})
