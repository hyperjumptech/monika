import { exec } from 'child_process'
import { differenceInMilliseconds } from 'date-fns'
import type { ProbeRequestResponse } from '../../../../interfaces/request'
import { probeRequestResult } from '../../../../interfaces/request'
import type { Script } from '../../../../interfaces/probe'

export async function scriptRequest(
  params: Script
): Promise<ProbeRequestResponse> {
  return new Promise((resolve) => {
    const { cmd, workingDir } = params
    const timeout = params.timeout || 10_000

    const startTime = new Date()
    const response: ProbeRequestResponse = {
      requestType: 'script',
      body: '',
      status: 0,
      responseTime: 0,
      result: probeRequestResult.unknown,
      data: '',
      headers: '',
    }

    try {
      exec(
        cmd,
        { cwd: workingDir, timeout },
        (error: any, body, errMessage) => {
          const endTime = new Date()
          response.responseTime = differenceInMilliseconds(endTime, startTime)

          response.body = body
          if (error) {
            response.status = error?.code || 1
            response.body = errMessage
            response.errMessage = errMessage
            response.result =
              response.status === 0
                ? probeRequestResult.success
                : probeRequestResult.failed
          }

          resolve(response)
        }
      )
    } catch (error: any) {
      response.status = 0
      response.errMessage = error.message
      const endTime = new Date()
      response.responseTime = differenceInMilliseconds(endTime, startTime)
      resolve(response)
    }
  })
}
