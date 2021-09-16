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
import type { ServerAlertState } from '../../interfaces/probe-status'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import validateResponse, {
  ValidatedResponse,
} from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import {
  printProbeLog,
  probeBuildLog,
  setAlert,
  setNotificationLog,
} from '../logger'
import { sendAlerts } from '../notification'
import { processThresholds } from '../notification/process-server-status'
import { getLogsAndReport } from '../reporter'
import { probing } from './probing'

// TODO: move this to interface file?
interface ProbeStatusProcessed {
  probe: Probe
  statuses?: ServerAlertState[]
  notifications?: Notification[]
  validatedResponseStatuses: ValidatedResponse[]
  totalRequests: number
}

interface ProbeSaveLogToDatabase
  extends Omit<
    ProbeStatusProcessed,
    'statuses' | 'totalRequests' | 'validatedResponseStatuses'
  > {
  index: number
  probeState?: ServerAlertState
}

interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  probeState?: ServerAlertState
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

    const statusString = probeState?.state ?? 'UP'
    const url = probe.requests[totalRequests - 1].url ?? ''

    if ((notifications?.length ?? 0) > 0) {
      await sendAlerts({
        url: url,
        probeState: statusString,
        notifications: notifications ?? [],
        validation:
          validatedResponseStatuses.find(
            (validateResponse: ValidatedResponse) =>
              validateResponse.alert.query === probeState?.alertQuery
          ) || validatedResponseStatuses[index],
      })
    }
  }

  const createNotificationLog = (
    data: ProbeSaveLogToDatabase,
    mLog: LogObject
  ) => {
    const { probe, probeState, notifications } = data

    const type =
      probeState?.state === 'DOWN' ? 'NOTIFY-INCIDENT' : 'NOTIFY-RECOVER'

    if (notifications?.length) {
      notifications.forEach((notification) => {
        setNotificationLog(
          {
            type,
            probe,
            alertQuery: probeState?.alertQuery || '',
            notification,
          },
          mLog
        )
      })
    }
  }

  validatedResponseStatuses
    .filter((validation) => validation.isAlertTriggered)
    .forEach((validation) => {
      setAlert(
        {
          flag: 'ALERT',
          message: validation.alert.query,
        },
        mLog
      )
    })

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

      createNotificationLog(
        {
          index,
          probe,
          probeState,
          notifications,
        },
        mLog
      )

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
  let probeRes: AxiosResponseWithExtraData = {} as AxiosResponseWithExtraData
  let totalRequests = 0 // is the number of requests in  probe.requests[x]
  const mLog: LogObject = {
    type: 'PROBE',
    iteration: 0,
    probeId: probe.id,
    responseCode: 0,
    url: '',
    method: 'GET', // GET must be pre-filled here since method '' (empty) is undefined
    responseTime: 0,
    alert: {
      flag: '',
      messages: [],
    },
    notification: {
      flag: '',
      messages: [],
    },
  }

  try {
    for (const request of probe.requests) {
      mLog.url = request.url
      // intentionally wait for a request to finish before processing next request in loop
      // eslint-disable-next-line no-await-in-loop
      probeRes = await probing(request, responses)

      eventEmitter.emit(events.probe.response.received, {
        probe,
        requestIndex: totalRequests,
        response: probeRes,
      })

      // combine global probe alerts with all individual request alerts
      const combinedAlerts = probe.alerts.concat(...(request.alerts || []))

      // Responses have been processed and validated
      const validatedResponse = validateResponse(combinedAlerts, probeRes)

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      // done probing, got the results, build logs
      probeBuildLog({
        checkOrder,
        probe,
        totalRequests,
        probeRes,
        alerts: validatedResponse
          .filter((item) => item.isAlertTriggered)
          .map((item) => item.alert),
        mLog,
      })

      // done one request, is there another
      totalRequests += 1

      // done probing, got some result, process it, check for thresholds and notifications
      const statuses = processThresholds({
        probe,
        requestIndex: totalRequests - 1,
        validatedResponse,
      })

      // Done processing results, check if need to send out alerts
      checkThresholdsAndSendAlert(
        {
          probe,
          statuses,
          notifications,
          totalRequests,
          validatedResponseStatuses: validatedResponse,
        },
        mLog
      ).catch((error) => {
        setAlert({ flag: 'error', message: error }, mLog)
      })

      printProbeLog(mLog)

      // Exit the loop if there is any alert triggered
      if (validatedResponse.some((item) => item.isAlertTriggered)) {
        break
      }
    }
  } catch (error) {
    setAlert({ flag: 'error', message: error }, mLog)
    printProbeLog(mLog)
  }
}
