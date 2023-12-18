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
import _ from 'lodash'

import type { MonikaFlags } from '../../../flag'
import { createConfig } from '../'

beforeEach(() => {
  if (fs.existsSync('monika.har.yml')) {
    fs.unlinkSync('monika.har.yml')
  }

  if (fs.existsSync('monika.postman-basic.yml')) {
    fs.unlinkSync('monika.postman-basic.yml')
  }

  if (fs.existsSync('monika.postman-grouped.yml')) {
    fs.unlinkSync('monika.postman-grouped.yml')
  }

  if (fs.existsSync('sitemap.xml')) {
    fs.unlinkSync('sitemap.xml')
  }

  if (fs.existsSync('monika.insomnia.yml')) {
    fs.unlinkSync('monika.insomnia.yml')
  }

  if (fs.existsSync('monika.sitemap.yml')) {
    fs.unlinkSync('monika.sitemap.yml')
  }
})

describe('Har config', () => {
  describe('Create config from har file', () => {
    it('should create config from har file', async () => {
      const flags = {
        har: './src/components/config/__tests__/form_encoded.har',
        output: 'monika.har.yml',
      } as MonikaFlags
      await createConfig(flags)
      expect(fs.lstatSync('monika.har.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.har.yml', 'utf8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.har.yml',
        'utf8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})

describe('Text config', () => {
  describe('Create config from text file', () => {
    it('should create config from text file', async () => {
      const flags = {
        text: './src/components/config/__tests__/textfile',
        output: 'monika.textfile.yml',
        force: true,
      } as MonikaFlags
      await createConfig(flags)
      expect(fs.lstatSync('monika.textfile.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.textfile.yml', 'utf8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.textfile.yml',
        'utf8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})

describe('Sitemap config', () => {
  describe('Create config from xml file', () => {
    it('should create config from xml file', async () => {
      const flags = {
        sitemap: './src/components/config/__tests__/sitemap.xml',
        output: 'monika.sitemap.yml',
      } as MonikaFlags
      await createConfig(flags)
      expect(fs.lstatSync('monika.sitemap.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.sitemap.yml', 'utf8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.sitemap.yml',
        'utf8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})

describe('Sitemap config [--one-probe ]', () => {
  describe('Create config from xml file', () => {
    it('should create config from xml file', async () => {
      const flags = {
        sitemap: './src/components/config/__tests__/sitemap.xml',
        output: 'monika.sitemap.yml',
        'one-probe': true,
      } as MonikaFlags
      await createConfig(flags)
      expect(fs.lstatSync('monika.sitemap.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.sitemap.yml', 'utf8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.sitemap-oneprobe.yml',
        'utf8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})

const getPostmanConfig = ({ grouped }: { grouped: boolean }) => {
  if (grouped) {
    const generated = fs.readFileSync('monika.postman-grouped.yml', 'utf8')

    const expected = fs.readFileSync(
      './src/components/config/__tests__/mock_files/expected.postman-grouped.yml',
      'utf8'
    )

    return { generated, expected }
  }

  const generated = fs.readFileSync('monika.postman-basic.yml', 'utf8')

  const expected = fs.readFileSync(
    './src/components/config/__tests__/mock_files/expected.postman-basic.yml',
    'utf8'
  )

  return { generated, expected }
}

describe('Postman config', () => {
  describe('Create config from postman file', () => {
    it('[v2.0] - should create config from basic postman file', async () => {
      const flags = {
        postman:
          './src/components/config/__tests__/mock_files/basic-postman_collection-v2.0.json',
        output: 'monika.postman-basic.yml',
      } as MonikaFlags

      await createConfig(flags)
      expect(fs.lstatSync('monika.postman-basic.yml').isFile()).to.be.true

      const { generated, expected } = getPostmanConfig({ grouped: false })
      expect(_.isEqual(generated, expected)).to.be.true
    })

    it('[v2.1] - should create config from basic postman file', async () => {
      const flags = {
        postman:
          './src/components/config/__tests__/mock_files/basic-postman_collection-v2.1.json',
        output: 'monika.postman-basic.yml',
      } as MonikaFlags

      await createConfig(flags)
      expect(fs.lstatSync('monika.postman-basic.yml').isFile()).to.be.true

      const { generated, expected } = getPostmanConfig({ grouped: false })
      expect(_.isEqual(generated, expected)).to.be.true
    })

    it('[v2.0] - should create config from grouped postman file', async () => {
      const flags = {
        postman:
          './src/components/config/__tests__/mock_files/grouped-postman_collection-v2.0.json',
        output: 'monika.postman-grouped.yml',
      } as MonikaFlags

      await createConfig(flags)
      expect(fs.lstatSync('monika.postman-grouped.yml').isFile()).to.be.true

      const { generated, expected } = getPostmanConfig({ grouped: true })
      console.log(generated)
      expect(_.isEqual(generated, expected)).to.be.true
    })

    it('[v2.1] - should create config from grouped postman file', async () => {
      const flags = {
        postman:
          './src/components/config/__tests__/mock_files/grouped-postman_collection-v2.1.json',
        output: 'monika.postman-grouped.yml',
      } as MonikaFlags

      await createConfig(flags)
      expect(fs.lstatSync('monika.postman-grouped.yml').isFile()).to.be.true

      const { generated, expected } = getPostmanConfig({ grouped: true })
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
      } as MonikaFlags
      await createConfig(flags)
      expect(fs.lstatSync('monika.insomnia.yml').isFile()).to.be.true

      const generated = fs.readFileSync('monika.insomnia.yml', 'utf8')
      const expected = fs.readFileSync(
        './src/components/config/__tests__/expected.insomnia.yml',
        'utf8'
      )
      expect(_.isEqual(generated, expected)).to.be.true
    })
  })
})
