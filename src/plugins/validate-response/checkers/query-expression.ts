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

import { compileExpression } from '../../../utils/expression-parser'
import { AxiosResponseWithExtraData } from '../../../interfaces/request'

/**
 * queryExpression runs a query against probe results
 * @param {Array} responses is the axios response objects
 * @param {number} responseIndex is the index of current response in responses array
 * @param {string} query is the query string to operate on the res object
 * @returns {boolean} true or false result of the query a
 */
const queryExpression = (
  responses: AxiosResponseWithExtraData[],
  responseIndex: number,
  query: string
) => {
  const response = responses[responseIndex]
  const object = {
    response: {
      size: Number(response.headers['content-length']),
      status: response.status,
      time: response.config.extraData?.responseTime,
      body: response.data,
      headers: response.headers,
    },
  }
  const compiledFn = compileExpression(query, Object.keys(object))

  return Boolean(compiledFn(object))
}

export default queryExpression
