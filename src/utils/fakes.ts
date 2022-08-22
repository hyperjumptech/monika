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

export default {
  alpha: (): string => faker.random.alpha({ count: 8 }),
  alphaNumeric: (): string => faker.random.alphaNumeric(8),
  countryCode: (): string => faker.address.countryCode(),
  color: (): string => faker.color.human(),
  currency: (): string => faker.finance.currencyCode(),
  email: (): string => faker.internet.email(),
  fullName: (): string => faker.name.fullName(),
  gender: (): string => faker.name.gender(true),
  latitude: (): string => faker.address.latitude().toString(),
  lines: (): string => faker.lorem.lines(),
  longitude: (): string => faker.address.longitude().toString(),
  number: (): string => faker.datatype.number({ min: 1, max: 1000 }).toString(),
  objectId: (): string => faker.database.mongodbObjectId(),
  statusCode: (): string => faker.internet.httpStatusCode().toString(),
  timestamp: (): string => Date.now().toString(),
  uuid: (): string => faker.datatype.uuid(),
  word: (): string => faker.random.word(),
  words: (): string => faker.random.words(3),
}
