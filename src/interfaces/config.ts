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

import type { RequestOptions } from 'node:https'
import type { Notification } from '@hyperjumptech/monika-notification'
import type { Probe } from './probe'

type DomainWithOptions = {
  domain: string
  options?: RequestOptions
}

export type Domain = string | DomainWithOptions

export type Certificate = {
  domains: Domain[]
  // The reminder is the number of days to send notification to user before the domain expires.
  reminder?: number
}

type DbLimit = {
  max_db_size: number
  deleted_data: number
  cron_schedule: string
}

export type SymonConfig = {
  id: string
  url: string
  key: string
  projectID: string
  organizationID: string
  interval?: number
}

export type Config = {
  probes: Probe[]
  certificate?: Certificate
  db_limit?: DbLimit
  notifications?: Notification[]
  'status-notification'?: string
  symon?: SymonConfig
  version?: string
}

export type ValidatedConfig = {
  'status-notification': string
  certificate?: Required<Certificate>
  db_limit?: DbLimit
  notifications: Notification[]
  probes: Probe[]
  symon?: SymonConfig
  version: string
}
