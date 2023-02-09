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

import * as mongodbURI from 'mongodb-uri'
import { parse } from 'pg-connection-string'

import { getContext } from '../../context'
import events from '../../events'
import { Notification } from '../../interfaces/notification'
import { Probe } from '../../interfaces/probe'
import { ServerAlertState } from '../../interfaces/probe-status'
import { ProbeRequestResponse } from '../../interfaces/request'
import validateResponse, {
  ValidatedResponse,
} from '../../plugins/validate-response'
import { getEventEmitter } from '../../utils/events'
import { log } from '../../utils/pino'
import { setProbeFinish, setProbeRunning } from '../../utils/probe-state'
import { httpRequest } from '../http-request'
import { RequestLog } from '../logger'
import { logResponseTime } from '../logger/response-time-log'
import { mariaRequest } from '../mariadb-request'
import { mongoRequest } from '../mongodb-request'
import { sendAlerts } from '../notification'
import { processThresholds } from '../notification/process-server-status'
import { PostgresParam, postgresRequest } from '../postgres-request'
import { redisRequest } from '../redis-request'
import { tcpRequest } from '../tcp-request'

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

const connectionRecoveryMsg = `Probe is accessible again`
const connectionIncidentMsg = `Probe not accessible`

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
        validateResponse.alert.assertion === probeState?.alertQuery
    ) || validatedResponseStatuses[index]

  eventEmitter.emit(events.probe.notification.willSend, {
    probeID: probe.id,
    notifications: notifications ?? [],
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
function checkThresholdsAndSendAlert(
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

  const probeStatesWithValidAlert = getProbeStatesWithValidAlert(statuses || [])

  for (const [index, probeState] of probeStatesWithValidAlert.entries()) {
    const { alertQuery, state } = probeState

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
        type: state === 'DOWN' ? 'NOTIFY-INCIDENT' : 'NOTIFY-RECOVER',
        alertQuery: alertQuery || '',
      }))
    )
  }
}

export function getProbeStatesWithValidAlert(
  probeStates: ServerAlertState[]
): ServerAlertState[] {
  return probeStates.filter(
    ({ isFirstTime, shouldSendNotification, state }) => {
      const isFirstUpEvent = isFirstTime && state === 'UP'
      const isFirstUpEventForNonSymonMode = isFirstUpEvent

      return shouldSendNotification && !isFirstUpEventForNonSymonMode
    }
  )
}

type respProsessingParams = {
  probe: Probe // the actual probe that got this response
  probeResult: ProbeRequestResponse // actual response from the probe
  notifications: Notification[] // notifications contains all the notifications
  logMessage: string // message from the probe to display
  isAlertTriggered: boolean // flag, should alert be triggered?
  index: number
}
/**
 * responseProcessing determines if the last probe response warrants an alert
 * creates the console log
 * @param {object} param is response Processing type
 * @returns void
 */
async function responseProcessing({
  probe,
  probeResult,
  notifications,
  logMessage,
  isAlertTriggered,
  index,
}: respProsessingParams): Promise<void> {
  const { flags } = getContext()
  const isSymonMode = Boolean(flags.symonUrl) && Boolean(flags.symonKey)
  const verboseLogs = isSymonMode || flags['keep-verbose-logs']

  isAlertTriggered ? log.warn(logMessage) : log.info(logMessage)

  const { alerts } = probe
  const validatedResponse = validateResponse(
    alerts || [
      {
        assertion: 'response.status < 200 or response.status > 299',
        message: 'probe cannot be accessed',
      },
    ],
    probeResult
  )
  const requestLog = new RequestLog(probe, index, 0)

  requestLog.addAlerts(
    validatedResponse
      .filter((item) => item.isAlertTriggered)
      .map((item) => item.alert)
  )
  const statuses = processThresholds({
    probe,
    requestIndex: index,
    validatedResponse,
  })

  requestLog.setResponse(probeResult)
  checkThresholdsAndSendAlert(
    {
      probe,
      statuses,
      notifications,
      requestIndex: index,
      validatedResponseStatuses: validatedResponse,
    },
    requestLog
  )

  if (verboseLogs || requestLog.hasIncidentOrRecovery) {
    requestLog.saveToDatabase().catch((error) => log.error(error.message))
  }
}

