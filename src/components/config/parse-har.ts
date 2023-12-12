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

import Joi from 'joi'
import { Config } from '../../interfaces/config'
import { RequestConfig } from '../../interfaces/request'
import { DEFAULT_INTERVAL } from './validation/validator/default-values'

const keyValValidator = Joi.array().items(
  Joi.object({ key: Joi.string(), value: Joi.string() })
)

const convertNameValueArraysToObject = (
  keyVal: { name: string; value: string }[]
) => {
  const obj: Record<string, string> = {}
  for (const item of keyVal) {
    if (item.name.charAt(0) !== ':') {
      obj[item.name] = item.value
    }
  }

  return obj
}

const postDataValidator = Joi.object({
  mimeType: Joi.string(),
  text: Joi.string(),
  params: keyValValidator.optional(),
})

const parsePostData = (
  postData: { mimeType: string; text: string } | undefined
) => {
  if (!postData) {
    return {}
  }

  if (postData.mimeType === 'application/json') {
    return JSON.parse(postData.text)
  }

  return postData.text
}

export const parseHarFile = (fileContents: string): Config => {
  // Read file from filepath
  try {
    const entryValidator = Joi.object({
      entry: Joi.object({
        request: Joi.object({
          method: Joi.string(),
          url: Joi.string(),
          headers: Joi.array().items(keyValValidator),
          queryString: Joi.array().items(keyValValidator),
          postData: postDataValidator,
        }),
      }),
    })

    const { value: harJson, error } = Joi.object({
      log: Joi.object({
        entries: Joi.array().items(entryValidator.required()),
      }),
    }).validate(JSON.parse(fileContents))

    if (error) throw new Error('No HTTP requests in your HAR file')

    const harRequest: RequestConfig[] = harJson.log.entries.map(
      (entry: {
        request: {
          method: string
          url: string
          headers: { name: string; value: string }[]
          queryString: { name: string; value: string }[]
          postData?: { mimeType: string; text: string }
        }
      }) => ({
        method: entry.request.method,
        url: entry.request.url,
        headers: convertNameValueArraysToObject(entry.request.headers),
        params: convertNameValueArraysToObject(entry.request.queryString),
        body: parsePostData(entry.request.postData),
      })
    )

    const harConfig: Config = {
      probes: [
        {
          id: harRequest[0].url,
          name: harRequest[0].url,
          interval: DEFAULT_INTERVAL,
          requests: harRequest,
          alerts: [],
        },
      ],
    }

    return harConfig
  } catch (error: unknown) {
    const parsingError =
      error instanceof Error ? error : new Error(`Parsing failed: ${error}.`)
    if (parsingError.name === 'SyntaxError') {
      throw new Error('Har file is in invalid JSON format!')
    }

    throw new Error(parsingError.message)
  }
}
