import { ProbeRequestResponse } from '../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'
import { createConnection } from 'mariadb'

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
    requestType: 'mariadb',
    data: '',
    body: '',
    status: 0,
    headers: '',
    responseTime: 0,
    isSuccess: false,
  }

  const startTime = new Date()
  let isConnected = false
  try {
    isConnected = await checkConnection({
      host: params.host,
      port: params.port,
      username: params.username,
      password: params.password,
      database: params.database,
    })
  } catch (error: any) {
    baseResponse.body = error.message
    baseResponse.errMessage = error.message
    isConnected = false
  }

  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (isConnected) {
    baseResponse.responseTime = duration
    baseResponse.body = 'database ok'
    baseResponse.status = 200 // TODO: Remove http mapping
    baseResponse.isSuccess = true
  }

  return baseResponse
}

async function checkConnection(params?: MariaParam) {
  const client = await createConnection({
    host: params?.host,
    port: params?.port,
    user: params?.username,
    password: params?.password,
    database: params?.database,

    allowPublicKeyRetrieval: true,
  })

  await client.end()
  return true
}