const isConnectionDown = new Map<string, boolean>()

type doProbeParams = {
  checkOrder: number // the order of probe being processed
  probe: Probe // probe contains all the probes
  notifications: Notification[] // notifications contains all the notifications
}
/**
 * doProbe sends out the http request
 * @param {object} doProbeParams doProbe parameter
 * @returns {Promise<void>} void
 */
export async function doProbe({
  checkOrder,
  probe,
  notifications,
}: doProbeParams): Promise<void> {
  const { flags } = getContext()
  const isSymonMode = Boolean(flags.symonUrl) && Boolean(flags.symonKey)
  const verboseLogs = isSymonMode || flags['keep-verbose-logs']

  setProbeRunning(probe.id)

  const randomTimeout = [1000, 2000, 3000].sort(() => {
    return Math.random() - 0.5
  })[0]

  // eslint-disable-next-line complexity
  setTimeout(async () => {
    const eventEmitter = getEventEmitter()
    const responses = []

    if (probe?.mongo) {
      const { id, mongo } = probe
      let mongoRequestIndex = 0
      for await (const mongoDB of mongo) {
        const { uri } = mongoDB
        let host: string | undefined
        let port: number | undefined
        let username: string | undefined
        let password: string | undefined

        if (uri) {
          const parsed = mongodbURI.parse(uri)
          host = parsed.hosts[0].host
          port = parsed.hosts[0].port
          username = parsed.username
          password = parsed.password
        } else {
          host = mongoDB.host
          port = mongoDB.port
          username = mongoDB.username
          password = mongoDB.password
        }

        const mongoResult = await mongoRequest({
          uri,
          host,
          port,
          username,
          password,
        })
        const timeNow = new Date().toISOString()
        const logMessage = `${timeNow} ${checkOrder} id:${id} mongo:${host}:${port} ${mongoResult.responseTime}ms msg:${mongoResult.body}`
        const isAlertTriggered = mongoResult.status !== 200
        responseProcessing({
          probe: probe,
          probeResult: mongoResult,
          notifications: notifications,
          logMessage: logMessage,
          isAlertTriggered: isAlertTriggered,
          index: mongoRequestIndex,
        })
        mongoRequestIndex++
      }
    }

    if (probe?.mariadb || probe?.mysql) {
      const { id, mariadb, mysql } = probe
      let mariaReqIndex = 0
      let logMessage = ''

      const mydb = mariadb ?? mysql

      if (mydb !== undefined) {
        for await (const mariaIndex of mydb) {
          const { host, port, database, username, password } = mariaIndex

          const mariaResult = await mariaRequest({
            host,
            port,
            database,
            username,
            password,
          })
          const timeNow = new Date().toISOString()

          // eslint-disable-next-line unicorn/prefer-ternary
          if (mariadb) {
            logMessage = `${timeNow} ${checkOrder} id:${id} mariadb:${host}:${port} ${mariaResult.responseTime}ms msg:${mariaResult.body}`
          } else {
            logMessage = `${timeNow} ${checkOrder} id:${id} mysql:${host}:${port} ${mariaResult.responseTime}ms msg:${mariaResult.body}`
          }

          const isAlertTriggered = mariaResult.status !== 200

          responseProcessing({
            probe: probe,
            probeResult: mariaResult,
            notifications: notifications,
            logMessage: logMessage,
            isAlertTriggered: isAlertTriggered,
            index: mariaReqIndex,
          })
          mariaReqIndex++
        }
      }
    }

    if (probe?.postgres) {
      const { id, postgres } = probe
      let pgReqIndex = 0
      const postgresParams: PostgresParam = {
        host: '',
        port: 0,
        database: '',
        username: '',
        password: '',
      }

      for await (const pgIndex of postgres) {
        const { host, port, database, username, password, uri } = pgIndex

        if (uri !== undefined) {
          const config = parse(uri)

          // If got uri format, parse and use that instead
          postgresParams.host = config.host ?? '0.0.0.0'
          postgresParams.port = Number(config.port) ?? 5432
          postgresParams.database = config.database ?? ''
          postgresParams.username = config.user ?? ''
          postgresParams.password = config.password ?? ''
        } else if (uri === undefined) {
          postgresParams.host = host
          postgresParams.port = port
          postgresParams.database = database
          postgresParams.username = username
          postgresParams.password = password
        }

        const pgResult = await postgresRequest(postgresParams)

        const timeNow = new Date().toISOString()
        const logMessage = `${timeNow} ${checkOrder} id:${id} postgres:${postgresParams.host}:${postgresParams.port} ${pgResult.responseTime}ms msg:${pgResult.body}`
        const isAlertTriggered = pgResult.status !== 200

        responseProcessing({
          probe: probe,
          probeResult: pgResult,
          notifications: notifications,
          logMessage: logMessage,
          isAlertTriggered: isAlertTriggered,
          index: pgReqIndex,
        })
        pgReqIndex++
      }
    }

    if (probe?.redis) {
      const { id, redis } = probe
      let redisRequestIndex = 0
      for await (const redisIndex of redis) {
        const { host, port } = redisIndex
        const redisRes = await redisRequest({ host: host, port: port })
        const timeNow = new Date().toISOString()
        const logMessage = `${timeNow} ${checkOrder} id:${id} redis:${host}:${port} ${redisRes.responseTime}ms msg:${redisRes.body}`
        const isAlertTriggered = redisRes.status !== 200
        responseProcessing({
          probe: probe,
          probeResult: redisRes,
          notifications: notifications,
          logMessage: logMessage,
          isAlertTriggered: isAlertTriggered,
          index: redisRequestIndex,
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
      const TCPrequestIndex = 0
      responseProcessing({
        probe: probe,
        probeResult: probeRes,
        notifications: notifications,
        logMessage: logMessage,
        isAlertTriggered: isAlertTriggered,
        index: TCPrequestIndex,
      })
    }

    // sending multiple http-type requests
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

        logResponseTime(probeRes.responseTime)

        eventEmitter.emit(events.probe.response.received, {
          probe: probe,
          requestIndex,
          response: probeRes,
        })

        // Add to a response array to be accessed by another request for chaining later
        responses.push(probeRes)
        requestLog.setResponse(probeRes)

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

        // so we've got a status that need to be reported/alerted
        // 1. check first, this connection is up, but was it ever down? if yes then use a specific connection recovery msg
        // 2. if this connection is down, save to map and send specific connection incident msg
        // 3. if event is not for connection failure, send user specified notification msg
        if (statuses[0].shouldSendNotification) {
          if (
            probeRes.isProbeResponsive && // if connection is successful but
            isConnectionDown.has(id) // if connection was down then send custom alert. Else use user's alert.
          ) {
            validatedResponse[0].alert = {
              assertion: '',
              message: `${connectionRecoveryMsg}`,
            }
            isConnectionDown.delete(id) // connection is up, so remove from entry
          } else if (!probeRes.isProbeResponsive) {
            // if connection has failed, then lets send out specific notification
            validatedResponse[0].alert = {
              assertion: '',
              message: `${connectionIncidentMsg}`,
            }
            isConnectionDown.set(id, true) // connection is down, so add to map
          }
        }

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
        )

        // Exit the chaining loop if there is any alert triggered
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

    setProbeFinish(probe.id)
  }, randomTimeout)
}
