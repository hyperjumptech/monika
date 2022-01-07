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

beforeEach(() => {
  if (fs.existsSync('monika.har.yml')) {
    fs.unlinkSync('monika.har.yml')
  }

  if (fs.existsSync('monika.postman.yml')) {
    fs.unlinkSync('monika.postman.yml')
  }

  if (fs.existsSync('monika.insomnia.yml')) {
    fs.unlinkSync('monika.insomnia.yml')
  }
})

describe('Har config', () => {
  describe('Create config from har file', () => {
    it('should create config from har file', async () => {
      const flags = {
        har: './src/components/config/__tests__/form_encoded.har',
        output: 'monika.har.yml',
      }
      await createConfig(flags)
      expect(fs.lstatSync('monika.har.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.har.yml', 'utf-8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.har.yml',
        'utf-8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})

describe('Postman config', () => {
  describe('Create config from postman file', () => {
    it('should create config from postman file', async () => {
      const flags = {
        postman:
          './src/components/config/__tests__/simple.postman_collection.json',
        output: 'monika.postman.yml',
      }
      await createConfig(flags)
      expect(fs.lstatSync('monika.postman.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.postman.yml', 'utf-8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.postman.yml',
        'utf-8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})

describe('Insomnia config', () => {
  describe('Create config from insomnia file', () => {
    it('should create config from insomnia file', async () => {
      const flags = {
        insomnia: './src/components/config/__tests__/petstore.insomnia.yaml',
        output: 'monika.insomnia.yml',
      }
      await createConfig(flags)
      expect(fs.lstatSync('monika.insomnia.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.insomnia.yml', 'utf-8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.insomnia.yml',
        'utf-8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})
