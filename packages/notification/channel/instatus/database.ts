import path from 'path'
import sqlite3 from 'sqlite3'
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
  // eslint-disable-next-line camelcase
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

  await (await getDatabase()).run(sqlStatement, sqlParams)
}

export async function updateIncident({
  incidentID,
  status,
}: UpdateIncident): Promise<void> {
  const dateNow = Math.round(Date.now() / 1000)
  const sqlStatement = `UPDATE instatus_page_incidents SET status = ?, updated_at = ?
   WHERE incident_id = ?`
  const sqlParams = [status, dateNow, incidentID]

  await (await getDatabase()).run(sqlStatement, sqlParams)
}

export async function findIncident({
  probeID,
  status,
  url,
}: FindIncident): Promise<FindIncidentResponse | undefined> {
  const sqlStatement = `SELECT incident_id FROM instatus_page_incidents 
    WHERE status = ? AND url = ? AND probe_id = ? LIMIT 1`
  const sqlParams = [status, url, probeID]
  const incident = await (
    await getDatabase()
  ).get<FindIncidentResponse>(sqlStatement, sqlParams)

  return incident
}

async function getDatabase(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  if (!db) {
    db = await open({
      filename: dbPath,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      driver: sqlite3.Database,
    })
  }

  return db
}
