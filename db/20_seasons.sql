-- 20_seasons.sql: Create seasons system for the quiz game
-- Supports 4-month seasons starting November 1st with daily quiz tracking

-- ===============================================
-- ENUMS
-- ===============================================

-- Season status enum
CREATE TYPE season_status AS ENUM ('upcoming', 'active', 'completed', 'archived');

-- ===============================================
-- SEASONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL UNIQUE,          -- e.g., "Season 1", "Winter 2025-26"
    display_name VARCHAR(128) NOT NULL,        -- e.g., "The Eras Begin - Season 1"
    season_number INTEGER NOT NULL UNIQUE,     -- 1, 2, 3, etc.
    
    -- Date range (4 months per season)
    start_date DATE NOT NULL,                  -- e.g., '2025-11-01'
    end_date DATE NOT NULL,                    -- e.g., '2026-02-28' (4 months later)
    
    -- Status and metadata
    status season_status NOT NULL DEFAULT 'upcoming',
    description TEXT,                          -- Optional season description/theme
    theme_json JSONB DEFAULT '{}',             -- Season-specific theming data
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ck_season_dates CHECK (start_date < end_date),
    CONSTRAINT ck_season_number_positive CHECK (season_number > 0)
);

-- ===============================================
-- SEASON PARTICIPATION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS season_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participation stats
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_points INTEGER NOT NULL DEFAULT 0,
    total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
    perfect_scores INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    
    -- Ranking information (updated periodically)
    current_rank INTEGER,
    best_rank INTEGER,
    last_rank_update TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one participation record per user per season
    CONSTRAINT uniq_season_participation UNIQUE (season_id, user_id)
);

-- ===============================================
-- DAILY SEASON PROGRESS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS daily_season_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_date DATE NOT NULL,                   -- The local date of the quiz
    
    -- Daily performance
    daily_quiz_id UUID REFERENCES daily_quiz(id) ON DELETE SET NULL,
    attempt_id UUID REFERENCES attempt(id) ON DELETE SET NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    is_perfect_score BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Streak tracking
    streak_day INTEGER NOT NULL DEFAULT 0,     -- 1, 2, 3, etc. (0 if streak broken)
    
    -- Timing
    completed_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one progress record per user per season per day
    CONSTRAINT uniq_daily_season_progress UNIQUE (season_id, user_id, quiz_date)
);

-- ===============================================
-- SEASON LEADERBOARD SNAPSHOTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS season_leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,               -- Date when snapshot was taken
    
    -- Leaderboard data
    top_players_json JSONB NOT NULL,           -- Top N players with stats
    total_participants INTEGER NOT NULL DEFAULT 0,
    
    -- Statistics
    stats_json JSONB DEFAULT '{}',             -- Aggregated season stats
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one snapshot per season per date
    CONSTRAINT uniq_season_leaderboard_snapshot UNIQUE (season_id, snapshot_date)
);

-- ===============================================
-- INDEXES
-- ===============================================

