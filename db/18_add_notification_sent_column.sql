-- Add notification_sent column to daily_quiz table
-- This tracks which quizzes have already sent push notifications

ALTER TABLE daily_quiz 
ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for faster queries when checking pending notifications
CREATE INDEX idx_daily_quiz_notification_pending 
ON daily_quiz (drop_at_utc, notification_sent, template_cdn_url);