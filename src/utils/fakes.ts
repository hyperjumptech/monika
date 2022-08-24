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

export default function registerFakes(
  handlebarsInstance: typeof Handlebars
): void {
  if (handlebarsInstance) {
    handlebarsInstance.registerHelper('alpha', (count: number) => {
      return faker.random.alpha({
        count: typeof count === 'number' ? count : 8,
      })
    })

    handlebarsInstance.registerHelper('alphaNumeric', (count: number) => {
      return faker.random.alphaNumeric(typeof count === 'number' ? count : 8)
    })

    handlebarsInstance.registerHelper('country', () => {
      return faker.address.country()
    })

    handlebarsInstance.registerHelper('countryCode', () => {
      return faker.address.countryCode()
    })

    handlebarsInstance.registerHelper('color', () => {
      return faker.color.human()
    })

    handlebarsInstance.registerHelper('currency', () => {
      return faker.finance.currencyCode()
    })

    handlebarsInstance.registerHelper('email', () => {
      return faker.internet.email()
    })

    handlebarsInstance.registerHelper('fullName', () => {
      return faker.name.fullName()
    })

    handlebarsInstance.registerHelper('gender', () => {
      return faker.name.gender(true)
    })

    handlebarsInstance.registerHelper('isostring', () => {
      return new Date().toISOString()
    })

    handlebarsInstance.registerHelper(
      'latitude',
      (min: number, max: number) => {
        return faker.address
          .latitude(
            typeof max === 'number' ? max : 90,
            typeof min === 'number' ? min : -90
          )
          .toString()
      }
    )

    handlebarsInstance.registerHelper('lines', (lineCount: number) => {
      return faker.lorem.lines(typeof lineCount === 'number' ? lineCount : 2)
    })

    handlebarsInstance.registerHelper(
      'longitude',
      (min: number, max: number) => {
        return faker.address
          .longitude(
            typeof max === 'number' ? max : 180,
            typeof min === 'number' ? min : -180
          )
          .toString()
      }
    )

    handlebarsInstance.registerHelper('number', (min: number, max: number) => {
      return faker.datatype
        .number({
          min: typeof min === 'number' ? min : 1000,
          max: typeof max === 'number' ? max : 1000,
        })
        .toString()
    })

    handlebarsInstance.registerHelper('objectId', () => {
      return faker.database.mongodbObjectId()
    })

    handlebarsInstance.registerHelper('statusCode', () => {
      return faker.internet.httpStatusCode().toString()
    })

    handlebarsInstance.registerHelper('timestamp', () => {
      return Date.now().toString()
    })

    handlebarsInstance.registerHelper('uuid', () => {
      return faker.datatype.uuid()
    })

    handlebarsInstance.registerHelper('word', () => {
      return faker.random.word()
    })

    handlebarsInstance.registerHelper('words', (count: number) => {
      return faker.random.words(typeof count === 'number' ? count : 3)
    })
  } else {
    throw new Error('Handlebars is not defined!')
  }
}