-- Seasons indexes
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons (status);
CREATE INDEX IF NOT EXISTS idx_seasons_dates ON seasons (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seasons_number ON seasons (season_number);

-- Season participation indexes
CREATE INDEX IF NOT EXISTS idx_season_participation_season ON season_participation (season_id);
CREATE INDEX IF NOT EXISTS idx_season_participation_user ON season_participation (user_id);
CREATE INDEX IF NOT EXISTS idx_season_participation_active ON season_participation (season_id, is_active);
CREATE INDEX IF NOT EXISTS idx_season_participation_rank ON season_participation (season_id, current_rank) WHERE current_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_season_participation_points ON season_participation (season_id, total_points DESC);

-- Daily progress indexes
CREATE INDEX IF NOT EXISTS idx_daily_season_progress_season_user ON daily_season_progress (season_id, user_id);
CREATE INDEX IF NOT EXISTS idx_daily_season_progress_date ON daily_season_progress (quiz_date);
-- Index removed: is_completed field no longer exists
CREATE INDEX IF NOT EXISTS idx_daily_season_progress_streak ON daily_season_progress (user_id, streak_day DESC);

-- Season leaderboard snapshots indexes
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_season ON season_leaderboard_snapshots (season_id);
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_date ON season_leaderboard_snapshots (snapshot_date DESC);

-- ===============================================
-- FUNCTIONS
-- ===============================================

-- Function to get current active season
CREATE OR REPLACE FUNCTION get_current_season()
RETURNS TABLE(
    season_id UUID,
    name VARCHAR(64),
    display_name VARCHAR(128),
    season_number INTEGER,
    start_date DATE,
    end_date DATE,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.display_name,
        s.season_number,
        s.start_date,
        s.end_date,
        (s.end_date - CURRENT_DATE) as days_remaining
    FROM seasons s
    WHERE s.status = 'active'
        AND CURRENT_DATE >= s.start_date
        AND CURRENT_DATE <= s.end_date
    ORDER BY s.season_number DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update season participation stats
CREATE OR REPLACE FUNCTION update_season_participation_stats(
    p_season_id UUID,
    p_user_id VARCHAR(128),
    p_points_to_add INTEGER,
    p_is_perfect BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
    v_current_streak INTEGER := 0;
    v_yesterday DATE;
BEGIN
    v_yesterday := CURRENT_DATE - INTERVAL '1 day';
    
    -- Get current streak
    SELECT COALESCE(MAX(streak_day), 0) INTO v_current_streak
    FROM daily_season_progress
    WHERE season_id = p_season_id 
        AND user_id = p_user_id 
        AND quiz_date >= v_yesterday
        AND points_earned > 0;
    
    -- Update or insert participation record
    INSERT INTO season_participation (
        season_id, user_id, total_points, total_quizzes_completed, 
        perfect_scores, current_streak, last_activity_at
    )
    VALUES (
        p_season_id, p_user_id, p_points_to_add, 1,
        CASE WHEN p_is_perfect THEN 1 ELSE 0 END,
        v_current_streak + 1, NOW()
    )
    ON CONFLICT (season_id, user_id) DO UPDATE SET
        total_points = season_participation.total_points + p_points_to_add,
        total_quizzes_completed = season_participation.total_quizzes_completed + 1,
        perfect_scores = season_participation.perfect_scores + CASE WHEN p_is_perfect THEN 1 ELSE 0 END,
        current_streak = v_current_streak + 1,
        longest_streak = GREATEST(season_participation.longest_streak, v_current_streak + 1),
        last_activity_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create next season automatically
CREATE OR REPLACE FUNCTION create_next_season()
RETURNS UUID AS $$
DECLARE
    v_last_season_number INTEGER := 0;
    v_last_end_date DATE;
    v_new_start_date DATE;
    v_new_end_date DATE;
    v_new_season_id UUID;
    v_season_name VARCHAR(64);
    v_display_name VARCHAR(128);
BEGIN
    -- Get the last season info
    SELECT COALESCE(MAX(season_number), 0), COALESCE(MAX(end_date), '2025-10-31'::DATE)
    INTO v_last_season_number, v_last_end_date
    FROM seasons;
    
    -- Calculate new season dates (4 months duration)
    v_new_start_date := v_last_end_date + INTERVAL '1 day';
    v_new_end_date := v_new_start_date + INTERVAL '4 months' - INTERVAL '1 day';
    
    -- Generate season names
    v_season_name := 'Season ' || (v_last_season_number + 1);
    v_display_name := 'Season ' || (v_last_season_number + 1) || ' - ' || 
                     TO_CHAR(v_new_start_date, 'Mon YYYY') || ' to ' || 
                     TO_CHAR(v_new_end_date, 'Mon YYYY');
    
    -- Create the new season
    INSERT INTO seasons (
        name, display_name, season_number, start_date, end_date,
        status, description
    )
    VALUES (
        v_season_name, v_display_name, v_last_season_number + 1,
        v_new_start_date, v_new_end_date, 'upcoming',
        'Automatically created season covering 4 months of daily quizzes'
    )
    RETURNING id INTO v_new_season_id;
    
    RETURN v_new_season_id;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- TRIGGERS
-- ===============================================

-- Trigger to automatically update season status
CREATE OR REPLACE FUNCTION update_season_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update seasons that should be active
    UPDATE seasons 
    SET status = 'active', updated_at = NOW()
    WHERE status = 'upcoming' 
        AND start_date <= CURRENT_DATE;
    
    -- Update seasons that should be completed
    UPDATE seasons 
    SET status = 'completed', updated_at = NOW()
    WHERE status = 'active' 
        AND end_date < CURRENT_DATE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily status updates
CREATE OR REPLACE TRIGGER trigger_update_season_status
    AFTER INSERT ON daily_quiz
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_season_status();

-- ===============================================
-- INITIAL DATA
-- ===============================================

-- Create Pre-Season (Season 0) - September-October 2025
INSERT INTO seasons (
    name, display_name, season_number, start_date, end_date,
    status, description
) VALUES (
    'Pre-Season',
    'Pre-Season Warm-Up',
    0,
    '2025-09-30',
    '2025-10-30',
    CASE 
        WHEN CURRENT_DATE < '2025-09-30' THEN 'upcoming'::season_status
        WHEN CURRENT_DATE <= '2025-10-30' THEN 'active'::season_status
        ELSE 'completed'::season_status
    END,
    'Pre-season warm-up period to test your Taylor Swift knowledge before the official seasons begin!'
)
ON CONFLICT (season_number) DO UPDATE SET
    start_date = '2025-09-30',
    end_date = '2025-10-30',
    status = CASE 
        WHEN CURRENT_DATE < '2025-09-30' THEN 'upcoming'::season_status
        WHEN CURRENT_DATE <= '2025-10-30' THEN 'active'::season_status
        ELSE 'completed'::season_status
    END;

-- Create the first official season starting November 1st, 2025
INSERT INTO seasons (
    name, display_name, season_number, start_date, end_date,
    status, description
) VALUES (
    'Season 1',
    'The Eras Begin - Season 1',
    1,
    '2025-11-01',
    '2026-02-28', -- 4 months later (Nov, Dec, Jan, Feb)
    CASE 
        WHEN CURRENT_DATE < '2025-11-01' THEN 'upcoming'::season_status
        WHEN CURRENT_DATE <= '2026-02-28' THEN 'active'::season_status
        ELSE 'completed'::season_status
    END,
    'The inaugural season of Eras Quiz! Test your Taylor Swift knowledge across four months of daily challenges.'
)
ON CONFLICT (season_number) DO UPDATE SET
    start_date = '2025-11-01',
    end_date = '2026-02-28',
    status = CASE 
        WHEN CURRENT_DATE < '2025-11-01' THEN 'upcoming'::season_status
        WHEN CURRENT_DATE <= '2026-02-28' THEN 'active'::season_status
        ELSE 'completed'::season_status
    END;

-- ===============================================
-- COMMENTS
-- ===============================================

COMMENT ON TABLE seasons IS 'Master table for quiz seasons. Each season lasts 4 months with daily quizzes.';
COMMENT ON TABLE season_participation IS 'Tracks user participation and performance in each season.';
COMMENT ON TABLE daily_season_progress IS 'Daily progress tracking for users within a season.';
COMMENT ON TABLE season_leaderboard_snapshots IS 'Periodic snapshots of season leaderboards for historical tracking.';

COMMENT ON FUNCTION get_current_season() IS 'Returns the currently active season information.';
COMMENT ON FUNCTION update_season_participation_stats(UUID, VARCHAR(128), INTEGER, BOOLEAN) IS 'Updates user statistics for a season after completing a quiz.';
COMMENT ON FUNCTION create_next_season() IS 'Automatically creates the next 4-month season.';