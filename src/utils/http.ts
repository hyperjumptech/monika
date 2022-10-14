import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import http from 'http'
import https from 'https'

// Keep the agents alive to reduce the overhead of DNS queries and creating TCP connection.
// More information here: https://rakshanshetty.in/nodejs-http-keep-alive/
const httpAgent = new http.Agent({ keepAlive: true })
const httpsAgent = new https.Agent({ keepAlive: true })
export const DEFAULT_TIMEOUT = 10_000

// Create an instance of axios here so it will be reused instead of creating a new one all the time.
const axiosInstance = axios.create()

export async function sendHttpRequest(
  config: AxiosRequestConfig
): Promise<AxiosResponse> {
  const resp = await axiosInstance.request({
    ...config,
    timeout: config.timeout ?? DEFAULT_TIMEOUT,
    httpAgent,
    httpsAgent,
  })

  return resp
}
