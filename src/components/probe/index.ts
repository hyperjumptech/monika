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
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import validateResponse, {
  ValidatedResponse,
} from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import { RequestLogger } from '../logger'
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
  requestIndex: number
}

interface ProbeSendNotification extends Omit<ProbeStatusProcessed, 'statuses'> {
  index: number
  probeState?: ServerAlertState
}

// Probes Thresholds processed, Send out notifications/alerts.
async function checkThresholdsAndSendAlert(
  data: ProbeStatusProcessed,
  requestLogger: RequestLogger
) {
  const {
    probe,
    statuses,
    notifications,
    requestIndex,
    validatedResponseStatuses,
  } = data
  const probeSendNotification = async (data: ProbeSendNotification) => {
    const {
      index,
      probe,
      probeState,
      notifications,
      requestIndex,
      validatedResponseStatuses,
    } = data

    const statusString = probeState?.state ?? 'UP'
    const url = probe.requests[requestIndex].url ?? ''

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

  statuses
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

      requestLogger.addNotifications(
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
 */
export async function doProbe(
  checkOrder: number,
  probe: Probe,
  notifications?: Notification[]
) {
  const eventEmitter = getEventEmitter()
  const responses = []

  for (
    let requestIndex = 0;
    requestIndex < probe.requests.length;
    requestIndex++
  ) {
    const request = probe.requests[requestIndex]
    const requestLogger = new RequestLogger(probe, requestIndex, checkOrder)

    try {
      // intentionally wait for a request to finish before processing next request in loop
      // eslint-disable-next-line no-await-in-loop
      const probeRes: AxiosResponseWithExtraData = await probing(
        request,
        responses
      )

      eventEmitter.emit(events.probe.response.received, {
        probe,
        requestIndex,
        response: probeRes,
      })

      // Add to an array to be accessed by another request
      responses.push(probeRes)

      requestLogger.setResponse(probeRes)

      // store request error log
      if ([0, 1, 2, 599].includes(probeRes.status)) {
        const errorMessageMap: Record<number, string> = {
          0: 'URI not found',
          1: 'Connection reset',
          2: 'Connection refused',
          599: 'Request Timed out',
        }

        requestLogger.addError(errorMessageMap[probeRes.status])
      }

      // combine global probe alerts with all individual request alerts
      const combinedAlerts = probe.alerts.concat(...(request.alerts || []))

      // Responses have been processed and validated
      const validatedResponse = validateResponse(combinedAlerts, probeRes)

      requestLogger.addAlerts(
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
        requestLogger
      ).catch((error) => {
        requestLogger.addError(error.message)
      })

      // Exit the loop if there is any alert triggered
      if (validatedResponse.some((item) => item.isAlertTriggered)) {
        break
      }
    } catch (error) {
      requestLogger.addError(error.message)
      break
    } finally {
      requestLogger.print()
      requestLogger
        .saveToDatabase()
        .then(() => {
          if (requestLogger.hasIncidentOrRecovery) {
            return getLogsAndReport()
          }
        })
        .catch((error) => log.error(error.message))
    }
  }
}
