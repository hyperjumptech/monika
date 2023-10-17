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

import sinon from 'sinon'
import { ux } from '@oclif/core'
import { test } from '@oclif/test'
import * as history from './history'
import cmd from '../../commands/monika'
import { flush } from './flush'

let flushAllLogsStub: sinon.SinonStub

beforeEach(() => {
  flushAllLogsStub = sinon.stub(history, 'flushAllLogs').resolves()
})

afterEach(() => {
  flushAllLogsStub.restore()
})

describe('Flush command', () => {
  describe('Force', () => {
    it('should flush records without asking for confirmation', async () => {
      // act
      await flush(true)

      // assert
      sinon.assert.calledOnce(flushAllLogsStub)
    })
  })

  describe('Not force', () => {
    test
      // TODO: Remove skip
      .skip()
      // arrange
      .stub(ux.ux, 'prompt', (stube) => stube.resolves('n'))
      .stdout()
      // act
      .do(() => cmd.run(['--flush']))
      .it('should cancel flush', () => {
        // assert
        sinon.assert.notCalled(flushAllLogsStub)
      })

    test
      // TODO: Remove skip
      .skip()
      // arrange
      .stub(ux.ux, 'prompt', (stube) => stube.resolves('Y'))
      .stdout()
      // act
      .do(() => cmd.run(['--flush']))
      .it('should flush', () => {
        // assert
        sinon.assert.calledOnce(flushAllLogsStub)
      })
  })
})
