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
import { open, Database, ISqlite } from 'sqlite'

import { ProbeRequestResponse } from '../../interfaces/request'
import { Probe } from '../../interfaces/probe'
import type { Notification } from '@hyperjumptech/monika-notification'
import { log } from '../../utils/pino'
import { getConfig } from '../config'
const sqlite3 = SQLite3.verbose()
const dbPath = path.resolve(process.cwd(), 'monika-logs.db')

type RequestsLog = {
  id: number
  probeId: string
  responseStatus: number
  requestUrl: string
  responseTime: number
}

export type UnreportedRequestsLog = {
  id: number
  timestamp: number
  probeId: string
  responseStatus: number
  responseTime: number
  alerts: string[]
}

export type UnreportedNotificationsLog = {
  id: number
  timestamp: number
  probeId: string
  probeName: string
  alertType: string
  type: string
  notificationId: string
  channel: string
}

export type UnreportedLog = {
  requests: UnreportedRequestsLog[]
  notifications: UnreportedNotificationsLog[]
}

export type ProbeIdDate = {
  id: string
  createdAt: number
}

export type ProbeReqIdDate = {
  id: number
  createdAt: number
}

export type DeleteProbeRes = {
  probeIds: ProbeIdDate[]
  probeRequestIds: ProbeReqIdDate[]
}

type Summary = {
  numberOfProbes: number
  numberOfIncidents: number
  numberOfRecoveries: number
  numberOfSentNotifications: number
}

type ProbeRequestDB = {
  id: number

  probe_id: string
  response_status: number
  request_url: string
  response_time: number
  /* eslint-enable camelcase */
}

type UnreportedProbeRequestDB = {
  alerts: string
  id: number

  probe_id: string
  response_status: number
  response_time: number
  timestamp: number
  /* eslint-enable camelcase */
}

type UnreportedNotificationDB = {
  id: number
  timestamp: number

  probe_id: string
  probe_name: string
  alert_type: string
  type: string
  notification_id: string
  channel: string
  /* eslint-enable camelcase */
}

let db: Database<SQLite3.Database, SQLite3.Statement>

export function database() {
  return db
}

export function setDatabase(
  database: Database<SQLite3.Database, SQLite3.Statement>
) {
  db = database
}

async function migrate() {
  await database().migrate({
    migrationsPath: path.join(__dirname, '../../../db/migrations'),
  })
}

/**
 * openLogfile will open the file history.db and if it doesn't exist, create it and sets up the table
 * @returns Promise<void>
 */
export async function openLogfile(): Promise<void> {
  try {
    const db = await open({
      filename: dbPath,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      driver: sqlite3.Database,
    })
    setDatabase(db)

    await migrate()
  } catch (error) {
    log.error("Warning: Can't open logfile. " + error.message)
  }
}

export async function deleteFromProbeRequests(
  limit: number
): Promise<DeleteProbeRes> {
  const getIdsToBeDeleted = `SELECT id, probe_id, created_at FROM probe_requests order by created_at asc limit ${limit}`
  const idsres = await database().all(getIdsToBeDeleted)
  const ids = idsres.map((res) => ({ id: res.id, createdAt: res.createdAt }))
  const probeIds = idsres.map((res) => ({
    id: res.probe_id,
    createdAt: res.created_at,
  }))
  if (idsres.length > 0) {
    const deleteFromProbeRequests = `DELETE FROM probe_requests WHERE id IN (${getIdsToBeDeleted})`
    await database().run(deleteFromProbeRequests)
  }

  return {
    probeIds,
    probeRequestIds: ids,
  }
}

export async function deleteFromAlerts(
  probeReqIds: ProbeReqIdDate[]
): Promise<void> {
  if (probeReqIds.length > 0) {
    await Promise.all(
      probeReqIds.map(async (item) => {
        const deleteFromAlerts = `DELETE FROM alerts WHERE probe_request_id = ${item.id} and created_at = ${item.createdAt}`
        await database().run(deleteFromAlerts)
      })
    )
  }
}

export async function deleteFromNotifications(
  probeIds: ProbeIdDate[]
): Promise<void> {
  if (probeIds.length > 0) {
    await Promise.all(
      probeIds.map(async (item) => {
        const deleteFromNotifications = `DELETE FROM notifications WHERE probe_id = ${item.id} and created_at = ${item.createdAt}`
        await database().run(deleteFromNotifications)
      })
    )
  }
}

/**
 * getAllLogs gets all the history table from sqlite db
 * @returns {obj} result of logs table
 */
