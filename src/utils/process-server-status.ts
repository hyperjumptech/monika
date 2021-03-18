import { ProbeStatus, StatusDetails } from '../interfaces/probe-status'
import { Probe } from '../interfaces/probe'
import { ValidateResponseStatus } from './alert'
import console, { log } from 'console'

const PROBE_STATUSES: ProbeStatus[] = []
const INIT_PROBE_STATUS_DETAILS: StatusDetails = {
  alert: '',
  state: 'INIT',
  isDown: false,
  shouldSendNotification: false,
  totalSuccesses: 0,
  totalFailures: 0,
  consecutiveSuccesses: 0,
  consecutiveFailures: 0,
}
enum PROBE_STATE {
  INIT = 'INIT',
  UP_FAIL_BELOW_THRESHOLD = 'UP_FAIL_BELOW_THRESHOLD',
  UP_FAIL_EQUALS_THRESHOLD = 'UP_FAIL_EQUALS_THRESHOLD',
  UP_SUCCESS = 'UP_SUCCESS',
  DOWN_SUCCESS_BELOW_THRESHOLD = 'DOWN_SUCCESS_BELOW_THRESHOLD',
  DOWN_SUCCESS_EQUALS_THRESHOLD = 'DOWN_SUCCESS_EQUALS_THRESHOLD',
  DOWN_FAIL = 'DOWN_FAIL',
}

// Function to determine probe state
const determineProbeState = ({
  probeStatus,
  validation,
  successThreshold,
  failedThreshold,
}: {
  errorName: string
  probeStatus: StatusDetails
  validation: ValidateResponseStatus
  successThreshold: number
  failedThreshold: number
}) => {
  const { isDown, consecutiveSuccesses, consecutiveFailures } = probeStatus
  const { status } = validation

  if (!isDown && status && consecutiveFailures === failedThreshold - 1)
    return PROBE_STATE.UP_FAIL_EQUALS_THRESHOLD

  if (!isDown && status && consecutiveFailures < failedThreshold - 1) {
    return PROBE_STATE.UP_FAIL_BELOW_THRESHOLD
  }

  if (!isDown && !status) return PROBE_STATE.UP_SUCCESS

  if (isDown && !status && consecutiveSuccesses === successThreshold - 1)
    return PROBE_STATE.DOWN_SUCCESS_EQUALS_THRESHOLD

  if (isDown && !status && consecutiveSuccesses < successThreshold - 1)
    return PROBE_STATE.DOWN_SUCCESS_BELOW_THRESHOLD

  if (isDown && status) return PROBE_STATE.DOWN_FAIL

  return PROBE_STATE.INIT
}

