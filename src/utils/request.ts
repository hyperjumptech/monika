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

import axios from 'axios'
import {
  AxiosRequestConfigWithExtraData,
  AxiosResponseWithExtraData,
  RequestConfig,
} from '../interfaces/request'

const responseInterceptor = (axiosResponse: AxiosResponseWithExtraData) => {
  const start = axiosResponse?.config.extraData?.requestStartedAt!
  const responseTime = new Date().getTime() - start

  const data = {
    ...axiosResponse,
    config: {
      ...axiosResponse?.config,
      extraData: {
        ...axiosResponse?.config.extraData,
        responseTime,
      },
    },
  }

  return data
}

export const request = async (config: RequestConfig) => {
  const axiosInstance = axios.create()
  axiosInstance.interceptors.request.use(
    (axiosRequestConfig: AxiosRequestConfigWithExtraData) => {
      const data = {
        ...axiosRequestConfig,
        extraData: {
          ...axiosRequestConfig?.extraData,
          requestStartedAt: new Date().getTime(),
        },
      }
      return data
    }
  )
  axiosInstance.interceptors.response.use(
    (axiosResponse: AxiosResponseWithExtraData) => {
      const data = responseInterceptor(axiosResponse)
      return data
    },
    (axiosResponse: AxiosResponseWithExtraData) => {
      const data = responseInterceptor(axiosResponse)
      throw data
    }
  )
  return axiosInstance.request({
    ...config,
    data: config.body,
  })
}
