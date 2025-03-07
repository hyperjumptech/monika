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
import { getContext, resetContext, setContext } from '../../context/index.js'
import type { Config } from '../../interfaces/config.js'
import { addDefaultNotifications, getRawConfig } from './get.js'

describe('Add default notification', () => {
  beforeEach(() => {
    resetContext()
  })

  it('should add default notification', () => {
    // arrange
    const config: Config = {
      probes: [],
    }

    // act
    const newConfig = addDefaultNotifications(config)

    // assert
    expect(newConfig).deep.eq({
      probes: [],
      notifications: [{ id: 'default', type: 'desktop' }],
    })
  })

  it('should add default notification (empty config)', () => {
    // arrange
    const config = {} as Config

    // act
    const newConfig = addDefaultNotifications(config)

    // assert
    expect(newConfig).deep.eq({
      notifications: [{ id: 'default', type: 'desktop' }],
    })
  })

  it('should override existing notification', () => {
    // arrange
    const config = {
      notifications: [
        { id: '1', type: 'webhook', data: { url: 'https://example.com' } },
      ],
    } as Config

    // act
    const newConfig = addDefaultNotifications(config)

    // assert
    expect(newConfig).deep.eq({
      notifications: [{ id: 'default', type: 'desktop' }],
    })
  })

  it('should combine no probes config', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: [
          './src/components/config/__tests__/expected.textfile.yml',
          './test/testConfigs/noProbes.yml',
        ],
      },
    })

    // act
    const config = await getRawConfig()

    // assert
    expect(config.probes.length).greaterThan(0)
  })

  it('should return config', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: ['./src/components/config/__tests__/expected.textfile.yml'],
      },
    })

    // act
    const config = await getRawConfig()

    // assert
    expect(config.notifications?.length).eq(1)
  })

  it('should overwrite native config with non native config (HAR)', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: ['./src/components/config/__tests__/expected.textfile.yml'],
        har: './src/components/config/__tests__/form_encoded.har',
      },
    })

    // act
    const config = await getRawConfig()

    // assert
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(({ url }) => url === 'https://namb.ch/api/admin/login')
      )
    ).not.undefined
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(({ url }) => url === 'https://monika.hyperjump.tech')
      )
    ).to.be.undefined
    expect(config.notifications?.length).eq(1)
  })

  it('should overwrite native config with non native config (Postman)', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: ['./src/components/config/__tests__/expected.textfile.yml'],
        postman:
          './src/components/config/__tests__/mock_files/basic-postman_collection-v2.0.json',
      },
    })

    // act
    const config = await getRawConfig()

    expect(
      config.probes.find(({ requests }) =>
        requests?.find(
          ({ url }) => url === 'https://api.github.com/users/hyperjumptech'
        )
      )
    ).not.undefined
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(({ url }) => url === 'https://monika.hyperjump.tech')
      )
    ).to.be.undefined
    expect(config.notifications?.length).eq(1)
  })

  it('should overwrite native config with non native config (Insomnia)', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: ['./src/components/config/__tests__/expected.textfile.yml'],
        insomnia: './src/components/config/__tests__/petstore.insomnia.yaml',
      },
    })

    // act
    const config = await getRawConfig()

    // assert
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(
          ({ url }) => url === 'https://petstore3.swagger.io/api/v3/user/'
        )
      )
    ).not.undefined
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(({ url }) => url === 'https://monika.hyperjump.tech')
      )
    ).to.be.undefined
    expect(config.notifications?.length).eq(1)
  })

  it('should overwrite native config with non native config (Sitemap)', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: ['./src/components/config/__tests__/expected.textfile.yml'],
        sitemap: './src/components/config/__tests__/sitemap.xml',
      },
    })

    // act
    const config = await getRawConfig()

    // assert
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(
          ({ url }) => url === 'https://monika.hyperjump.tech/articles'
        )
      )
    ).not.undefined
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(({ url }) => url === 'https://monika.hyperjump.tech')
      )
    ).to.be.undefined
    expect(config.notifications?.length).eq(1)
  })

  it('should overwrite native config with non native config (Text)', async () => {
    // arrange
    setContext({
      flags: {
        ...getContext().flags,
        config: ['./src/components/config/__tests__/expected.sitemap.yml'],
        text: './src/components/config/__tests__/textfile',
      },
    })

    // act
    const config = await getRawConfig()

    // assert
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(({ url }) => url === 'https://github.com')
      )
    ).not.undefined
    expect(
      config.probes.find(({ requests }) =>
        requests?.find(
          ({ url }) => url === 'https://monika.hyperjump.tech/articles'
        )
      )
    ).to.be.undefined
    expect(config.notifications?.length).eq(1)
  })
})
