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
    | 'UP_TRUE_EQUALS_THRESHOLD'
    | 'UP_TRUE_BELOW_THRESHOLD'
    | 'UP_FALSE'
    | 'DOWN_FALSE_EQUALS_THRESHOLD'
    | 'DOWN_FALSE_BELOW_THRESHOLD'
    | 'DOWN_TRUE'
  isDown: boolean
  shouldSendNotification: boolean
  totalTrue: number
  totalFalse: number
  consecutiveTrue: number
  consecutiveFalse: number
}
