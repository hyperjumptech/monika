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

import { faker } from '@faker-js/faker'

/**
 * wrapFunctionWithDefaultAndTransform returns a function to be registered to Handlebars helper
 * alongside with the default args and transformed args
 * @param originFn is the original function to be registered as helper
 * @param defaultArgs is the default args
 * @param transformArgs is if the parameter will be transformed for the original function
 * @returns Handlebars-helper-friendly function
 */
const wrapFunctionWithDefaultAndTransform =
  (originFn: any, defaultArgs: any, transformArgs?: (args: any[]) => any) =>
  (...arg: any) => {
    let newArgs = [...arg.slice(0, -1), ...defaultArgs.slice(arg.length - 1)]

    // If there is transformArgs method, transform the newArgs
    if (transformArgs) {
      newArgs = [transformArgs(newArgs)]
    }

    // Return the handlebars-helper-friendly function
    return originFn(...newArgs)
  }

// Functions from faker
const helpers = [
  {
    fn: faker.random.alpha,
    expr: 'alpha',
    default: [8],
  },
  { fn: faker.random.alphaNumeric, expr: 'alphaNumeric', default: [8] },
  { fn: faker.address.country, expr: 'country' },
  { fn: faker.address.countryCode, expr: 'countryCode' },
  { fn: faker.color.human, expr: 'color' },
  { fn: faker.finance.currencyCode, expr: 'currency' },
  { fn: () => faker.internet.email().toLowerCase(), expr: 'email' },
  { fn: faker.name.fullName, expr: 'fullName' },
  { fn: faker.name.gender, expr: 'gender', default: [true] },
  { fn: faker.address.latitude, expr: 'latitude', default: [90, -90, 4] },
  { fn: faker.address.longitude, expr: 'longitude', default: [180, -180, 4] },
  { fn: faker.lorem.lines, expr: 'lines', default: [1] },
  {
    fn: faker.datatype.number,
    expr: 'number',
    default: [0, 100],
    transformArgs: (args: any[]) => ({ min: args[0], max: args[1] }),
  },
  { fn: faker.database.mongodbObjectId, expr: 'objectId' },
  { fn: faker.internet.httpStatusCode, expr: 'statusCode' },
  { fn: faker.datatype.uuid, expr: 'uuid' },
  { fn: faker.random.word, expr: 'word' },
  { fn: faker.random.words, expr: 'words', default: [3] },

  { fn: () => Date.now().toString(), expr: 'timestamp' },
  { fn: () => new Date().toISOString(), expr: 'isodate' },
]

/**
 * registerFakes registers all the fake data to the Handlebars
 * by the handlebarsInstance passed through params
 * @param handlebarsInstance is the handlebars instance
 * @returns void
 */
export default function registerFakes(
  handlebarsInstance: typeof Handlebars
): void {
  if (handlebarsInstance) {
    // Map the functions from helpers
    for (const helper of helpers) {
      handlebarsInstance.registerHelper(
        helper.expr,
        wrapFunctionWithDefaultAndTransform(
          helper.fn,
          helper.default || [],
          helper.transformArgs
        )
      )
    }
  } else {
    throw new Error('Handlebars is not defined!')
  }
}
