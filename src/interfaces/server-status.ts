export interface ServerStatus {
  id: string
  name: string
  requests: number

  statusCodeError: Status
  responseTimeError: Status
}

export interface Status {
  isDown: boolean
  shouldSendNotification: boolean
  totalSuccesses: number
  totalFailures: number
  consecutiveSuccesses: number
  consecutiveFailures: number
}
