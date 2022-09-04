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
import { probingHTTP } from './probing'
import { logResponseTime } from '../logger/response-time-log'
import { tcpRequest } from '../tcp-request'
import { getContext } from '../../context'

import { redisRequest } from '../redis-request'
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

type doProbeParams = {
  checkOrder: number // the order of probe being processed
  probe: Probe // probe contains all the probes
  notifications: Notification[] // notifications contains all the notifications
}
/**
 * doProbe sends out the http request
 * @param {object} param object parameter
 * @returns {Promise<void>} void
 */
// eslint-disable-next-line complexity
export async function doProbe({
  checkOrder,
  probe,
  notifications,
}: doProbeParams): Promise<void> {
  const { flags } = getContext()
  const isSymonMode = Boolean(flags.symonUrl) && Boolean(flags.symonKey)
  const verboseLogs = isSymonMode || flags['keep-verbose-logs']

  const eventEmitter = getEventEmitter()
  const responses = []

  if (probe?.redis) {
    const { id, redis } = probe

    let redisRequestIndex = 0
    for (const redisIndex of redis) {
      const { host, port } = redisIndex

      // eslint-disable-next-line no-await-in-loop
      const redisRes = await redisRequest({ host: host, port: port })

      const timeNow = new Date().toISOString()
      const logMessage = `${timeNow} ${checkOrder} id:${id} redis:${host}:${port} ${redisRes.responseTime}ms msg:${redisRes.body}`

      const isAlertTriggered = redisRes.status !== 200
      isAlertTriggered ? log.warn(logMessage) : log.info(logMessage)

      const { alerts } = redisIndex
      const validatedResponse = validateResponse(
        alerts || [
          {
            query: 'response.status < 200 or response.status > 299',
            message: 'REDIS host cannot be accessed',
          },
        ],
        redisRes
      )
      const requestLog = new RequestLog(probe, 0, 0)

      requestLog.addAlerts(
        validatedResponse
          .filter((item) => item.isAlertTriggered)
          .map((item) => item.alert)
      )
      const statuses = processThresholds({
        probe,
        requestIndex: redisRequestIndex,
        validatedResponse,
      })

      requestLog.setResponse(redisRes)
      checkThresholdsAndSendAlert(
        {
          probe,
          statuses,
          notifications,
          requestIndex: redisRequestIndex,
          validatedResponseStatuses: validatedResponse,
        },
        requestLog
      ).catch((error) => {
        requestLog.addError(error.message)
      })

      redisRequestIndex++
    }
  }

  if (probe?.socket) {
    const { id, socket } = probe
    const { host, port, data } = socket
    const url = `${host}:${port}`

    const probeRes = await tcpRequest({ host, port, data })

    const timeNow = new Date().toISOString()
    const logMessage = `${timeNow} ${checkOrder} id:${id} tcp:${url} ${probeRes.responseTime}ms msg:${probeRes.body}`

    const isAlertTriggered = probeRes.status !== 200

    isAlertTriggered ? log.warn(logMessage) : log.info(logMessage)

    // let TCPrequestIndex = 0 // are there multiple tcp requests?
    // TCPrequestIndex < probe?.requests?.length;  // multiple tcp request, for later support
    // TCPrequestIndex++                           // for later supported
    const TCPrequestIndex = 0

    const { alerts } = socket
    const validatedResponse = validateResponse(
      alerts || [
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
      requestIndex: TCPrequestIndex,
      validatedResponse,
    })

    requestLog.setResponse(probeRes)
    checkThresholdsAndSendAlert(
      {
        probe,
        statuses,
        notifications,
        requestIndex: TCPrequestIndex,
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

  // sending multiple http-type requests
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
      const probeRes: ProbeRequestResponse = await probingHTTP({
        requestConfig: request,
        responses,
      })

      logResponseTime(probeRes.responseTime)

      eventEmitter.emit(events.probe.response.received, {
        probe: probe,
        requestIndex,
        response: probeRes,
      })

      // Add to a response array to be accessed by another request
      responses.push(probeRes)

      requestLog.setResponse(probeRes)

      // TODO: MOVE THIS DECODING TO THE PROBE/DRIVERS
      if ([0, 1, 2, 3, 4, 599].includes(probeRes.status)) {
        const errorMessageMap: Record<number, string> = {
          0: 'URI not found', // axios error
          1: 'Connection reset', // axios error
          2: 'Connection refused', // axios error
          3: 'Unknown error', // axios error
          599: 'Request Timed out', // axios error
        }

        requestLog.addError(errorMessageMap[probeRes.status])
      }

      // combine global probe alerts with all individual request alerts
      const probeAlerts = probe.alerts ?? []
      const combinedAlerts = [...probeAlerts, ...(request.alerts || [])]

      // Responses have been processed and validated
      const validatedResponse = validateResponse(combinedAlerts, probeRes)

      requestLog.addAlerts(
        validatedResponse
          .filter((item) => item.isAlertTriggered)
          .map((item) => item.alert)
      )

      // done probing, got some result, process it, check for thresholds and notifications
      const statuses = processThresholds({
        probe: probe,
        requestIndex,
        validatedResponse,
      })

      // Done processing results, check if need to send out alerts
      checkThresholdsAndSendAlert(
        {
          probe: probe,
          statuses,
          notifications: notifications,
          requestIndex,
          validatedResponseStatuses: validatedResponse,
        },
        requestLog
      ).catch((error) => {
        requestLog.addError(error.message)
      })

      // Exit the loop if there is any alert triggered
      if (validatedResponse.some((item) => item.isAlertTriggered)) {
        const triggeredAlertResponse = validatedResponse.find(
          (item) => item.isAlertTriggered
        )

        if (triggeredAlertResponse) {
          eventEmitter.emit(events.probe.alert.triggered, {
            probe: probe,
            requestIndex,
            alertQuery: triggeredAlertResponse.alert.query,
          })
        }

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
