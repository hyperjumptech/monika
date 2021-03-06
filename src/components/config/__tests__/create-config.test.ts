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
import fs from 'fs'
import { createConfig } from '..'
import _ from 'lodash'

afterEach(() => {
  if (fs.existsSync('monika.har.json')) {
    fs.unlinkSync('monika.har.json')
  }

  if (fs.existsSync('monika.postman.json')) {
    fs.unlinkSync('monika.postman.json')
  }
})

describe('Har config', () => {
  describe('Create config from har file', () => {
    it('should create config from har file', async () => {
      const flags = {
        har: './src/components/config/__tests__/form_encoded.har',
        output: 'monika.har.json',
      }
      await createConfig(flags)
      expect(fs.lstatSync('monika.har.json').isFile()).to.be.true

      const generated = fs.readFileSync('monika.har.json', 'utf-8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.har.json',
        'utf-8'
      )
      expect(_.isEqual(JSON.parse(generated), JSON.parse(expected))).to.be.true
    })
  })
})

describe('Postman config', () => {
  describe('Create config from postman file', () => {
    it('should create config from postman file', async () => {
      const flags = {
        postman:
          './src/components/config/__tests__/simple.postman_collection.json',
        output: 'monika.postman.json',
      }
      await createConfig(flags)
      expect(fs.lstatSync('monika.postman.json').isFile()).to.be.true

      const generated = fs.readFileSync('monika.postman.json', 'utf-8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.postman.json',
        'utf-8'
      )
      expect(_.isEqual(JSON.parse(generated), JSON.parse(expected))).to.be.true
    })
  })
})
