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
import * as sqlite3 from 'sqlite3'
import { open, type Database } from 'sqlite'

type Incident = {
  id: string
  status: string
  url: string
  probeID: string
  incidentID: string
}
type InsertIncident = Omit<Incident, 'id'>
type UpdateIncident = Pick<Incident, 'incidentID' | 'status'>
type FindIncident = Pick<Incident, 'probeID' | 'status' | 'url'>

type FindIncidentResponse = {
  incident_id: string
}

const dbPath = path.resolve(process.cwd(), 'monika-logs.db')
let db: Database<sqlite3.Database, sqlite3.Statement>

export async function insertIncident({
  status,
  url,
  probeID,
  incidentID,
}: InsertIncident): Promise<void> {
  const dateNow = Math.round(Date.now() / 1000)
  const sqlStatement = `INSERT INTO instatus_page_incidents (
    status,
    url,
    probe_id,
    incident_id,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?);`
  const sqlParams = [status, url, probeID, incidentID, dateNow, dateNow]

  await getDatabase().then((db) => db.run(sqlStatement, sqlParams))
}

export async function updateIncident({
  incidentID,
  status,
}: UpdateIncident): Promise<void> {
  const dateNow = Math.round(Date.now() / 1000)
  const sqlStatement = `UPDATE instatus_page_incidents SET status = ?, updated_at = ?
   WHERE incident_id = ?`
  const sqlParams = [status, dateNow, incidentID]

  await getDatabase().then((db) => db.run(sqlStatement, sqlParams))
}

export async function findIncident({
  probeID,
  status,
  url,
}: FindIncident): Promise<FindIncidentResponse | undefined> {
  const sqlStatement = `SELECT incident_id FROM instatus_page_incidents 
    WHERE status = ? AND url = ? AND probe_id = ? LIMIT 1`
  const sqlParams = [status, url, probeID]
  const incident = await getDatabase().then((db) =>
    db.get<FindIncidentResponse>(sqlStatement, sqlParams)
  )

  return incident
}

async function getDatabase(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  if (!db) {
    db = await open({
      filename: dbPath,
      // eslint-disable-next-line no-bitwise
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      driver: sqlite3.Database,
    })
  }

  return db
}
