-- Create probe_requests table and fill data from history table
CREATE TABLE probe_requests (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
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
);
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
    reported
  )
SELECT strftime('%s', created_at),
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
  reported
FROM history;
DROP TABLE history;
-- Create alerts table
CREATE TABLE alerts (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  probe_request_id INTEGER NOT NULL REFERENCES probe_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type TEXT NOT NULL
);
-- Create notifications table
CREATE TABLE notifications (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  created_at INTEGER NOT NULL,
  probe_id TEXT NOT NULL,
  probe_name TEXT,
  alert_type TEXT NOT NULL,
  type TEXT NOT NULL,
  notification_id TEXT NOT NULL,
  channel TEXT NOT NULL
);