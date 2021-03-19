import { AxiosResponseWithExtraData } from '../interfaces/request'
import { Probe } from '../interfaces/probe'
import { log } from 'console'
import path from 'path'

const sqlite3 = require('sqlite3').verbose()

export type HistoryLogType = {
  id: number
  probeID: string
  statusCode: number
  probeURL: string
  responseTime: number
}

let db: any

/**
 * createTable will create the history table if it does not exist
 */
async function createTable() {
  const createTablSQL = `CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY,
    created_at TEXT,
    probe_id TEXT,
    status_code INTEGER,
    probe_name TEXT,
    probe_url TEXT,
    response_time INTEGER,
    error_resp TEXT
);`
  await db.run(createTablSQL)
}

/**
 * openLogfile will open the file history.db and if it doesnt exist, create it and sets up the table
 */
export async function openLogfile() {
  const dbPath = path.resolve(__dirname, 'history.db')

  db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    async (err: Error) => {
      if (err) {
        log('warning: cannot open logfile. error:', err.message)
      }
      await createTable()
    }
  )
}

export const getAllLogs = (): Promise<HistoryLogType[]> => {
  const readRowsSQL =
    'SELECT rowid AS id, probe_id, status_code, probe_url, response_time FROM history'

  const res : Promise<HistoryLogType[]> = new Promise((resolve, reject) => {
    db.all(readRowsSQL, (err: Error, data: HistoryLogType[]) => {
      if (err) return reject(err)

      return resolve(data)
    })
  })
  return res 
}

/**
 * flushAllLogs drops the table and recreates it
 */
export async function flushAllLogs() {
  const dropTableSQL = 'DROP TABLE IF EXISTS history'

  await db.run(dropTableSQL)
  await createTable()
}

/**
 * saveLog inserts log information into the table oclumns
 *
 * @param {object} probe is the probe config
 * @param {object} probeRes this is the response time of the probe
 * @param {string} errorResp if there was an error, it will be stored here
 */
export async function saveLog(
  probe: Probe,
  probeRes: AxiosResponseWithExtraData,
  errorResp: string
) {
  const insertSQL = `INSERT into history (probe_id, created_at, status_code, probe_name, probe_url, response_time, error_resp) 
  VALUES(?, ?, ?, ?, ?, ?, ?);`

  const created = new Date()

  const params = [
    probe.id,
    created,
    probeRes.status,
    probe.name,
    probe.request.url,
    probeRes.config.extraData?.responseTime,
    errorResp,
  ]

  await db.run(insertSQL, params, (err: Error) => {
    if (err) {
      return log('error, cannot insert data into history.db', err)
    }
  })
}

/**
 * closeDB closes the database
 */
export function closeLog() {
  db.close()
}
