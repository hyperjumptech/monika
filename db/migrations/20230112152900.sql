-- instatus_page_incidents definition

-- Drop Table
DROP TABLE IF EXISTS instatus_page_incidents;
-- Create Table
CREATE TABLE instatus_page_incidents (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	status TEXT NOT NULL,
	url TEXT NOT NULL,
	probe_id INTEGER NOT NULL,
	incident_id TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL);

CREATE INDEX instatus_page_incidents_incident_id_IDX ON instatus_page_incidents (incident_id);