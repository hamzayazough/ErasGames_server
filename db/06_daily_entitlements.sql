-- 06_daily_entitlements.sql
-- Migration for DailyEntitlements entity
-- Eras Quiz: per-user daily entitlements for subscriptions, one-offs, and jitter fairness

CREATE TABLE IF NOT EXISTS daily_entitlements (
    user_id VARCHAR(128) NOT NULL,
    local_date DATE NOT NULL,
    tz VARCHAR(64) NOT NULL,                -- IANA timezone (e.g., 'America/Toronto')
    assigned_jitter_sec INTEGER DEFAULT 0,  -- Deterministic per-user jitter (0-90s) for fairness
    extra_time_sec INTEGER DEFAULT 0,       -- Time bonus: 0 (free), +120 (Basic), +240 (Premium)
    retries_granted INTEGER DEFAULT 0,      -- Daily retry quota granted
    retries_used INTEGER DEFAULT 0,         -- Daily retries consumed
    practice_granted BOOLEAN DEFAULT FALSE, -- Practice mode access (Premium)
    practice_used BOOLEAN DEFAULT FALSE,    -- Practice mode used today
    restarts_granted INTEGER DEFAULT 0,     -- Restart quota (one-offs)
    restarts_used INTEGER DEFAULT 0,        -- Restarts consumed
    hints_granted INTEGER DEFAULT 0,        -- Hint quota (one-offs)
    hints_used INTEGER DEFAULT 0,           -- Hints consumed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),    
    -- Composite primary key: one row per user per local calendar day
    PRIMARY KEY (user_id, local_date)
);

-- Foreign key to users table
ALTER TABLE daily_entitlements 
ADD CONSTRAINT fk_daily_entitlements_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Unique index (redundant with PK but explicit for clarity)
CREATE UNIQUE INDEX IF NOT EXISTS idx_entitlements_user_date
    ON daily_entitlements (user_id, local_date);

-- Index for admin queries by date
CREATE INDEX IF NOT EXISTS idx_entitlements_date
    ON daily_entitlements (local_date);

-- Index for TZ-based analytics
CREATE INDEX IF NOT EXISTS idx_entitlements_tz_date
    ON daily_entitlements (tz, local_date);

-- Comments for key fields
COMMENT ON COLUMN daily_entitlements.assigned_jitter_sec IS 
'Deterministic per-user jitter (0-90s) used in early bonus fairness: effective_start_delay = (startAt - tzDropAt) - assignedJitterSec';

COMMENT ON COLUMN daily_entitlements.local_date IS 
'User local calendar date (YYYY-MM-DD) for the drop, not UTC date';

COMMENT ON COLUMN daily_entitlements.tz IS 
'Snapshot of IANA timezone used for this day drop (DST-safe, handles travel)';

-- Example usage patterns:
-- 1. Grant entitlements at drop time:
--    INSERT INTO daily_entitlements (user_id, local_date, tz, assigned_jitter_sec, extra_time_sec, ...)
--    VALUES ($1, $2, $3, $4, $5, ...) ON CONFLICT (user_id, local_date) DO UPDATE SET ...
--
-- 2. Consume retry atomically:
--    UPDATE daily_entitlements 
--    SET retries_used = retries_used + 1 
--    WHERE user_id = $1 AND local_date = $2 AND retries_used < retries_granted
--    RETURNING retries_used;
--
-- 3. Check entitlements for gameplay:
--    SELECT * FROM daily_entitlements WHERE user_id = $1 AND local_date = $2;

-- This table is created per drop and consumed during gameplay.
-- Rows are retained for audit/analytics but not actively updated after the day ends.
