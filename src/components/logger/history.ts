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
import { Notification } from '../../interfaces/notification'
import { log } from '../../utils/pino'

const sqlite3 = SQLite3.verbose()
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')

type RequestsLog = {
  id: number
  probe_id: string
  response_status: number
  request_url: string
  response_time: number
}

export type UnreportedRequestsLog = {
  id: number
  timestamp: number
  probe_id: string
  probe_name?: string
  request_method: string
  request_url: string
  request_header?: string
  request_body?: string
  response_status: number
  response_header?: string
  response_time: number
  response_size?: number
  alerts: string[]
}

export type UnreportedNotificationsLog = {
  id: number
  timestamp: number
  probe_id: string
  probe_name: string
  alert_type: string
  type: string
  notification_id: string
  channel: string
}

export type UnreportedLog = {
  requests: UnreportedRequestsLog[]
  notifications: UnreportedNotificationsLog[]
}

let db: Database<SQLite3.Database, SQLite3.Statement>

async function migrate() {
  await db.migrate({
    migrationsPath: path.join(__dirname, '../../../db/migrations'),
  })
}

/**
 * openLogfile will open the file history.db and if it doesn't exist, create it and sets up the table
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

const objectNullValueToUndefined = <T extends Record<string, unknown>>(
  obj: T
): { [K in keyof T]: T[K] extends null ? undefined : T[K] } => {
  return Object.entries(obj)
    .map(([k, v]) => [k, v === null ? undefined : v] as [string, unknown])
    .reduce((acc, [k, v]) => {
      acc[k] = v
      return acc
    }, {} as any)
}

/**
 * getAllLogs gets all the history table from sqlite db
 * @returns {obj} result of logs table
 */
export async function getAllLogs(): Promise<RequestsLog[]> {
  const readRowsSQL =
    'SELECT id, probe_id, response_status, request_url, response_time FROM probe_requests'

  return db.all(readRowsSQL)
}

export async function getUnreportedLogs(): Promise<UnreportedLog> {
  const readUnreportedRequestsSQL = `
    SELECT PR.id,
      PR.created_at as timestamp,
      PR.probe_id,
      PR.probe_name,
      PR.request_method,
      PR.request_url,
      PR.request_header,
      PR.request_body,
      PR.response_status,
      PR.response_header,
      PR.response_time,
      PR.response_size,
      CASE
        WHEN A.type IS NULL THEN json_array()
        ELSE json_group_array(A.type)
      END alerts
    FROM probe_requests PR
      LEFT JOIN alerts A ON PR.id = A.probe_request_id
    WHERE PR.reported = 0
    GROUP BY PR.id;`

  const readUnreportedNotificationsSQL = `
    SELECT id,
      created_at as timestamp,
      probe_id,
      probe_name,
      alert_type,
      type,
      notification_id,
      channel
    FROM notifications
    WHERE reported = 0;`

  const [unreportedRequests, unreportedNotifications] = await Promise.all([
    db.all(readUnreportedRequestsSQL).then(
      (data) =>
        data.map((d) => ({
          ...objectNullValueToUndefined(d),
          alerts: JSON.parse(d.alerts),
        })) as UnreportedRequestsLog[]
    ),
    db
      .all(readUnreportedNotificationsSQL)
      .then(
        (data) =>
          data.map(objectNullValueToUndefined) as UnreportedNotificationsLog[]
      ),
  ])

  return {
    requests: unreportedRequests,
    notifications: unreportedNotifications,
  }
}

export async function setRequestLogAsReported(ids: number[]) {
  const updateRowsSQL = `UPDATE probe_requests SET reported = 1 WHERE id IN (${ids.join(
    ', '
  )})`

  await db.run(updateRowsSQL)
}

export async function setNotificationLogAsReported(ids: number[]) {
  const updateRowsSQL = `UPDATE notifications SET reported = 1 WHERE id IN (${ids.join(
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

    // The VACUUM command cleans the main database by copying its contents to a temporary database file and reloading the original database file from the copy.
    // This eliminates free pages, aligns table data to be contiguous, and otherwise cleans up the database file structure.
    // When VACUUMing a database, as much as twice the size of the original database file is required in free disk space.
    db.run('vacuum'),
  ])

  await migrate()
}

/**
 * saveProbeRequestLog inserts probe request log information into the database
 *
 * @param {object} probe is the probe config
 * @param {object} probeRes this is the response of the probe
 * @param {string[]} alerts the alerts triggered
 * @param {string} errorResp if there was an error, it will be stored here
 */
export async function saveProbeRequestLog(
  probe: Probe,
  probeRes: AxiosResponseWithExtraData,
  alerts?: string[],
  errorResp?: string
) {
  const insertProbeRequestSQL = `
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

  const insertAlertSQL = `
    INSERT INTO alerts (
        created_at,
        probe_request_id,
        type
      )
    VALUES (?, ?, ?);`

  const now = Math.round(Date.now() / 1000)

  try {
    const insertProbeRequestResult = await db.run(insertProbeRequestSQL, [
      now,
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
    ])

    await Promise.all(
      (alerts ?? []).map((alert) =>
        db.run(insertAlertSQL, [now, insertProbeRequestResult.lastID, alert])
      )
    )
  } catch (error) {
    log.error("Error: Can't insert data into monika-log.db. " + error.message)
  }
}

/**
 * saveNotificationLog inserts probe request log information into the database
 *
 * @param {object} probe is the probe config
 * @param {object} notification is the notification config
 * @param {string} type is the type of notification 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER'
 * @param {string} alert the alerts triggered
 */
export async function saveNotificationLog(
  probe: Probe,
  notification: Notification,
  type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER',
  alert: string
) {
  const insertNotificationSQL = `
    INSERT INTO notifications (
        created_at,
        probe_id,
        probe_name,
        alert_type,
        type,
        notification_id,
        channel
      )
    VALUES (?, ?, ?, ?, ?, ?, ?);`

  const now = Math.round(Date.now() / 1000)

  try {
    await db.run(insertNotificationSQL, [
      now,
      probe.id,
      probe.name,
      alert,
      type,
      notification.id,
      notification.type,
    ])
  } catch (error) {
    log.error("Error: Can't insert data into monika-log.db. " + error.message)
  }
}

/**
 * closeLog closes the database
 */
export async function closeLog() {
  await db.close()
}
