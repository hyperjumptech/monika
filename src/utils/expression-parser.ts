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

import { compileExpression as _compileExpression } from 'filtrex'
import lodash from 'lodash'

const {
  endsWith,
  get,
  has,
  includes,
  isEmpty,
  lowerCase,
  size,
  startsWith,
  upperCase,
} = lodash

// wrap substrings that are object accessor with double quote
// then wrap again with __getValueByPath function call
// eg: 'response.body.title' becomes '__getValueByPath("response.body.title")'
export const sanitizeExpression = (
  query: string,
  objectKeys: string[]
): string => {
  let sanitizedQuery = query

  for (const key of objectKeys) {
    const pattern = new RegExp(`(^| |\\()(${key}(\\.|\\[)\\S*[^\\s),])`, 'g')
    sanitizedQuery = sanitizedQuery.replace(pattern, '$1__getValueByPath("$2")')
  }

  return sanitizedQuery
}

export const compileExpression =
  (expression: string, objectKeys: string[] = []) =>
  (obj: object | object[]) => {
    const sanitizedExpression = sanitizeExpression(expression, objectKeys)

    return _compileExpression(sanitizedExpression, {
      extraFunctions: {
        __getValueByPath: (path: string) => get(obj, path), //  for internal use, not to be exposed to user
        has,
        lowerCase,
        upperCase,
        startsWith,
        endsWith,
        includes,
        size,
        isEmpty,
      },
    })(obj)
  }
