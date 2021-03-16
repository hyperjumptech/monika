export interface ServerStatus {
  id: string
  name: string
  requests: number

  isStatusCodeError: StatusCount
  isResponseTimeError: StatusCount
}

export interface StatusCount {
  isDown: boolean
  totalSuccesses: number
  totalFailures: number
  consecutiveSuccesses: number
  consecutiveFailures: number
}
