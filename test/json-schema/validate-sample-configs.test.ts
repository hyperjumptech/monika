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

import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import Ajv from 'ajv'

const ajv = new Ajv()

import mySchema from '../../src/monika-config-schema.json'

const validate = ajv.compile(mySchema)

const getAllFiles = function (dirPath: string, arrayOfFiles: string[]) {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  // files.forEach(function(file) {
  for (const file of files) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file))
    }
  }

  return arrayOfFiles
}

describe('validate example configs', () => {
  it('should detect examples that does not conform to the schema', () => {
    const files = getAllFiles('./config_sample', [])

    let sampleFile: any

    for (const file of files) {
      switch (path.extname(file)) {
        case '.yml':
        case '.yaml': {
          sampleFile = yaml.load(fs.readFileSync(file, 'utf8'))
          break
        }

        case '.json': {
          sampleFile = JSON.parse(fs.readFileSync(file, 'utf8'))
          break
        }

        default: {
          sampleFile = null
          continue
        } // skip for other file.extension
      }

      const isValid = validate(sampleFile)
      if (isValid === false) {
        console.error('file:', file, 'validity:', isValid)
        console.error('error:', validate.errors)
      }

      expect(isValid).to.be.true
    }
  })
})
