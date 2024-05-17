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

import { mapInsomniaRequestToConfig, getAuthorizationHeader } from './insomnia'
import { expect } from '@oclif/test'

describe('testing getAuthorizationHeader', () => {
  it('should return undefined when data is invalid', () => {
    const data = {
      authentication: {
        type: 'invalid',
        disabled: false,
        token: 'token',
        prefix: 'bearer',
      },
    }

    const authorization = getAuthorizationHeader(data, {})
    expect(authorization).to.be.undefined
  })

  it('should return undefined when authentication is disabled', () => {
    const data = {
      authentication: {
        type: 'invalid',
        disabled: true,
        token: 'token',
        prefix: 'bearer',
      },
    }

    const authorization = getAuthorizationHeader(data, {})
    expect(authorization).to.be.undefined
  })

  it('should return authorization header with bearer token', () => {
    const data = {
      authentication: {
        type: 'bearer',
        disabled: false,
        token: 'token',
        prefix: 'bearer',
      },
    }

    const authorization = getAuthorizationHeader(data, {})
    expect(authorization).to.equal('bearer token')
  })

  it('should return authorization header with custom prefix', () => {
    const data = {
      authentication: {
        type: 'bearer',
        disabled: false,
        token: 'token',
        prefix: 'custom',
      },
    }

    const authorization = getAuthorizationHeader(data, {})
    expect(authorization).to.equal('custom token')
  })

  it('should replace template variables in the token', () => {
    const data = {
      authentication: {
        type: 'bearer',
        disabled: false,
        token: 'Hello, _.name!',
        prefix: 'bearer',
      },
    }
    const env = {
      _type: 'environment',
      data: {
        scheme: 'http',
        host: '',
        // eslint-disable-next-line camelcase
        base_path: 'hyperjump.com',
      },
    }
    const authorization = getAuthorizationHeader(data, env)
    expect(authorization).to.equal('bearer Hello, name!') // note, name is not replaced as env not set for this test
  })
})

describe('testing mapInsomniaRequestToConfig', () => {
  it('should map Insomnia request to config', () => {
    const req = {
      _id: '123',
      name: 'Test Request',
      description: 'Test Description',
      url: '{{ base_url }}/test',
      method: 'POST',
      body: {
        text: '{"key": "value"}',
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ],
    }

    const expectedConfig = {
      id: '123',
      name: 'Test Request',
      description: 'Test Description',
      requests: [
        {
          url: 'https://example.com/test',
          method: 'POST',
          body: { key: 'value' },
          timeout: 10_000,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ],
      interval: 30,
      alerts: [],
    }
    const config = mapInsomniaRequestToConfig(req, {}, 'https://example.com')

    expect(config).to.deep.equal(expectedConfig)
  })
})
