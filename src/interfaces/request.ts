import { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ExtraData {
  requestStartedAt: number
  responseTime: number
}

export interface AxiosRequestConfigWithExtraData extends AxiosRequestConfig {
  extraData?: ExtraData
}

export interface AxiosResponseWithExtraData extends AxiosResponse {
  config: AxiosRequestConfigWithExtraData
}

export interface RequestConfig extends Omit<AxiosRequestConfig, 'data'> {
  body: JSON
  timeout: number
}
