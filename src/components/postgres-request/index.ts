import { Pool } from 'pg'
import { ProbeRequestResponse } from '../../interfaces/request'
import { differenceInMilliseconds } from 'date-fns'

export type PostgresParam = {
  host: string // Host address of the psql db
  port: number // Port number of the psql db
  database: string // Database name
  password: string // Password string if AUTH is used, optional
  username: string // Username string if used, optional
  command?: string
}

type PostgresResult = {
  isAlive: boolean // If the postgres db responded to our command
  message?: string // Any messages from the db driver
  responseData?: Buffer | null
}

export async function postgresRequest(
  params: PostgresParam
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
  const result = await sendPsqlRequest(params)
  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, startTime)

  if (result.isAlive) {
    baseResponse.responseTime = duration
    baseResponse.body = result.message
    baseResponse.status = 200
  } else {
    baseResponse.body = result.message
  }

  return baseResponse
}

async function sendPsqlRequest(params: PostgresParam): Promise<PostgresResult> {
  const result: PostgresResult = {
    isAlive: false,
    message: '',
  }

  try {
    const pool = new Pool({
      host: params.host,
      port: params.port,
      database: params.database,
      user: params.username,
      password: params.password,
    })

    const client = await pool.connect()
    await client.query('SELECT NOW()')
    result.message = 'postgres ok'
    result.isAlive = true
    await client.release()
  } catch (error: any) {
    result.message = error.message
  }

  return result
}
