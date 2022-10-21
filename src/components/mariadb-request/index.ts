import { ProbeRequestResponse } from '../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'
import { checkMariaDBConnection } from '@hyperjumptech/db-connection-checker'

export type MariaParam = {
  host: string // Host address of the psql db
  port: number // Port number of the psql db
  database: string // Database name
  username: string // Username string of the database user
  password: string // Password string of the database user
  command?: string
}

export async function mariaRequest(
  params: MariaParam
): Promise<ProbeRequestResponse> {
  const baseResponse: ProbeRequestResponse = {
    requestType: 'postgres',
    data: '',
    body: '',
    status: 0,
    headers: '',
    responseTime: 0,
  }

  const startTime = new Date()
  let isConnected = false
  try {
    isConnected = await checkMariaDBConnection({
      host: params.host,
      port: params.port,
      user: params.username,
      password: params.password,
      database: params.database,
    })
  } catch (error: any) {
    baseResponse.body = error.message
    isConnected = false
  }

  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (isConnected) {
    baseResponse.responseTime = duration
    baseResponse.body = 'mariadb ok'
    baseResponse.status = 200
  }

  return baseResponse
}
