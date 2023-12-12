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
import type { Config } from '../../interfaces/config'
import { addDefaultNotifications } from './get'

describe('Add default notification', () => {
  it('should add default notification', () => {
    // arrange
    const config: Partial<Config> = {
      probes: [],
    }

    // act
    const newConfig = addDefaultNotifications(config)

    // assert
    expect(newConfig).deep.eq({
      probes: [],
      notifications: [{ id: 'default', type: 'desktop', data: undefined }],
    })
  })

  it('should add default notification (empty config)', () => {
    // arrange
    const config: Partial<Config> = {}

    // act
    const newConfig = addDefaultNotifications(config)

    // assert
    expect(newConfig).deep.eq({
      notifications: [{ id: 'default', type: 'desktop', data: undefined }],
    })
  })

  it('should override existing notification', () => {
    // arrange
    const config: Partial<Config> = {
      notifications: [
        { id: '1', type: 'webhook', data: { url: 'https://example.com' } },
      ],
    }

    // act
    const newConfig = addDefaultNotifications(config)

    // assert
    expect(newConfig).deep.eq({
      notifications: [{ id: 'default', type: 'desktop', data: undefined }],
    })
  })
})
