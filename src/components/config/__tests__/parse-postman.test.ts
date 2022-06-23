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

import { expect } from 'chai'
import { values } from 'lodash'
import { Config } from '../../../interfaces/config'
import { parseConfigFromPostman } from '../parse-postman'
import basicCollectionV20 from './mock_files/basic-postman_collection-v2.0.json'
import basicCollectionV21 from './mock_files/basic-postman_collection-v2.1.json'
import groupedCollectionV20 from './mock_files/grouped-postman_collection-v2.0.json'
import groupedCollectionV21 from './mock_files/grouped-postman_collection-v2.1.json'
import unsupportedCollection from './mock_files/postman_collection-unsupported.json'

describe('parseConfigFromPostman', () => {
  it('throws invalid JSON format', () => {
    try {
      parseConfigFromPostman('../fetch.ts')
    } catch (error) {
      expect(() => {
        throw error
      }).to.throw('Your Postman file contains an invalid JSON format!')
    }
  })

  it('throws unsupported collection version', () => {
    try {
      const collectionStr = JSON.stringify(unsupportedCollection)

      parseConfigFromPostman(collectionStr)
    } catch (error) {
      expect(() => {
        throw error
      }).to.throw(
        'Your Postman collection version is not supported. Please use v2.0 or v2.1!'
      )
    }
  })

  describe('basic Postman collection', () => {
    it('[v2.0] - should converted to Monika config', () => {
      const collectionStr = JSON.stringify(basicCollectionV20)
      const config: Config = parseConfigFromPostman(collectionStr)

      expect(config.probes.length).to.equals(2)

      for (const [index, item] of basicCollectionV20.item.entries()) {
        expect(item.name).to.equals(config.probes[index].name)

        for (const req of config.probes[index].requests) {
          expect(req.url).to.equals(item.request.url)
          expect(req.method).to.equals(item.request.method)
          expect(values(req.headers).length).to.equals(
            item.request.header.length
          )
          expect(req.body).to.deep.equal(
            JSON.parse(item.request.body?.raw ?? '{}')
          )
        }
      }
    })

    it('[v2.1] - should converted to Monika config', () => {
      const collectionStr = JSON.stringify(basicCollectionV21)
      const config: Config = parseConfigFromPostman(collectionStr)

      expect(config.probes.length).to.equals(2)

      for (const [index, item] of (basicCollectionV21 as any).item.entries()) {
        expect(item.name).to.equals(config.probes[index].name)

        for (const req of config.probes[index].requests) {
          expect(req.url).to.equals(item.request.url?.raw)
          expect(req.method).to.equals(item.request.method)
          expect(values(req.headers).length).to.equals(
            item.request.header.length
          )
          expect(req.body).to.deep.equals(
            JSON.parse(item.request.body?.raw ?? '{}')
          )
        }
      }
    })
  })

  describe('grouped Postman collection', () => {
    it('[v2.0] - should converted to Monika config', () => {
      const collectionStr = JSON.stringify(groupedCollectionV20)
      const config: Config = parseConfigFromPostman(collectionStr)

      expect(config.probes.length).to.equals(2)

      for (const [index, item] of groupedCollectionV20.item.entries()) {
        expect(item.name).to.equals(config.probes[index].name)

        for (const [rIndex, req] of config.probes[index].requests.entries()) {
          expect(req.url).to.equals(item.item[rIndex].request.url)
          expect(req.method).to.equals(item.item[rIndex].request.method)
          expect(values(req.headers).length).to.equals(
            item.item[rIndex].request.header.length
          )
          expect(req.body).to.deep.equals(
            JSON.parse(item.item[rIndex].request.body?.raw ?? '{}')
          )
        }
      }
    })

    it('[v2.1] - should converted to Monika config', () => {
      const collectionStr = JSON.stringify(groupedCollectionV21)
      const config: Config = parseConfigFromPostman(collectionStr)

      expect(config.probes.length).to.equals(2)

      for (const [index, item] of (
        groupedCollectionV21 as any
      ).item.entries()) {
        expect(item.name).to.equals(config.probes[index].name)

        for (const [rIndex, req] of config.probes[index].requests.entries()) {
          expect(req.url).to.equals(item.item[rIndex].request.url?.raw)
          expect(req.method).to.equals(item.item[rIndex].request.method)
          expect(values(req.headers).length).to.equals(
            item.item[rIndex].request.header.length
          )
          expect(req.body).to.deep.equals(
            JSON.parse(item.item[rIndex].request.body?.raw ?? '{}')
          )
        }
      }
    })
  })
})
