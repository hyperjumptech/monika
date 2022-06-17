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
import { Notification } from '../../interfaces/notification'
import { Probe } from '../../interfaces/probe'
import type { ServerAlertState } from '../../interfaces/probe-status'
import { ProbeRequestResponse } from '../../interfaces/request'
import validateResponse, {
  ValidatedResponse,
} from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import { RequestLog } from '../logger'
import { sendAlerts } from '../notification'
import { processThresholds } from '../notification/process-server-status'
import { probing } from './probing'
import { logResponseTime } from '../logger/response-time-log'
import { check } from '../tcp-request'

// TODO: move this to interface file?
interface ProbeStatusProcessed {
  probe: Probe
  statuses?: ServerAlertState[]
  notifications: Notification[]
  validatedResponseStatuses: ValidatedResponse[]
  requestIndex: number
}

interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  probeState?: ServerAlertState
}

const probeSendNotification = async (data: ProbeSendNotification) => {
  const eventEmitter = getEventEmitter()

  const {
    index,
    probe,
    probeState,
    notifications,
    requestIndex,
    validatedResponseStatuses,
  } = data

  const statusString = probeState?.state ?? 'UP'
  const url = probe.requests?.[requestIndex]?.url ?? ''
  const validation =
    validatedResponseStatuses.find(
      (validateResponse: ValidatedResponse) =>
        validateResponse.alert.query === probeState?.alertQuery
    ) || validatedResponseStatuses[index]

  eventEmitter.emit(events.probe.notification.willSend, {
    probeID: probe.id,
    url: url,
    probeState: statusString,
    validation,
  })

  if ((notifications?.length ?? 0) > 0) {
    await sendAlerts({
      probeID: probe.id,
      url,
      probeState: statusString,
      notifications: notifications ?? [],
      validation,
    })
  }
}

// Probes Thresholds processed, Send out notifications/alerts.
async function checkThresholdsAndSendAlert(
  data: ProbeStatusProcessed,
  requestLog: RequestLog
) {
  const {
    probe,
    statuses,
    notifications,
    requestIndex,
    validatedResponseStatuses,
  } = data

  statuses
    ?.filter((probeState) => !probeState.isFirstTime)
    ?.filter((probeState) => probeState.shouldSendNotification)
    ?.forEach((probeState, index) => {
      probeSendNotification({
        index,
        probe,
        probeState,
        notifications,
        requestIndex,
        validatedResponseStatuses,
      }).catch((error: Error) => log.error(error.message))

      requestLog.addNotifications(
        (notifications ?? []).map((notification) => ({
          notification,
          type:
            probeState?.state === 'DOWN' ? 'NOTIFY-INCIDENT' : 'NOTIFY-RECOVER',
          alertQuery: probeState?.alertQuery || '',
        }))
      )
    })
}

/**
 * doProbe sends out the http request
 * @param {number} checkOrder the order of probe being processed
 * @param {object} probe contains all the probes
 * @param {array} notifications contains all the notifications
 * @param {boolean} verboseLogs flag for log verbosity
 * @returns {Promise<void>} void
 */
