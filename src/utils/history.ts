import { AxiosResponseWithExtraData } from '../interfaces/request'
import { Probe } from '../interfaces/probe'
import { log } from 'console'
import path from 'path'
import chalk from 'chalk'
import Table from 'cli-table3'

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
export async function printAllLogs() {
  const readRowsSQL =
    'SELECT rowid AS id, probe_id, status_code, probe_url, response_time FROM history'

  const table = new Table({
    style: { head: ['green'] },
    head: ['#', 'probe_id', 'status_code', 'probe_url', 'response_time'],
    wordWrap: true,
  })

  let statusColor: string

  await db.all(readRowsSQL, function (err: Error, data: any) {
    if (err) {
      log('warning: cannot read logfile. error:', err.message)
    }
    data.forEach((data: any) => {
      // colorize the statuscode
      switch (Math.trunc(data.status_code / 100)) {
        case 2:
          statusColor = 'green'
          break
        case 4:
          statusColor = 'orange'
          break
        case 5:
          statusColor = 'red'
          break
        default:
          statusColor = 'white'
      }

      table.push([
        data.id,
        { hAlign: 'center', content: data.probe_id },
        {
          hAlign: 'center',
          content: chalk.keyword(statusColor)(data.status_code),
        },
        data.probe_url,
        { hAlign: 'center', content: data.response_time },
      ])
    })
    log(table.toString())
  })
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
  const insertSQL = `INSERT into history (probe_id, status_code, probe_name, probe_url, response_time, error_resp) VALUES(?, ?, ?, ?, ?, ?);`
  const params = [
    probe.id,
    probeRes.status,
    probe.name,
    probe.request.url,
    probeRes.config.extraData?.responseTime,
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