export async function getAllLogs(): Promise<RequestsLog[]> {
  const readRowsSQL =
    'SELECT id, probe_id, response_status, request_url, response_time FROM probe_requests'
  const probeRequests = await database().all(readRowsSQL)
  const dbVal = probeRequests.map((probeRequest: ProbeRequestDB) => {
    /* eslint-disable camelcase */
    const { id, probe_id, request_url, response_status, response_time } =
      probeRequest

    return {
      id,
      probeId: probe_id,
      responseStatus: response_status,
      requestUrl: request_url,
      responseTime: response_time,
    }
    /* eslint-enable camelcase */
  })

  return dbVal
}

export async function getUnreportedLogsCount(): Promise<number> {
  const readUnreportedRequestsCountSQL = `
    SELECT COUNT(id) as count
    FROM probe_requests
    WHERE reported = 0;`

  const row = await database().get(readUnreportedRequestsCountSQL)

  return row?.count || 0
}

export async function getUnreportedLogs(
  ids: string[],
  limit: number,
  database: Database<SQLite3.Database, SQLite3.Statement> = db
): Promise<UnreportedLog> {
  const readUnreportedRequestsSQL = `
    SELECT PR.id,
      PR.created_at as timestamp,
      PR.probe_id,
      PR.response_status,
      PR.response_time,
      CASE
        WHEN A.type IS NULL THEN json_array()
        ELSE json_group_array(A.type)
      END alerts
    FROM probe_requests PR
      LEFT JOIN alerts A ON PR.id = A.probe_request_id
    WHERE PR.reported = 0 AND PR.probe_id IN ('${ids.join("','")}')
    GROUP BY PR.id
    ORDER BY PR.created_at ASC
    LIMIT ${limit};`

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
    WHERE reported = 0 AND probe_id IN ('${ids.join("','")}')
    ORDER BY timestamp ASC
    LIMIT ${limit};`

  const [unreportedRequests, unreportedNotifications] = await Promise.all([
    database.all(readUnreportedRequestsSQL).then(
      (unreportedProbeRequests: UnreportedProbeRequestDB[]) =>
        /* eslint-disable camelcase */
        unreportedProbeRequests.map(
          (unreportedProbeRequest: UnreportedProbeRequestDB) => {
            const {
              alerts,
              id,
              probe_id,
              response_status,
              response_time,
              timestamp,
            } = unreportedProbeRequest

            return {
              alerts: JSON.parse(alerts),
              id,
              probeId: probe_id,
              responseStatus: response_status,
              responseTime: response_time,
              timestamp,
            }
          }
        )

      /* eslint-enable camelcase */
    ),
    database
      .all(readUnreportedNotificationsSQL)
      .then((unreportedNotifications: UnreportedNotificationDB[]) =>
        unreportedNotifications.map((unreportedNotification) => {
          /* eslint-disable camelcase */
          const {
            alert_type,
            channel,
            id,
            notification_id,
            probe_id,
            probe_name,
            timestamp,
            type,
          } = unreportedNotification

          return {
            alertType: alert_type,
            channel,
            id,
            notificationId: notification_id,
            probeId: probe_id,
            probeName: probe_name,
            timestamp,
            type,
          }
          /* eslint-enable camelcase */
        })
      ),
  ])

  return {
    requests: unreportedRequests,
    notifications: unreportedNotifications,
  }
}

export async function deleteRequestLogs(
  ids: string[],
  database: Database<SQLite3.Database, SQLite3.Statement> = db
): Promise<ISqlite.RunResult> {
  const idsString = ids.join("','")
  const sql = `DELETE FROM probe_requests WHERE probe_id IN ('${idsString}');`

  return database.run(sql)
}

export async function deleteNotificationLogs(
  ids: string[],
  database: Database<SQLite3.Database, SQLite3.Statement> = db
): Promise<ISqlite.RunResult> {
  const idsString = ids.join("','")
  const sql = `DELETE FROM notifications WHERE probe_id IN ('${idsString}');`

  return database.run(sql)
}

/**
 * flushAllLogs drops the table and recreates it
 * @returns Promise<void>
 */
export async function flushAllLogs(): Promise<void> {
  const dropAtlassianStatusPageTableSQL =
    'DROP TABLE IF EXISTS atlassian_status_page_incidents;'
  const dropInstatusPageTableSQL =
    'DROP TABLE IF EXISTS instatus_page_incidents;'
  const dropProbeRequestsTableSQL = 'DROP TABLE IF EXISTS probe_requests;'
  const dropAlertsTableSQL = 'DROP TABLE IF EXISTS alerts;'
  const dropNotificationsTableSQL = 'DROP TABLE IF EXISTS notifications;'
  const dropMigrationsTableSQL = 'DROP TABLE IF EXISTS migrations;'

  await Promise.all([
    database().run(dropAtlassianStatusPageTableSQL),
    database().run(dropProbeRequestsTableSQL),
    database().run(dropAlertsTableSQL),
    database().run(dropNotificationsTableSQL),
    database().run(dropMigrationsTableSQL),
    database().run(dropInstatusPageTableSQL),

    // The VACUUM command cleans the main database by copying its contents to a temporary database file and reloading the original database file from the copy.
    // This eliminates free pages, aligns table data to be contiguous, and otherwise cleans up the database file structure.
    // When VACUUMing a database, as much as twice the size of the original database file is required in free disk space.
    database().run('vacuum'),
  ])

  await migrate()
}

/**
 * saveProbeRequestLog inserts probe request log information into the database
 *
 * @param {object} data is the log data containing information about probe request
 * @returns Promise<void>
 */
export async function saveProbeRequestLog({
  probe,
  requestIndex,
  probeRes,
  alertQueries,
  error: errorResp,
}: {
  probe: Probe
  requestIndex: number
  probeRes: ProbeRequestResponse
  alertQueries?: string[]
  error?: string
}): Promise<void> {
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
        error,
        request_type,
        socket_host,
        socket_port
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

  const insertAlertSQL = `
    INSERT INTO alerts (
        created_at,
        probe_request_id,
        type
      )
    VALUES (?, ?, ?);`

  const now = Math.round(Date.now() / 1000)
  const requestConfig = probe.requests?.[requestIndex]

  // TODO: limit data stored.
  const responseBody = requestConfig?.saveBody
    ? typeof probeRes.data === 'string'
      ? probeRes.data
      : JSON.stringify(probeRes.data)
    : ''

  try {
    const insertProbeRequestResult = await database().run(
      insertProbeRequestSQL,
      [
        now,
        probe.id,
        probe.name,
        requestConfig?.method || 'TCP', // if TCP, there's no method, so just set to TCP
        requestConfig?.url || 'http://', // if TCP, there's no URL so just set to this http://
        JSON.stringify(requestConfig?.headers),
        JSON.stringify(requestConfig?.body),
        probeRes.status,
        JSON.stringify(probeRes.headers),
        responseBody,
        probeRes?.responseTime ?? 0,
        probeRes.headers['content-length'],
        errorResp,
        probe.socket ? 'tcp' : 'http',
        probe.socket?.host || '',
        probe.socket?.port || '',
      ]
    )

    await Promise.all(
      (alertQueries ?? []).map((alert) =>
        database().run(insertAlertSQL, [
          now,
          insertProbeRequestResult.lastID,
          alert,
        ])
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
 * @param {string} alertQuery the alerts triggered
 * @returns Promise<void>
 */
export async function saveNotificationLog(
  probe: Probe,
  notification: Notification,
  type: 'NOTIFY-INCIDENT' | 'NOTIFY-RECOVER' | 'NOTIFY-TLS',
  alertQuery: string
): Promise<void> {
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
    await database().run(insertNotificationSQL, [
      now,
      probe.id,
      probe.name,
      alertQuery,
      type,
      notification.id,
      notification.type,
    ])
  } catch (error) {
    log.error("Error: Can't insert data into monika-log.db. " + error.message)
  }
}

export async function getSummary(): Promise<Summary> {
  const getNotificationsSummaryByTypeSQL = `SELECT type, COUNT(*) as count FROM notifications WHERE created_at > strftime('%s', datetime('now', '-24 hours')) GROUP BY type;`

  const notificationsSummaryByType = await database().all(
    getNotificationsSummaryByTypeSQL
  )

  const numberOfIncidents: number =
    notificationsSummaryByType.find((notif) => notif.type === 'NOTIFY-INCIDENT')
      ?.count || 0
  const numberOfRecoveries: number =
    notificationsSummaryByType.find((notif) => notif.type === 'NOTIFY-RECOVER')
      ?.count || 0
  const numberOfSentNotifications: number = notificationsSummaryByType.reduce(
    (acc, { count }) => acc + count,
    0
  )

  const config = getConfig()

  return {
    numberOfProbes: config?.probes?.length ? config.probes.length : 0,
    numberOfIncidents,
    numberOfRecoveries,
    numberOfSentNotifications,
  }
}

/**
 * closeLog closes the database
 * @returns Promise<void>
 */
export async function closeLog(): Promise<void> {
  await db?.close()
}
