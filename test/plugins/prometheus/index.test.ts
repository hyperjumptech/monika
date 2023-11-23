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

import { expect, test } from '@oclif/test'
import path from 'path'
import cmd from '../../../src/commands/monika'
import axios from 'axios'

const { resolve } = path

describe('Prometheus plugin', () => {
  describe('success', () => {
    test
      .stdout()
      .do(() =>
        cmd.run([
          '-c',
          resolve('./monika.example.json'),
          '--prometheus',
          '4444',
          '--repeat',
          '1',
        ])
      )
      .it('runs Prometheus metric server', async (ctx) => {
        // act
        const res = await axios.get('http://localhost:4444/metrics')

        // assert
        expect(ctx.stdout).to.contain('Starting Monika.')
        expect(res.status).to.equal(200)
      })
  })

  describe('failed', () => {
    test
      .stderr()
      .do(() => cmd.run(['--prometheus']))
      .exit(2)
      .it('exits when Prometheus metric server port is not specify')

    test
      .stdout()
      .do(() =>
        cmd.run([
          '-c',
          resolve('./monika.example.json'),
          '--prometheus',
          '4446',
          '--repeat',
          '1',
        ])
      )
      .it('runs Prometheus metric server but return 405', async () => {
        try {
          // act
          await axios.post('http://localhost:4446/metrics')
        } catch (error) {
          // assert
          expect(error.response.status).to.equal(405)
        }

        // eslint-disable-next-line unicorn/no-process-exit, no-process-exit
        process.exit(0)
      })
  })
})
