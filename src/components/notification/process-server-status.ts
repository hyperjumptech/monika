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

import { setAlert } from '../../components/logger'
// import { PROBE_LOGS_BUILT } from '../../constants/event-emitter'
import { LogObject } from '../../interfaces/logs'
import { Probe } from '../../interfaces/probe'
import { ProbeStatus, ProbeStateDetails } from '../../interfaces/probe-status'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { ValidateResponse } from '../../plugins/validate-response'
import { log } from '../../utils/pino'
// import { getEventEmitter } from '../../utils/events'

// const em = getEventEmitter()

let PROBE_STATUSES: ProbeStatus[] = []
const INIT_PROBE_STATUS_DETAILS: ProbeStateDetails = {
  alertQuery: '',
  probeState: 'INIT',
  isDown: false,
  shouldSendNotification: false,
  totalTrue: 0,
  totalFalse: 0,
  consecutiveTrue: 0,
  consecutiveFalse: 0,
}
enum PROBE_STATE {
  INIT = 'INIT',
  UP_TRUE_EQUALS_THRESHOLD = 'UP_TRUE_EQUALS_THRESHOLD',
  UP_TRUE_BELOW_THRESHOLD = 'UP_TRUE_BELOW_THRESHOLD',
  UP_FALSE = 'UP_FALSE',
  DOWN_FALSE_EQUALS_THRESHOLD = 'DOWN_FALSE_EQUALS_THRESHOLD',
  DOWN_FALSE_BELOW_THRESHOLD = 'DOWN_FALSE_BELOW_THRESHOLD',
  DOWN_TRUE = 'DOWN_TRUE',
}

export const resetProbeStatuses = () => {
  PROBE_STATUSES = []
}

// Function to determine probe state
const determineProbeState = ({
  probeStatusDetail,
  validation,
  incidentThreshold,
  recoveryThreshold,
}: {
  errorName: string
  probeStatusDetail: ProbeStateDetails
  validation: ValidateResponse
  incidentThreshold: number
  recoveryThreshold: number
}) => {
  const { isDown, consecutiveTrue, consecutiveFalse } = probeStatusDetail
  const { somethingToReport } = validation

  if (!isDown && somethingToReport && consecutiveTrue === incidentThreshold - 1)
    return PROBE_STATE.UP_TRUE_EQUALS_THRESHOLD

  if (!isDown && somethingToReport && consecutiveTrue < incidentThreshold - 1) {
    return PROBE_STATE.UP_TRUE_BELOW_THRESHOLD
  }

  if (!isDown && !somethingToReport) return PROBE_STATE.UP_FALSE

  if (
    isDown &&
    !somethingToReport &&
    consecutiveFalse === recoveryThreshold - 1
  )
    return PROBE_STATE.DOWN_FALSE_EQUALS_THRESHOLD

  if (isDown && !somethingToReport && consecutiveFalse < recoveryThreshold - 1)
    return PROBE_STATE.DOWN_FALSE_BELOW_THRESHOLD

  if (isDown && somethingToReport) return PROBE_STATE.DOWN_TRUE

  return PROBE_STATE.INIT
}

