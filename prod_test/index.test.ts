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
import { exec } from 'child_process'

describe('monika', () => {
  it('shows version', (done) => {
    exec(`monika -v`, (_, stdout) => {
      expect(stdout).to.contain('@hyperjumptech/monika/')
      done()
    })
  })

  it('shows error when no config', (done) => {
    exec(`monika`, (_, _stdout, stderr) => {
      expect(stderr).to.contain('Error')
      done()
    })
  })

  it('shows config generator link when no config', (done) => {
    exec(`monika`, (_, _stdout, stderr) => {
      expect(stderr).to.contain(
        'https://hyperjumptech.github.io/monika-config-generator/'
      )
      done()
    })
  })

  it('shows starting message with valid json config', (done) => {
    exec(`monika -c ./monika.example.json`, (_, stdout) => {
      expect(stdout).to.contain('Starting Monika.')
      done()
    })
  })

  it('shows starting message with valid yaml config', (done) => {
    exec(`monika -c ./monika.example.yml`, (_, stdout) => {
      expect(stdout).to.contain('Starting Monika.')
      done()
    })
  })
})
