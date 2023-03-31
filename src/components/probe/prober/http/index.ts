import { checkThresholdsAndSendAlert } from '../..'
import { getContext } from '../../../../context'
import events from '../../../../events'
import type { Notification } from '../../../notification/channel'
import type { Probe } from '../../../../interfaces/probe'
import type { ProbeRequestResponse } from '../../../../interfaces/request'
import validateResponse from '../../../../plugins/validate-response'
import { getEventEmitter } from '../../../../utils/events'
import { log } from '../../../../utils/pino'
import { RequestLog } from '../../../logger'
import { logResponseTime } from '../../../logger/response-time-log'
import { processThresholds } from '../../../notification/process-server-status'
import { httpRequest } from './request'

const CONNNECTION_RECOVERY_MESSAGE = 'Probe is accessible again'
const CONNECTION_INCIDENT_MESSAGE = 'Probe not accessible'
const isConnectionDown = new Map<string, boolean>()

// sending multiple http-type requests
export async function probeHTTP(
  probe: Probe,
  checkOrder: number,
  notifications: Notification[]
): Promise<void> {
  const eventEmitter = getEventEmitter()
  const { flags } = getContext()
  const isSymonMode = Boolean(flags.symonUrl) && Boolean(flags.symonKey)
  const isVerbose = isSymonMode || flags['keep-verbose-logs']
  const responses = []

  for (
    let requestIndex = 0;
    requestIndex < probe?.requests?.length;
    requestIndex++
  ) {
    const request = probe.requests?.[requestIndex]
    const requestLog = new RequestLog(probe, requestIndex, checkOrder)
    // create id-request
    const id = `${probe?.id}:${request.url}:${requestIndex}:${request?.id} `

    try {
      // intentionally wait for a request to finish before processing next request in loop
      // eslint-disable-next-line no-await-in-loop
      const probeRes: ProbeRequestResponse = await httpRequest({
        requestConfig: request,
        responses,
      })
      // combine global probe alerts with all individual request alerts
      const combinedAlerts = [...probe.alerts, ...(request.alerts || [])]
      // Responses have been processed and validated
      const validatedResponse = validateResponse(combinedAlerts, probeRes)
      // done probing, got some result, process it, check for thresholds and notifications
      const statuses = processThresholds({
        probe,
        requestIndex,
        validatedResponse,
      })

      eventEmitter.emit(events.probe.response.received, {
        probe,
        requestIndex,
        response: probeRes,
      })

      logResponseTime(probeRes.responseTime)
      // Add to a response array to be accessed by another request for chaining later
      responses.push(probeRes)
      requestLog.setResponse(probeRes)
      requestLog.addAlerts(
        validatedResponse
          .filter((item) => item.isAlertTriggered)
          .map((item) => item.alert)
      )

      // so we've got a status that need to be reported/alerted
      // 1. check first, this connection is up, but was it ever down? if yes then use a specific connection recovery msg
      // 2. if this connection is down, save to map and send specific connection incident msg
      // 3. if event is not for connection failure, send user specified notification msg
      if (statuses[0].shouldSendNotification) {
        const { isProbeResponsive } = probeRes

        if (
          isProbeResponsive && // if connection is successful but
          isConnectionDown.has(id) // if connection was down then send custom alert. Else use user's alert.
        ) {
          validatedResponse[0].alert = {
            assertion: '',
            message: CONNNECTION_RECOVERY_MESSAGE,
          }
          isConnectionDown.delete(id) // connection is up, so remove from entry
        } else if (!isProbeResponsive) {
          // if connection has failed, then lets send out specific notification
          validatedResponse[0].alert = {
            assertion: '',
            message: CONNECTION_INCIDENT_MESSAGE,
          }
          isConnectionDown.set(id, true) // connection is down, so add to map
        }
      }

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
      )

      // Exit the chaining loop if there is any alert triggered
      if (validatedResponse.some((item) => item.isAlertTriggered)) {
        const triggeredAlertResponse = validatedResponse.find(
          (item) => item.isAlertTriggered
        )

        if (triggeredAlertResponse) {
          eventEmitter.emit(events.probe.alert.triggered, {
            probe,
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
      if (isVerbose || requestLog.hasIncidentOrRecovery) {
        requestLog.saveToDatabase().catch((error) => log.error(error.message))
      }
    }
  }
}