export async function doProbe(
  checkOrder: number,
  probe: Probe,
  notifications: Notification[],
  verboseLogs: boolean
): Promise<void> {
  const eventEmitter = getEventEmitter()
  const responses = []

  if (probe?.socket) {
    const { id, socket } = probe
    const { host, port, data } = socket
    const url = `${host}:${port}`
    const tcpRequestID = `tcp-${id}`
    const { duration, status } = await check({ host, port, data })
    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} [TCP] ${url} ${duration}ms`
    const isAlertTriggered = status === 'DOWN'

    isAlertTriggered ? log.warn(logMessage) : log.info(logMessage)
    logResponseTime(duration)

    // let TCPrequestIndex = 0 // are there multiple tcp requests?
    // TCPrequestIndex < probe?.requests?.length;  // multiple tcp request, for later support
    // TCPrequestIndex++                           // for later supported
    const TCPrequestIndex = 0

    processTCPRequestResult({
      probe,
      tcpRequestID,
      responseTime: duration,
      isAlertTriggered,
      notifications,
      requestIndex: TCPrequestIndex,
      verboseLogs,
    }).catch((error) => log.error(error.message))
  }

  for (
    let requestIndex = 0;
    requestIndex < probe?.requests?.length;
    requestIndex++
  ) {
    const request = probe.requests?.[requestIndex]
    const requestLog = new RequestLog(probe, requestIndex, checkOrder)

    try {
      // intentionally wait for a request to finish before processing next request in loop
      // eslint-disable-next-line no-await-in-loop
      const probeRes: ProbeRequestResponse = await probing(request, responses)

      logResponseTime(probeRes.responseTime)

      eventEmitter.emit(events.probe.response.received, {
        probe,
        requestIndex,
        response: probeRes,
      })

      // Add to a response array to be accessed by another request
      responses.push(probeRes)

      requestLog.setResponse(probeRes)

      // store request error log
      if ([0, 1, 2, 3, 4, 599].includes(probeRes.status)) {
        const errorMessageMap: Record<number, string> = {
          0: 'URI not found', // axios error
          1: 'Connection reset', // axios error
          2: 'Connection refused', // axios error
          3: 'Unknown error', // axios error
          4: 'Ping timed out', // ping error
          599: 'Request Timed out', // axios error
        }

        requestLog.addError(errorMessageMap[probeRes.status])
      }

      // combine global probe alerts with all individual request alerts
      const probeAlerts = probe.alerts ?? []
      const combinedAlerts = probeAlerts.concat(...(request.alerts || []))

      // Responses have been processed and validated
      const validatedResponse = validateResponse(combinedAlerts, probeRes)

      requestLog.addAlerts(
        validatedResponse
          .filter((item) => item.isAlertTriggered)
          .map((item) => item.alert)
      )

      // done probing, got some result, process it, check for thresholds and notifications
      const statuses = processThresholds({
        probe,
        requestIndex,
        validatedResponse,
      })

      // Done processing results, check if need to send out alerts
      checkThresholdsAndSendAlert(
        {
          probe,
          statuses,
          notifications,
          requestIndex,
          validatedResponseStatuses: validatedResponse,
        },
        requestLog
      ).catch((error) => {
        requestLog.addError(error.message)
      })

      // Exit the loop if there is any alert triggered
      if (validatedResponse.some((item) => item.isAlertTriggered)) {
        break
      }
    } catch (error) {
      requestLog.addError((error as any).message)
      break
    } finally {
      requestLog.print()
      if (verboseLogs || requestLog.hasIncidentOrRecovery) {
        requestLog.saveToDatabase().catch((error) => log.error(error.message))
      }
    }
  }
}

type ProcessTCPRequestResult = {
  probe: Probe
  tcpRequestID: string
  responseTime: number
  isAlertTriggered: boolean
  notifications: Array<Notification>
  requestIndex: number // to support multiple tcp requests/chaining
  verboseLogs: boolean
}

async function processTCPRequestResult({
  probe,
  responseTime,
  isAlertTriggered,
  notifications,
  requestIndex,
  verboseLogs,
}: ProcessTCPRequestResult) {
  const probeRes: ProbeRequestResponse = {
    requestType: 'tcp',
    data: '',
    status: isAlertTriggered ? 0 : 200, // set to 0 if down, and 200 if ok
    headers: {},
    responseTime,
  }
  const validatedResponse = validateResponse(
    probe.socket?.alerts || [
      {
        query: 'response.status < 200 or response.status > 299',
        message: 'TCP server cannot be accessed',
      },
    ],
    probeRes
  )
  const requestLog = new RequestLog(probe, 0, 0)

  requestLog.addAlerts(
    validatedResponse
      .filter((item) => item.isAlertTriggered)
      .map((item) => item.alert)
  )
  const statuses = processThresholds({
    probe,
    requestIndex,
    validatedResponse,
  })

  requestLog.setResponse(probeRes)
  checkThresholdsAndSendAlert(
    {
      probe,
      statuses,
      notifications,
      requestIndex,
      validatedResponseStatuses: validatedResponse,
    },
    requestLog
  ).catch((error) => {
    requestLog.addError(error.message)
  })

  if (verboseLogs || requestLog.hasIncidentOrRecovery) {
    requestLog.saveToDatabase().catch((error) => log.error(error.message))
  }
}
