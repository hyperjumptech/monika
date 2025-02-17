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
import { checkTLS } from '../tls-checker/index.js'
import { getErrorMessage } from '../../utils/catch-error-handler.js'

describe('TLS Checker', () => {
  describe('fail attempt', () => {
    it('should check expired domain', async () => {
      // arrange
      const url = 'expired.badssl.com'

      try {
        // act
        await checkTLS(url)
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        // assert
        expect(message).to.include(`${url} security certificate has expired at`)
      }
    })

    it('tests example.com with long cert expiry threshold', async () => {
      // arrange
      const url = 'example.com'

      try {
        // act
        await checkTLS(url)
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        // assert
        expect(message).to.include(`${url} security certificate will expire at`)
      }
    })
  })

  describe('success attempt', () => {
    it('tests example.com', async () => {
      // arrange
      const url = 'example.com'

      try {
        // act
        const result = await checkTLS(url)
        // assert
        expect(result).to.equal(null)
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        // assert when example.com certificate will expire
        // because nothing lasts forever
        expect(message).to.include(`${url} security certificate will expire at`)
      }
    })

    it('tests example.com with custom options', async () => {
      // arrange
      const domainDef = {
        domain: 'example.com',
        options: {
          path: '/foo',
        },
      }

      try {
        // act
        const result = await checkTLS(domainDef)
        // assert
        expect(result).to.equal(null)
      } catch (error: unknown) {
        const message = getErrorMessage(error)
        // assert when example.com certificate will expire
        // because nothing lasts forever
        expect(message).to.include(
          `${domainDef.domain} security certificate will expire at`
        )
      }
    })
  })
})
