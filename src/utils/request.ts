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
