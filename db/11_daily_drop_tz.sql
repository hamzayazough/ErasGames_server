-- 11_daily_drop_tz.sql
-- Migration for DailyDropTZ entity
-- Eras Quiz: Per-timezone daily drop scheduling for local-time evening windows

-- This table supports "Option A" per-TZ minute scheduling where all users
-- in the same timezone get the same communal drop minute within their evening window.
-- For "Option B" per-user deterministic scheduling, this table may not be needed.

CREATE TABLE IF NOT EXISTS daily_drop_tz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- The local calendar date for this drop (YYYY-MM-DD)
    local_date DATE NOT NULL,
    
    -- IANA timezone identifier (e.g., 'America/Toronto', 'Europe/London')
    tz VARCHAR(64) NOT NULL,
    
    -- User-configurable evening window (default 18:00-22:00)
    window_start TIME NOT NULL DEFAULT '18:00:00',  -- e.g., '17:00:00'
    window_end TIME NOT NULL DEFAULT '22:00:00',    -- e.g., '21:00:00'
    
    -- The chosen random minute within the window for this TZ/date
    -- Stored as TIME for the local minute (e.g., '19:37:00')
    chosen_minute TIME NOT NULL,
    
    -- Computed full timestamp for this drop (local_date + chosen_minute in TZ)
    -- This is the actual moment when the quiz becomes available
    drop_at_local TIMESTAMPTZ NOT NULL,
    
    -- Optional: store the UTC equivalent for easier queries
    drop_at_utc TIMESTAMPTZ NOT NULL,
    
    -- Creation timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one row per TZ per local date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_drop_tz_date_tz
    ON daily_drop_tz (local_date, tz);

-- Index for querying drops by date
CREATE INDEX IF NOT EXISTS idx_daily_drop_tz_date
    ON daily_drop_tz (local_date);

-- Index for querying drops by timezone
CREATE INDEX IF NOT EXISTS idx_daily_drop_tz_tz
    ON daily_drop_tz (tz);

-- Index for querying upcoming drops
CREATE INDEX IF NOT EXISTS idx_daily_drop_tz_drop_utc
    ON daily_drop_tz (drop_at_utc);

-- Constraints for data integrity
ALTER TABLE daily_drop_tz
ADD CONSTRAINT ck_window_order CHECK (window_start < window_end),
ADD CONSTRAINT ck_window_span CHECK (window_end - window_start >= INTERVAL '3 hours'),
ADD CONSTRAINT ck_chosen_minute_in_window CHECK (
    chosen_minute >= window_start AND chosen_minute <= window_end
);

-- Comments for clarity
COMMENT ON TABLE daily_drop_tz IS 
'Per-timezone daily drop scheduling. Stores the chosen random minute within each timezone evening window for communal drops.';

COMMENT ON COLUMN daily_drop_tz.local_date IS 
'Local calendar date (YYYY-MM-DD) in the timezone specified by tz column';

COMMENT ON COLUMN daily_drop_tz.tz IS 
'IANA timezone identifier for DST-safe time calculations';

COMMENT ON COLUMN daily_drop_tz.chosen_minute IS 
'Random minute chosen within the evening window for this TZ/date (local time)';

COMMENT ON COLUMN daily_drop_tz.drop_at_local IS 
'Complete local timestamp when quiz becomes available (local_date + chosen_minute in tz)';

COMMENT ON COLUMN daily_drop_tz.drop_at_utc IS 
'UTC equivalent of drop_at_local for easier server-side queries and scheduling';

-- Example usage patterns:
-- 1. Pre-compute tomorrow's drops for all supported timezones:
--    INSERT INTO daily_drop_tz (local_date, tz, window_start, window_end, chosen_minute, drop_at_local, drop_at_utc)
--    SELECT '2025-09-02', 'America/Toronto', '18:00', '22:00', '19:37', 
--           timezone('America/Toronto', '2025-09-02 19:37:00'),
--           timezone('America/Toronto', '2025-09-02 19:37:00') AT TIME ZONE 'UTC';
--
-- 2. Find today's drop time for a user's timezone:
--    SELECT drop_at_local, drop_at_utc FROM daily_drop_tz 
--    WHERE local_date = $1 AND tz = $2;
--
-- 3. Schedule push notifications (find all drops happening in next hour):
--    SELECT * FROM daily_drop_tz 
--    WHERE drop_at_utc BETWEEN NOW() AND NOW() + INTERVAL '1 hour';

-- This table enables:
-- - Communal "same moment" experience for users in same TZ
-- - Admin visibility into chosen drop times per region
-- - Predictable scheduling for push notification systems
-- - Historical audit of when drops occurred
-- - Support for user-customizable evening windows (future feature)
