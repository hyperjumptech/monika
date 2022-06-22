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
import { Config } from '../../../interfaces/config'
import { parseConfigFromPostman } from '../parse-postman'
import simpleEndpointsPostmanJson from './simple.postman_collection.json'
import groupedEndpointsPostmanJson from './grouped.postman_collection.json'

describe('parseConfigFromPostman', () => {
  describe('simple endpoints', () => {
    it('should converted to json', () => {
      const config: Config = parseConfigFromPostman(
        JSON.stringify(simpleEndpointsPostmanJson)
      )
      expect(config.probes[0].requests[0].url).to.equals(
        simpleEndpointsPostmanJson.item[0].request.url.raw
      )
    })

    it('should return not valid', () => {
      try {
        parseConfigFromPostman('../fetch.ts')
      } catch (error) {
        expect(() => {
          throw error
        }).to.throw('Your Postman file contains an invalid JSON format!')
      }
    })
  })

  describe('grouped endpoints', () => {
    it('should converted to json', () => {
      const config: Config = parseConfigFromPostman(
        JSON.stringify(groupedEndpointsPostmanJson)
      )
      expect(config.probes[0].requests[0].url).to.equals(
        groupedEndpointsPostmanJson.item[0].item[0].request.url.raw
      )
      expect(config.probes[1].requests[0].url).to.equals(
        groupedEndpointsPostmanJson.item[1].item[0].request.url.raw
      )
    })
  })
})
