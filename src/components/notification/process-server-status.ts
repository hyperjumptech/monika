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

import { ProbeStatus, StatusDetails } from '../../interfaces/probe-status'
import { Probe } from '../../interfaces/probe'
import { ValidateResponseStatus } from './alert'
import { log } from '../../utils/pino'
import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { setAlert } from '../../components/logger'

import { printProbeLog } from '../../components/logger'

const PROBE_STATUSES: ProbeStatus[] = []
const INIT_PROBE_STATUS_DETAILS: StatusDetails = {
  alert: '',
  state: 'INIT',
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

// Function to determine probe state
const determineProbeState = ({
  probeStatus,
  validation,
  incidentThreshold,
  recoveryThreshold,
}: {
  errorName: string
  probeStatus: StatusDetails
  validation: ValidateResponseStatus
  incidentThreshold: number
  recoveryThreshold: number
}) => {
  const { isDown, consecutiveTrue, consecutiveFalse } = probeStatus
  const { status } = validation

  if (!isDown && status && consecutiveTrue === incidentThreshold - 1)
    return PROBE_STATE.UP_TRUE_EQUALS_THRESHOLD

  if (!isDown && status && consecutiveTrue < incidentThreshold - 1) {
    return PROBE_STATE.UP_TRUE_BELOW_THRESHOLD
  }

  if (!isDown && !status) return PROBE_STATE.UP_FALSE

  if (isDown && !status && consecutiveFalse === recoveryThreshold - 1)
    return PROBE_STATE.DOWN_FALSE_EQUALS_THRESHOLD

  if (isDown && !status && consecutiveFalse < recoveryThreshold - 1)
    return PROBE_STATE.DOWN_FALSE_BELOW_THRESHOLD

  if (isDown && status) return PROBE_STATE.DOWN_TRUE

  return PROBE_STATE.INIT
}

// Function to update probe status according to the state
const updateProbeStatus = (
  statusDetails: StatusDetails,
  state: PROBE_STATE
) => {
  switch (state) {
    case 'UP_FALSE':
      statusDetails = {
        ...statusDetails,
        state: 'UP_FALSE',
        shouldSendNotification: false,
        consecutiveTrue: 0,
        consecutiveFalse: statusDetails.consecutiveFalse + 1,
        totalFalse: statusDetails.totalFalse + 1,
      }
      return statusDetails
    case 'UP_TRUE_BELOW_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'UP_TRUE_BELOW_THRESHOLD',
        shouldSendNotification: false,
        consecutiveFalse: 0,
        totalTrue: statusDetails.totalTrue + 1,
        consecutiveTrue: statusDetails.consecutiveTrue + 1,
      }
      return statusDetails
    case 'UP_TRUE_EQUALS_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'UP_TRUE_EQUALS_THRESHOLD',
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
        state: 'DOWN_TRUE',
        shouldSendNotification: false,
        consecutiveFalse: 0,
        consecutiveTrue: statusDetails.consecutiveTrue + 1,
        totalTrue: statusDetails.totalTrue + 1,
      }
      return statusDetails
    case 'DOWN_FALSE_BELOW_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'DOWN_FALSE_BELOW_THRESHOLD',
        shouldSendNotification: false,
        consecutiveTrue: 0,
        totalFalse: statusDetails.totalFalse + 1,
        consecutiveFalse: statusDetails.consecutiveFalse + 1,
      }
      return statusDetails
    case 'DOWN_FALSE_EQUALS_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'DOWN_FALSE_EQUALS_THRESHOLD',
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

export const processProbeStatus = ({
  probe,
  validatedResp,
  incidentThreshold,
  recoveryThreshold,
}: {
  checkOrder: number
  probe: Probe
  probeRes: AxiosResponseWithExtraData
  totalRequests: number
  validatedResp: ValidateResponseStatus[]
  incidentThreshold: number
  recoveryThreshold: number
}) => {
  try {
    // Get Probe ID and Name
    const { id, name, alerts } = probe
    const results: Array<StatusDetails> = []

    // Initialize server status
    // This checks if there are no item in PROBE_STATUSES
    // that doesn't have item with ID === id, push new ProbeStatus
    const isAlreadyInProbeStatus = PROBE_STATUSES.filter(
      (item) => item.id === id
    )
    if (isAlreadyInProbeStatus.length === 0) {
      const initProbeStatuses = alerts.map((alert) => ({
        ...INIT_PROBE_STATUS_DETAILS,
        alert,
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
        let updatedStatus: StatusDetails = INIT_PROBE_STATUS_DETAILS

        const probeStatusDetail = currentProbe.details.find(
          (detail) => detail.alert === alert
        )

        if (probeStatusDetail?.alert.includes('status-not')) {
          const state = determineProbeState({
            errorName: alert,
            probeStatus: probeStatusDetail,
            validation,
            incidentThreshold,
            recoveryThreshold,
          })
          updatedStatus = updateProbeStatus(probeStatusDetail, state)
        }

        // Handle is response time error
        if (probeStatusDetail?.alert.includes('response-time-greater')) {
          const state = determineProbeState({
            errorName: alert,
            probeStatus: probeStatusDetail,
            validation,
            incidentThreshold,
            recoveryThreshold,
          })
          updatedStatus = updateProbeStatus(probeStatusDetail, state)
        }

        // Update the Probe Status
        const filteredProbeStatus = currentProbe.details.filter(
          (item) => item.alert !== alert
        )
        currentProbe.details = [...filteredProbeStatus, updatedStatus]
        results.push(updatedStatus)

        if (validation.status === true) {
          setAlert({ flag: 'ALERT', message: updatedStatus.alert as any })
          // done probes, got some alerts&notif.. print log
          printProbeLog()
        }
      })
    }
    return results
  } catch (error) {
    log.error(error.message)
    return []
  }
}
