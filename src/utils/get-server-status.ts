import { Config } from './../interfaces/config'
import { ServerStatus, Status } from './../interfaces/server-status'
import { Probe } from '../interfaces/probe'
import { ValidateResponseStatus } from './alert'
import console, { log } from 'console'

const SERVER_STATUSES: ServerStatus[] = []

// Function to calculate successes and failures, either total or consecutives.
// If consecutive success/failure equals to threshold, it will send notifications
const calculateSuccessFailure = ({
  errorName,
  probeStatus,
  validation,
  threshold,
}: {
  errorName: string
  probeStatus: Status
  validation: ValidateResponseStatus
  threshold: number
}) => {
  log(`Checking for ${errorName} in probe...`)
  switch (probeStatus.isDown) {
    case false:
      // If current probe is UP and trigger equals true
      if (validation.status) {
        // Add failure count
        probeStatus.consecutiveSuccesses = 0
        probeStatus.totalFailures += 1
        probeStatus.consecutiveFailures += 1

        // If count is larger or equal than threshold...
        // Set status to down, and reset consecutive failure
        if (probeStatus.consecutiveFailures === threshold) {
          log(`Send error for ${errorName}`)
          probeStatus.shouldSendNotification = true
          probeStatus.isDown = true
        }
      } else {
        // Server is doing fine
        probeStatus.shouldSendNotification = false
        probeStatus.consecutiveFailures = 0
        probeStatus.consecutiveSuccesses += 1
        probeStatus.totalSuccesses += 1
      }

      return probeStatus
    case true:
      // If current probe is DOWN and trigger equals true
      if (validation.status) {
        // Server is not doing fine
        probeStatus.shouldSendNotification = false
        probeStatus.consecutiveSuccesses = 0
        probeStatus.consecutiveFailures += 1
        probeStatus.totalFailures += 1
      } else {
        // Add success count
        probeStatus.consecutiveFailures = 0
        probeStatus.totalSuccesses += 1
        probeStatus.consecutiveSuccesses += 1

        // If count is larger or equal than threshold...
        // Set status to down, and reset consecutive failure
        if (probeStatus.consecutiveSuccesses === threshold) {
          log(`Send resolved for ${errorName}`)
          probeStatus.shouldSendNotification = true
          probeStatus.isDown = false
        }
      }

      return probeStatus
    default:
      return probeStatus
  }
}

export const getServerStatus = ({
  probe,
  validatedResp,
  threshold,
}: {
  config: Config
  probe: Probe
  validatedResp: ValidateResponseStatus[]
  threshold: number
}) => {
  try {
    // Get Probe ID and Name
    const { id, name } = probe
    const results: Array<Status> = []

    // Initialize server status
    // This checks if there are no item in SERVER_STATUSES
    // that doesn't have item with ID === id, push new ServerStatus
    if (!SERVER_STATUSES.find((item) => item.id === id)) {
      SERVER_STATUSES.push({
        id,
        name,
        requests: 0,
        responseTimeError: {
          isDown: false,
          shouldSendNotification: false,
          totalSuccesses: 0,
          totalFailures: 0,
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
        },
        statusCodeError: {
          isDown: false,
          shouldSendNotification: false,
          totalSuccesses: 0,
          totalFailures: 0,
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
        },
      })
    }

    // Check if there is any alert that is triggered
    // If the alert is being triggered <threshold> times, send alert and
    // change the server status respectively.
    const probeIndex = SERVER_STATUSES.findIndex((probe) => probe.id === id)
    const currentProbe = SERVER_STATUSES[probeIndex]

    // Add request count
    currentProbe.requests += 1
    log(`\nRequest ${currentProbe.requests}\n`)

    // Calculate the count for successes and failures
    if (validatedResp.length > 0) {
      validatedResp.forEach(async (validation) => {
        const { alert } = validation

        // Handle is status code error
        if (alert.includes('status-not')) {
          const probeStatus = currentProbe.statusCodeError
          const result = calculateSuccessFailure({
            errorName: 'Status code not xxx',
            probeStatus,
            validation,
            threshold,
          })

          results.push(result)

          log(`Is Down? ${probeStatus.isDown}`)
          log(`Total Successes ${probeStatus.totalSuccesses}`)
          log(`Total Failures ${probeStatus.totalFailures}`)
          log(`Consecutive Successes ${probeStatus.consecutiveSuccesses}`)
          log(`Consecutive Failures ${probeStatus.consecutiveFailures}\n\n`)
        }

        // Handle is response time error
        if (alert.includes('response-time-greater')) {
          const probeStatus = currentProbe.responseTimeError
          const result = calculateSuccessFailure({
            errorName: 'Response time greater than xxx (m)s',
            probeStatus,
            validation,
            threshold,
          })

          results.push(result)

          log(`Is Down? ${probeStatus.isDown}`)
          log(`Total Successes ${probeStatus.totalSuccesses}`)
          log(`Total Failures ${probeStatus.totalFailures}`)
          log(`Consecutive Successes ${probeStatus.consecutiveSuccesses}`)
          log(`Consecutive Failures ${probeStatus.consecutiveFailures}\n\n`)
        }
      })
    }

    return results
  } catch (error) {
    console.error(error.message)
    return []
  }
}