// updateProbeStatus updates probe status according to the state
const updateProbeStatus = (
  statusDetails: ProbeStateDetails,
  probeState: PROBE_STATE
) => {
  switch (probeState) {
    case 'UP_FALSE':
      statusDetails = {
        ...statusDetails,
        probeState: 'UP_FALSE',
        shouldSendNotification: false,
        consecutiveTrue: 0,
        consecutiveFalse: statusDetails.consecutiveFalse + 1,
        totalFalse: statusDetails.totalFalse + 1,
      }
      return statusDetails
    case 'UP_TRUE_BELOW_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        probeState: 'UP_TRUE_BELOW_THRESHOLD',
        shouldSendNotification: false,
        consecutiveFalse: 0,
        totalTrue: statusDetails.totalTrue + 1,
        consecutiveTrue: statusDetails.consecutiveTrue + 1,
      }
      return statusDetails
    case 'UP_TRUE_EQUALS_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        probeState: 'UP_TRUE_EQUALS_THRESHOLD',
        shouldSendNotification: true,
        isDown: true,
        consecutiveFalse: 0,
        totalTrue: statusDetails.totalTrue + 1,
        consecutiveTrue: statusDetails.consecutiveTrue + 1,
      }
      return statusDetails
    case 'DOWN_TRUE':
      statusDetails = {
        ...statusDetails,
        probeState: 'DOWN_TRUE',
        shouldSendNotification: false,
        consecutiveFalse: 0,
        consecutiveTrue: statusDetails.consecutiveTrue + 1,
        totalTrue: statusDetails.totalTrue + 1,
      }
      return statusDetails
    case 'DOWN_FALSE_BELOW_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        probeState: 'DOWN_FALSE_BELOW_THRESHOLD',
        shouldSendNotification: false,
        consecutiveTrue: 0,
        totalFalse: statusDetails.totalFalse + 1,
        consecutiveFalse: statusDetails.consecutiveFalse + 1,
      }
      return statusDetails
    case 'DOWN_FALSE_EQUALS_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        probeState: 'DOWN_FALSE_EQUALS_THRESHOLD',
        shouldSendNotification: true,
        isDown: false,
        consecutiveTrue: 0,
        totalFalse: statusDetails.totalFalse + 1,
        consecutiveFalse: statusDetails.consecutiveFalse + 1,
      }
      return statusDetails
    default:
      statusDetails = INIT_PROBE_STATUS_DETAILS
      return statusDetails
  }
}

export const processThresholds = ({
  probe,
  validatedResp,
  mLog,
}: {
  checkOrder: number
  probe: Probe
  probeRes: AxiosResponseWithExtraData
  totalRequests: number
  validatedResp: ValidateResponse[]
  mLog: LogObject
}) => {
  try {
    // Get Probe ID and Name
    const { id, name, alerts, incidentThreshold, recoveryThreshold } = probe
    const results: Array<ProbeStateDetails> = []

    // Initialize server status
    // This checks if there are no item in PROBE_STATUSES
    // that doesn't have item with ID === id, push new ProbeStatus
    const isAlreadyInProbeStatus = PROBE_STATUSES.filter(
      (item) => item.id === id
    )
    if (isAlreadyInProbeStatus.length === 0) {
      const initProbeStatuses = alerts.map((alert) => ({
        ...INIT_PROBE_STATUS_DETAILS,
        alertQuery: alert.query,
      }))

      PROBE_STATUSES.push({
        id,
        name,
        details: initProbeStatuses,
      })
    }

    // Check if there is any alert that is triggered
    // If the alert is being triggered <threshold> times, send alert and
    // change the server status respectively.
    const currentProbe = PROBE_STATUSES.find(
      (probeStatus) => probeStatus.id === id
    )!

    // Calculate the count for successes and failures
    if (validatedResp.length > 0) {
      validatedResp.forEach(async (validation) => {
        const { alert } = validation
        let updatedStatus: ProbeStateDetails = INIT_PROBE_STATUS_DETAILS

        const probeStatusDetail = currentProbe.details.find(
          (detail) => detail.alertQuery === alert.query
        )

        if (probeStatusDetail) {
          const state = determineProbeState({
            errorName: alert.query,
            probeStatusDetail: probeStatusDetail,
            validation,
            incidentThreshold,
            recoveryThreshold,
          })
          updatedStatus = updateProbeStatus(probeStatusDetail, state)
        }

        // Update the Probe Status
        const filteredProbeStatus = currentProbe.details.filter(
          (item) => item.alertQuery !== alert.query
        )
        currentProbe.details = [...filteredProbeStatus, updatedStatus]
        results.push(updatedStatus)

        if (validation.somethingToReport === true) {
          // set alert flag, concate alert message
          setAlert(
            {
              flag: 'ALERT',
              message: updatedStatus.alertQuery,
            },
            mLog
          )
        }
      })
    }
    return results
  } catch (error) {
    log.error(error.message)
    return []
  }
}
