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

import events from '../../events'
import { LogObject } from '../../interfaces/logs'
import { Notification } from '../../interfaces/notification'
import { Probe } from '../../interfaces/probe'
import type { ProbeStateDetails } from '../../interfaces/probe-status'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import {
  printProbeLog,
  probeBuildLog,
  setNotificationLog,
  setAlert,
} from '../logger'
import { sendAlerts } from '../notification'
import validateResponse, {
  ValidateResponse,
} from '../../plugins/validate-response'
import { getLogsAndReport } from '../reporter'
import { getEventEmitter } from '../../utils/events'
import { processThresholds } from '../notification/process-server-status'
import { probing } from './probing'
import { log } from '../../utils/pino'

// TODO: move this to interface file?
interface ProbeStatusProcessed {
  probe: Probe
  statuses?: ProbeStateDetails[]
  notifications?: Notification[]
  validatedResponseStatuses: ValidateResponse[]
  totalRequests: number
}

interface ProbeSaveLogToDatabase
  extends Omit<
    ProbeStatusProcessed,
    'statuses' | 'totalRequests' | 'validatedResponseStatuses'
  > {
  index: number
  probeState?: ProbeStateDetails
}

interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  probeState?: ProbeStateDetails
}

// Probes Thresholds processed, Send out notifications/alerts.
async function checkThresholdsAndSendAlert(
  data: ProbeStatusProcessed,
  mLog: LogObject
) {
  const {
    probe,
    statuses,
    notifications,
    totalRequests,
    validatedResponseStatuses,
  } = data
  const probeSendNotification = async (data: ProbeSendNotification) => {
    const {
      index,
      probe,
      probeState,
      notifications,
      totalRequests,
      validatedResponseStatuses,
    } = data

    const statusString = probeState?.isDown ? 'DOWN' : 'UP'
    const url = probe.requests[totalRequests - 1].url ?? ''

    if ((notifications?.length ?? 0) > 0) {
      await sendAlerts({
        url: url,
        probeState: statusString,
        notifications: notifications ?? [],
        validation:
          validatedResponseStatuses.find(
            (validateResponse: ValidateResponse) =>
              validateResponse.alert.query === probeState?.alertQuery
          ) || validatedResponseStatuses[index],
      })
    }
  }
  const createNotificationLog = (
    data: ProbeSaveLogToDatabase,
    mLog: LogObject
  ): LogObject => {
    const { probe, probeState, notifications } = data

    const type =
      probeState?.probeState === 'UP_TRUE_EQUALS_THRESHOLD'
        ? 'NOTIFY-INCIDENT'
        : 'NOTIFY-RECOVER'

    if ((notifications?.length ?? 0) > 0) {
      Promise.all(
        notifications?.map((notification) => {
          mLog = setNotificationLog(
            {
              type,
              probe,
              alertQuery: probeState?.alertQuery || '',
              notification,
            },
            mLog
          )
        })!
      )
    }
    return mLog
  }

  statuses
    ?.filter((probeState) => probeState.shouldSendNotification)
    ?.forEach((probeState, index) => {
      probeSendNotification({
        index,
        probe,
        probeState,
        notifications,
        totalRequests,
        validatedResponseStatuses,
      }).catch((error: Error) => log.error(error.message))

      mLog = createNotificationLog(
        {
          index,
          probe,
          probeState,
          notifications,
        },
        mLog
      )
      printProbeLog(mLog)
      getLogsAndReport()
    })
}

/**
 * doProbe sends out the http request
 * @param {number} checkOrder the order of probe being processed
 * @param {object} probe contains all the probes
 * @param {array} notifications contains all the notifications
 */
export async function doProbe(
  checkOrder: number,
  probe: Probe,
  notifications?: Notification[]
) {
  const eventEmitter = getEventEmitter()
  const responses = []
  let validatedRes: ValidateResponse[] = []
  let probeRes: AxiosResponseWithExtraData = {} as AxiosResponseWithExtraData
  let totalRequests = 0 // is the number of requests in  probe.requests[x]
  let mLog: LogObject = {
    type: 'PROBE',
    iteration: 0,
    id: probe.id,
    responseCode: 0,
    url: '',
    method: 'GET', // GET must be pre-filled here since method '' (empty) is undefined
    responseTime: 0,
    alert: {
      flag: '',
      message: [],
    },
    notification: {
      flag: '',
      message: [],
    },
  } as LogObject

  try {
    for await (const request of probe.requests) {
      mLog.url = request.url
      probeRes = await probing(request, responses)

      eventEmitter.emit(events.probe.response.received, {
        probe,
        requestIndex: totalRequests,
        response: probeRes,
      })

      // combine global probe alerts with all individual request alerts
      const combinedAlerts = probe.alerts.concat(...(request.alerts || []))

      // Responses have been processed and validated
      const res = validateResponse(combinedAlerts, probeRes)
      validatedRes = res

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      // done probing, got the results, build logs
      mLog = probeBuildLog({
        checkOrder,
        probe,
        totalRequests,
        probeRes,
        alerts: validatedRes
          .filter((item) => item.hasSomethingToReport)
          .map((item) => item.alert),
        mLog,
      })

      // done one request, is there another
      totalRequests += 1

      // Exit the loop if there is any triggers triggered
      if (validatedRes.filter((item) => item.hasSomethingToReport).length > 0) {
        break
      }

      // done probes, no alerts, no notification.. now print log
      printProbeLog(mLog)
    }

    // done probing, got some result, process it, check for thresholds and notifications
    const statuses = processThresholds({
      checkOrder,
      probe,
      probeRes,
      totalRequests,
      validatedResp: validatedRes,
      mLog,
    })

    // Done processing results, check if need to send out alerts
    checkThresholdsAndSendAlert(
      {
        probe,
        statuses,
        notifications,
        totalRequests,
        validatedResponseStatuses: validatedRes,
      },
      mLog
    ).catch((error) => {
      mLog = setAlert({ flag: 'error', message: error }, mLog)
      printProbeLog(mLog)
    })
  } catch (error) {
    mLog = setAlert({ flag: 'error', message: error }, mLog)
    printProbeLog(mLog)
  }
}
