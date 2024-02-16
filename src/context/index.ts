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

import type { Config } from '../interfaces/config.js'
import type { ProbeAlert } from '../interfaces/probe.js'

import { type MonikaFlags, monikaFlagsDefaultValue } from '../flag.js'

export type Incident = {
  probeID: string
  probeRequestURL: string
  alert: ProbeAlert
  createdAt: Date
}

type Context = {
  // userAgent example: @hyperjumptech/monika/1.2.3 linux-x64 node-14.17.0
  userAgent: string
  incidents: Incident[]
  config?: Omit<Config, 'probes'>
  flags: MonikaFlags
}

type NewContext = Partial<Context>

const initialContext: Context = {
  userAgent: '',
  incidents: [],
  flags: monikaFlagsDefaultValue,
}

let context: Context = initialContext

export function getContext(): Context {
  return context
}

export function setContext(newContext: NewContext): void {
  context = { ...context, ...newContext }
}

export function resetContext(): void {
  context = initialContext
}
