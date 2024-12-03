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

import childProcess from 'node:child_process'
import { existsSync } from 'node:fs'
import { rename, readFile, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import sinon from 'sinon'
import chai, { expect } from 'chai'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

import { getContext, resetContext, setContext } from '../../context/index.js'
import { getErrorMessage } from '../../utils/catch-error-handler.js'
import { createConfig } from './create.js'

describe('Create config', () => {
  describe('Open Monika config generator', () => {
    let osTypeStub: sinon.SinonStub
    let spawnSyncStub: sinon.SinonStub

    beforeEach(() => {
      osTypeStub = sinon.stub(os, 'type')
      spawnSyncStub = sinon.stub(childProcess, 'spawnSync')
    })

    afterEach(() => {
      osTypeStub.restore()
      spawnSyncStub.restore()
    })

    it('should open Monika config generator using MacOS', async () => {
      // arrange
      osTypeStub.returns('Darwin')

      // act
      await createConfig()

      // assert
      const command = spawnSyncStub.args[0][0]
      const url = spawnSyncStub.args[0][1][0]

      expect(command).eq('open')
      expect(url).eq('https://hyperjumptech.github.io/monika-config-generator/')
    })

    it('should open Monika config generator using Linux', async () => {
      // arrange
      osTypeStub.returns('Linux')

      // act
      await createConfig()

      // assert
      const command = spawnSyncStub.args[0][0]
      const url = spawnSyncStub.args[0][1][0]

      expect(command).eq('xdg-open')
      expect(url).eq('https://hyperjumptech.github.io/monika-config-generator/')
    })

    it('should open Monika config generator using Windows', async () => {
      // arrange
      osTypeStub.returns('Windows NT')

      // act
      await createConfig()

      // assert
      const command = spawnSyncStub.args[0][0]
      const url = spawnSyncStub.args[0][1][0]

      expect(command).eq('start')
      expect(url).eq('https://hyperjumptech.github.io/monika-config-generator/')
    })

    it('should throw an error on unhandled OS', async () => {
      // arrange
      let errorMessage = ''
      osTypeStub.returns('FreeBSD')

      // act
      try {
        await createConfig()
      } catch (error) {
        errorMessage = getErrorMessage(error)
      }

      // assert
      expect(errorMessage).to.include('Unknown operating system')
    })
  })

  describe('Converter', () => {
    afterEach(() => {
      resetContext()
    })

    it('should throw an error if file path is not found', async () => {
      // arrange
      const filepath = './example.har'
      setContext({ flags: { ...getContext().flags, har: filepath } })
      let errorMessage = ''

      // act
      try {
        await createConfig()
      } catch (error) {
        errorMessage = getErrorMessage(error)
      }

      // assert
      expect(errorMessage).to.include("Couldn't found")
    })

    it('should convert from har', async () => {
      // arrange
      const output = 'monika.har.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          output,
          har: './src/components/config/__tests__/form_encoded.har',
        },
      })

      // act
      await createConfig()

      // assert
      const generated = await readFile(output, { encoding: 'utf8' })
      const expected = await readFile(
        './src/components/config/__tests__/expected.har.yml',
        { encoding: 'utf8' }
      )
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from insomnia', async () => {
      // arrange
      const output = 'monika.insomnia.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          insomnia: './src/components/config/__tests__/petstore.insomnia.yaml',
          output,
        },
      })

      // act
      await createConfig()

      // assert
      const generated = await readFile(output, {
        encoding: 'utf8',
      })
      const expected = await readFile(
        './src/components/config/__tests__/expected.insomnia.yml',
        { encoding: 'utf8' }
      )
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from basic postman file v2.0', async () => {
      // arrange
      const output = 'monika.postman-basic.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          postman:
            './src/components/config/__tests__/mock_files/basic-postman_collection-v2.0.json',
          output,
        },
      })

      // act
      await createConfig()

      // assert
      const { generated, expected } = await getPostmanConfig()
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from grouped postman file v2.0', async () => {
      // arrange
      const output = 'monika.postman-grouped.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          postman:
            './src/components/config/__tests__/mock_files/grouped-postman_collection-v2.0.json',
          output,
        },
      })

      // act
      await createConfig()

      // assert
      const { generated, expected } = await getPostmanConfig(true)
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from basic postman file v2.1', async () => {
      // arrange
      const output = 'monika.postman-basic.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          postman:
            './src/components/config/__tests__/mock_files/basic-postman_collection-v2.0.json',
          output: 'monika.postman-basic.yml',
        },
      })

      // act
      await createConfig()

      // assert
      const { generated, expected } = await getPostmanConfig()
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from grouped postman file v2.1', async () => {
      // arrange
      const output = 'monika.postman-grouped.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          postman:
            './src/components/config/__tests__/mock_files/grouped-postman_collection-v2.1.json',
          output,
        },
      })

      // act
      await createConfig()

      // assert
      const { generated, expected } = await getPostmanConfig(true)
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from sitemap', async () => {
      // arrange
      const output = 'monika.sitemap.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          sitemap: './src/components/config/__tests__/sitemap.xml',
          output,
        },
      })

      // act
      await createConfig()

      // assert
      const generated = await readFile('monika.sitemap.yml', {
        encoding: 'utf8',
      })
      const expected = await readFile(
        './src/components/config/__tests__/expected.sitemap.yml',
        { encoding: 'utf8' }
      )
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from sitemap - one probe', async () => {
      // arrange
      const output = 'monika.sitemap.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          sitemap: './src/components/config/__tests__/sitemap.xml',
          output,
          'one-probe': true,
        },
      })

      // act
      await createConfig()

      // assert
      const generated = await readFile('monika.sitemap.yml', {
        encoding: 'utf8',
      })
      const expected = await readFile(
        './src/components/config/__tests__/expected.sitemap-oneprobe.yml',
        { encoding: 'utf8' }
      )
      expect(generated).eq(expected)

      await rm(output)
    })

    it('should convert from text', async () => {
      // arrange
      const output = 'monika.textfile.yml'
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          text: './src/components/config/__tests__/textfile',
          output,
        },
      })

      // act
      await createConfig()

      // assert
      const generated = await readFile('monika.textfile.yml', {
        encoding: 'utf8',
      })
      const expected = await readFile(
        './src/components/config/__tests__/expected.textfile.yml',
        { encoding: 'utf8' }
      )
      expect(generated).eq(expected)

      await rm(output)
    })
  })

  describe('Writer', () => {
    beforeEach(async () => {
      if (existsSync('monika.yml')) {
        await rename('monika.yml', 'monika.backup.yml')
      }
    })

    afterEach(async () => {
      if (existsSync('monika.backup.yml')) {
        await rename('monika.backup.yml', 'monika.yml')
      }

      resetContext()
    })

    it('should not prompt to overwrite existing file', async () => {
      // arrange
      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          text: './src/components/config/__tests__/textfile',
        },
      })
      await writeFile('monika.yml', '', { encoding: 'utf8' })

      // act
      await createConfig()

      // assert
      expect(existsSync('monika.yml')).eq(true)
      await rm('monika.yml')
    })

    it('should write config to the output flag', async () => {
      // arrange
      if (existsSync('monika.yaml')) {
        await rename('monika.yaml', 'monika.backup.yaml')
      }

      setContext({
        flags: {
          ...getContext().flags,
          force: true,
          output: 'monika.yaml',
          text: './src/components/config/__tests__/textfile',
        },
      })
      await writeFile('monika.yaml', '', { encoding: 'utf8' })

      // act
      await createConfig()

      // assert
      expect(existsSync('monika.yaml')).eq(true)
      await rm('monika.yaml')
      if (existsSync('monika.backup.yaml')) {
        await rename('monika.backup.yaml', 'monika.yaml')
      }
    })
  })
})

async function getPostmanConfig(isGrouped = false) {
  if (isGrouped) {
    const generated = await readFile('monika.postman-grouped.yml', {
      encoding: 'utf8',
    })
    const expected = await readFile(
      './src/components/config/__tests__/mock_files/expected.postman-grouped.yml',
      { encoding: 'utf8' }
    )

    return { generated, expected }
  }

  const generated = await readFile('monika.postman-basic.yml', {
    encoding: 'utf8',
  })
  const expected = await readFile(
    './src/components/config/__tests__/mock_files/expected.postman-basic.yml',
    { encoding: 'utf8' }
  )

  return { generated, expected }
}
