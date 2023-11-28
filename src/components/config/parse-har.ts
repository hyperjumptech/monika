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

import { Config } from '../../interfaces/config'
import { RequestConfig } from '../../interfaces/request'

const convertNameValueArraysToObject = (
  headers: {
    name: string
    value: any
  }[]
) => {
  const obj: any = {}
  for (const item of headers) {
    if (item.name.charAt(0) !== ':') {
      obj[item.name] = item.value
    }
  }

  return obj
}

const parsePostData = (postData: any) => {
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
    const harJson = JSON.parse(fileContents)

    const harRequest: RequestConfig[] = harJson.log.entries.map(
      (entry: { request: any }) => ({
        method: entry.request.method,
        url: entry.request.url,
        headers: convertNameValueArraysToObject(entry.request.headers),
        params: convertNameValueArraysToObject(entry.request.queryString),
        body: parsePostData(entry.request.postData),
      })
    )

    const harConfig: any = {
      probes: [
        {
          id: harRequest[0].url,
          requests: harRequest,
        },
      ],
    }

    return harConfig
  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      throw new Error('Har file is in invalid JSON format!')
    }

    throw new Error(error.message)
  }
}
