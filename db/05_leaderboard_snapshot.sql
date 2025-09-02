-- 05_leaderboard_snapshot.sql
-- Migration for LeaderboardSnapshot entity and related indexes
-- Eras Quiz: supports global, daily, season, theme, and regional leaderboards

-- Create enum for leaderboard scope
CREATE TYPE leaderboard_scope AS ENUM ('DAILY', 'SEASON', 'THEME', 'GLOBAL');

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope leaderboard_scope NOT NULL,    -- DAILY | SEASON | THEME | GLOBAL
    key TEXT NOT NULL,                   -- Board key: "America/Toronto", "global", "season:S25", "theme:lyrics:season:S25"
    date DATE NOT NULL,                  -- For DAILY: local calendar date; For others: snapshot date (UTC)
    period_start DATE,                   -- Optional: start of period for season/theme boards
    period_end DATE,                     -- Optional: end of period for season/theme boards
    top_json JSONB NOT NULL,             -- Rich leaderboard data with top entries, stats, and optional user info
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to prevent duplicate snapshots for same board/date
CREATE UNIQUE INDEX IF NOT EXISTS idx_lbscope_key_date
    ON leaderboard_snapshots (scope, key, date);

-- Index for retrieving latest snapshots
CREATE INDEX IF NOT EXISTS idx_lbs_created
    ON leaderboard_snapshots (created_at);

-- Example top_json structure (LbTopJSON):
-- {
--   "top": [
--     { "userId": "uuid", "handle": "swiftie123", "country": "US", "score": 420, "rank": 1 },
--     { "userId": "uuid", "handle": "taylor_fan", "country": "CA", "score": 410, "rank": 2 }
--   ],
--   "me": { "userId": "uuid", "rank": 15, "score": 380 },
--   "stats": {
--     "totalParticipants": 1250,
--     "mean": 350,
--     "median": 340,
--     "p95": 415
--   }
-- }

-- Key conventions:
-- - DAILY (regional):    "America/Toronto"
-- - DAILY (global):      "global"
-- - SEASON:              "season:S25"
-- - THEME+SEASON:        "theme:lyrics:season:S25"
-- - GLOBAL (overall):    "global"

-- This table is append-only; old snapshots are retained for audit/history.
-- Handle and country are frozen at snapshot time for historical accuracy.