// Function to update probe status according to the state
const updateProbeStatus = (
  statusDetails: StatusDetails,
  state: PROBE_STATE
) => {
  switch (state) {
    case 'UP_SUCCESS':
      statusDetails = {
        ...statusDetails,
        state: 'UP_SUCCESS',
        shouldSendNotification: false,
        consecutiveFailures: 0,
        consecutiveSuccesses: statusDetails.consecutiveSuccesses + 1,
        totalSuccesses: statusDetails.totalSuccesses + 1,
      }
      return statusDetails
    case 'UP_FAIL_BELOW_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'UP_FAIL_BELOW_THRESHOLD',
        shouldSendNotification: false,
        consecutiveSuccesses: 0,
        totalFailures: statusDetails.totalFailures + 1,
        consecutiveFailures: statusDetails.consecutiveFailures + 1,
      }
      return statusDetails
    case 'UP_FAIL_EQUALS_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'UP_FAIL_EQUALS_THRESHOLD',
        shouldSendNotification: true,
        isDown: true,
      }
      return statusDetails
    case 'DOWN_FAIL':
      statusDetails = {
        ...statusDetails,
        state: 'DOWN_FAIL',
        shouldSendNotification: false,
        consecutiveSuccesses: 0,
        consecutiveFailures: statusDetails.consecutiveFailures + 1,
        totalFailures: statusDetails.totalFailures + 1,
      }
      return statusDetails
    case 'DOWN_SUCCESS_BELOW_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'DOWN_SUCCESS_BELOW_THRESHOLD',
        shouldSendNotification: false,
        consecutiveFailures: 0,
        totalSuccesses: statusDetails.totalSuccesses + 1,
        consecutiveSuccesses: statusDetails.consecutiveSuccesses + 1,
      }
      return statusDetails
    case 'DOWN_SUCCESS_EQUALS_THRESHOLD':
      statusDetails = {
        ...statusDetails,
        state: 'DOWN_SUCCESS_EQUALS_THRESHOLD',
        shouldSendNotification: true,
        isDown: false,
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
  successThreshold,
  failedThreshold,
}: {
  probe: Probe
  validatedResp: ValidateResponseStatus[]
  successThreshold: number
  failedThreshold: number
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
      alerts.forEach((alert) => {
        PROBE_STATUSES.push({
          id,
          name,
          requests: 0,
          details: { ...INIT_PROBE_STATUS_DETAILS, alert },
        })
      })
    }

    // Check if there is any alert that is triggered
    // If the alert is being triggered <threshold> times, send alert and
    // change the server status respectively.
    const probeIndex = PROBE_STATUSES.findIndex(
      (probeStatus) => probeStatus.id === id
    )
    const currentProbe = PROBE_STATUSES[probeIndex]

    // Add request count
    currentProbe.requests += 1
    log(`\nRequest ${currentProbe.requests}\n`)

    // Calculate the count for successes and failures
    if (validatedResp.length > 0) {
      validatedResp.forEach(async (validation) => {
        const { alert } = validation

        if (alert.includes('status-not')) {
          const foundStatus = PROBE_STATUSES.findIndex((item) => {
            return item.details.alert === alert
          })
          const state = determineProbeState({
            errorName: alert,
            probeStatus: PROBE_STATUSES[foundStatus].details,
            validation,
            successThreshold,
            failedThreshold,
          })
          const updatedStatus = updateProbeStatus(
            PROBE_STATUSES[foundStatus].details,
            state
          )
          PROBE_STATUSES[foundStatus].details = updatedStatus

          results.push(updatedStatus)

          log(`Alert ${updatedStatus.alert}`)
          log(`State ${updatedStatus.state}`)
          log(`Is Down? ${updatedStatus.isDown}`)
          log(`Total Successes ${updatedStatus.totalSuccesses}`)
          log(`Total Failures ${updatedStatus.totalFailures}`)
          log(`Consecutive Successes ${updatedStatus.consecutiveSuccesses}`)
          log(`Consecutive Failures ${updatedStatus.consecutiveFailures}\n\n`)
        }

        // Handle is response time error
        if (alert.includes('response-time-greater')) {
          const foundStatus = PROBE_STATUSES.findIndex((item) => {
            return item.details.alert === alert
          })
          const state = determineProbeState({
            errorName: alert,
            probeStatus: PROBE_STATUSES[foundStatus].details,
            validation,
            successThreshold,
            failedThreshold,
          })
          const updatedStatus = updateProbeStatus(
            PROBE_STATUSES[foundStatus].details,
            state
          )
          PROBE_STATUSES[foundStatus].details = updatedStatus

          results.push(updatedStatus)

          log(`Alert ${updatedStatus.alert}`)
          log(`State ${updatedStatus.state}`)
          log(`Is Down? ${updatedStatus.isDown}`)
          log(`Total Successes ${updatedStatus.totalSuccesses}`)
          log(`Total Failures ${updatedStatus.totalFailures}`)
          log(`Consecutive Successes ${updatedStatus.consecutiveSuccesses}`)
          log(`Consecutive Failures ${updatedStatus.consecutiveFailures}\n\n`)
        }
      })
    }

    return results
  } catch (error) {
    console.error(error.message)
    return []
  }
}
