export interface ProbeStatus {
  id: string
  name: string
  requests: number
  details: StatusDetails
}

export interface StatusDetails {
  alert: string
  state:
    | 'INIT'
    | 'UP_FAIL_BELOW_THRESHOLD'
    | 'UP_FAIL_EQUALS_THRESHOLD'
    | 'UP_SUCCESS'
    | 'DOWN_SUCCESS_BELOW_THRESHOLD'
    | 'DOWN_SUCCESS_EQUALS_THRESHOLD'
    | 'DOWN_FAIL'
  isDown: boolean
  shouldSendNotification: boolean
  totalSuccesses: number
  totalFailures: number
  consecutiveSuccesses: number
  consecutiveFailures: number
}
