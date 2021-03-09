import { request } from './request'
import { Probe } from '../interfaces/probe'
import { AxiosResponseWithExtraData } from '../interfaces/request'

export async function probing(probe: Probe) {
  try {
    const res = await request({
      ...probe.request,
    })
    return res as AxiosResponseWithExtraData
  } catch (error) {
    let errStatus
    let errData
    let errHdr

    if (error.response) {
      // Axios doesn't always return error response
      errStatus = error.response.status
      errData = error.response.data
      errHdr = error.response.headers
    } else {
      errStatus = 500 // TODO: how to detect timeouts?
      errData = ''
      errHdr = ''
    }

    return {
      data: errData,
      status: errStatus,
      statusText: 'ERROR',
      headers: errHdr,
      config: '',
      extraData: {
        requestStartedAt: 0,
        responseTime: 0,
      },
    } as AxiosResponseWithExtraData
  }
}
