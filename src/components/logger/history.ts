/**********************************************************************************
 * MIT License                                                                    *
 *                                                                                *
 * Copyright (c) 2021 Hyperjump Technology                                        *
 *                                                                                *
 * Permission is hereby granted, free of charge, to any person obtaining a copy   *
 * of this software and associated documentation files (the "Software"), to deal  *
 * in the Software without restriction, including without limitation the rights   *
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      *
 * copies of the Software, and to permit persons to whom the Software is          *
 * furnished to do so, subject to the following conditions:                       *
 *                                                                                *
 * The above copyright notice and this permission notice shall be included in all *
 * copies or substantial portions of the Software.                                *
 *                                                                                *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       *
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    *
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         *
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  *
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  *
 * SOFTWARE.                                                                      *
 **********************************************************************************/

import path from 'path'
import SQLite3 from 'sqlite3'
import { open, Database } from 'sqlite'

import { AxiosResponseWithExtraData } from '../../interfaces/request'
import { Probe } from '../../interfaces/probe'
import { log } from '../../utils/pino'

const sqlite3 = SQLite3.verbose()
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')

export type HistoryLog = {
  id: number
  created_at: string
  probe_id: string
  probe_name?: string | null
  request_method: string
  request_url: string
  request_header?: string | null
  request_body?: string | null
  response_status: number
  response_header?: string | null
  response_body?: string | null
  response_time: number
  response_size?: number | null
  error?: string | null
  reported: number
}

let db: Database<SQLite3.Database, SQLite3.Statement>

async function migrate() {
  await db.migrate({
    migrationsPath: path.join(__dirname, 'migrations'),
  })
}

/**
 * openLogfile will open the file history.db and if it doesnt exist, create it and sets up the table
 */
export async function openLogfile() {
  try {
    db = await open({
      filename: dbPath,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      driver: sqlite3.Database,
    })

    await migrate()
  } catch (error) {
    log.error("Warning: Can't open logfile. ", error.message)
  }
}

/**
 * getAllLogs gets all the history table from sqlite db
 * @returns {obj} result of logs table
 */
export async function getAllLogs(): Promise<HistoryLog[]> {
  const readRowsSQL = 'SELECT * FROM probe_requests'

  return db.all(readRowsSQL)
}

export async function getUnreportedLogs(): Promise<HistoryLog[]> {
  const readRowsSQL = 'SELECT * FROM probe_requests WHERE reported = 0'

  return db.all(readRowsSQL)
}

export async function setLogsAsReported(ids: number[]) {
  const updateRowsSQL = `UPDATE probe_requests SET reported = 1 WHERE id IN (${ids.join(
    ', '
  )})`

  await db.run(updateRowsSQL)
}

/**
 * flushAllLogs drops the table and recreates it
 */
export async function flushAllLogs() {
  const dropProbeRequestsTableSQL = 'DROP TABLE IF EXISTS probe_requests;'
  const dropAlertsTableSQL = 'DROP TABLE IF EXISTS alerts;'
  const dropNotificationsTableSQL = 'DROP TABLE IF EXISTS notifications;'
  const dropMigrationsTableSQL = 'DROP TABLE IF EXISTS migrations;'

  await Promise.all([
    db.run(dropProbeRequestsTableSQL),
    db.run(dropAlertsTableSQL),
    db.run(dropNotificationsTableSQL),
    db.run(dropMigrationsTableSQL),
  ])

  await migrate()
}

/**
 * saveLog inserts log information into the table oclumns
 *
 * @param {object} probe is the probe config
 * @param {object} probeRes this is the response time of the probe
 * @param {number} requestIndex is the request index from a probe
 * @param {string} errorResp if there was an error, it will be stored here
 */
export async function saveLog(
  probe: Probe,
  probeRes: AxiosResponseWithExtraData,
  requestIndex: number,
  errorResp: string
) {
  const insertSQL = `
    INSERT INTO probe_requests (
        created_at,
        probe_id,
        probe_name,
        request_method,
        request_url,
        request_header,
        request_body,
        response_status,
        response_header,
        response_body,
        response_time,
        response_size,
        error
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

  const createdAt = Math.round(Date.now() / 1000)

  const params = [
    createdAt,
    probe.id,
    probe.name,
    probeRes.config.method,
    probeRes.config.url,
    JSON.stringify(probeRes.config.headers),
    probeRes.config.data,
    probeRes.status,
    JSON.stringify(probeRes.headers),
    typeof probeRes.data === 'string'
      ? probeRes.data
      : JSON.stringify(probeRes.data), // TODO: limit data stored.
    probeRes.config.extraData?.responseTime,
    probeRes.headers['content-length'],
    errorResp,
  ]

  await db.run(insertSQL, params).catch((error) => {
    log.error("Error: Can't insert data into monika-log.db. " + error.message)
  })
}

/**
 * closeLog closes the database
 */
export async function closeLog() {
  await db.close()
}
