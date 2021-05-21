-- Add reported field to notifications table
ALTER TABLE notifications
ADD reported INTEGER DEFAULT 0;