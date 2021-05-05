-- Drop Table
DROP TABLE IF EXISTS history;
-- Create Table
CREATE TABLE history (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  probe_id TEXT NOT NULL,
  probe_name TEXT,
  request_method TEXT NOT NULL,
  request_url TEXT NOT NULL,
  request_header TEXT,
  request_body TEXT,
  response_status INTEGER NOT NULL,
  response_header TEXT,
  response_body TEXT,
  response_time INTEGER NOT NULL,
  response_size INTEGER,
  error TEXT,
  reported INTEGER DEFAULT 0
)