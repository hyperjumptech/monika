-- Add tcp related columns to probe_requests table
ALTER TABLE probe_requests ADD request_type STRING DEFAULT "http";
ALTER TABLE probe_requests ADD socket_host STRING DEFAULT "http";
ALTER TABLE probe_requests ADD socket_port STRING DEFAULT "http";