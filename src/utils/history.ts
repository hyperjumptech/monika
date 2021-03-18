import { log } from 'console'
import path from 'path'

const sqlite3 = require('sqlite3').verbose()

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

/**
 * prints all content of history table
 */
export async function readAll() {
  await db.each(
    'SELECT rowid AS id, probe_id, probe_url, status_code, response_time FROM history',
    function (err: Error, row: any) {
      if (err) {
        log('warning: cannot read logfile. error:', err.message)
      }

      log(row.id + ': id:' + row.probe_id + 'status' + row.status_code)
    }
  )
}

/**
 * insertData inserts log information into the table oclumns
 *
 * @param {string} probeID this is the probe id
 *  * @param {number} statusCode this is the http status result of the http request
 * @param {string} probeName user assigned name of probe
 * @param {string} probeUrl this is the url target
 * @param {number} resposeTime this is the response time of the probe
 * @param {string} errorResp if there was an error, it will be stored here
 */

// eslint-disable-next-line max-params
export async function insertData( // maximum parameter is 4!
  probeID: number,
  statusCode: number,
  probeName: string,
  probeUrl: string,
  responseTime: number,
  errorResp: string
) {
  const insertSQL = `INSERT into history (probe_id, status_code, probe_name, probe_url, response_time, error_resp) VALUES(?, ?, ?, ?, ?, ?);`
  const params = [
    probeID,
    statusCode,
    probeName,
    probeUrl,
    responseTime,
    errorResp,
  ]

  db.run(insertSQL, params, (err: Error) => {
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
