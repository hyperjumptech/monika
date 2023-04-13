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

import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { ProbeAlert } from './probe'

// RequestTypes are used to define the type of request that is being made.
export type RequestTypes =
  | 'http'
  | 'HTTP'
  | 'icmp'
  | 'ICMP'
  | 'tcp'
  | 'redis'
  | 'mariadb'
  | 'mongo'
  | 'postgres'

// ProbeRequestResponse is used to define the response from a probe requests.
export interface ProbeRequestResponse<T = any> {
  requestType?: RequestTypes // is this for http (default) or icmp  or others
  data: T
  body: T
  status: number

  headers: any
  responseTime: number

  isProbeResponsive: boolean // did the command/request response to requests/queries?
  errMessage?: string // any error message from drivers
}

// ProbeRequest is used to define the requests that is being made.
export interface RequestConfig extends Omit<AxiosRequestConfig, 'data'> {
  id?: string
  saveBody?: boolean // save response body to db?
  url: string
  body: JSON | string
  timeout: number // request timeout
  alerts?: ProbeAlert[]
  headers?: AxiosRequestHeaders
  ping?: boolean // is this request for a ping?
  allowUnauthorized?: boolean // ignore ssl cert?
}
