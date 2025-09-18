-- 04_attempt.sql: Create the attempt and practice_attempt tables
-- Refactored to match TypeORM entity structure and prepare for partitioning

CREATE TABLE IF NOT EXISTS attempt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_quiz_id UUID NOT NULL REFERENCES daily_quiz(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    finish_at TIMESTAMPTZ,
    answers_json JSONB NOT NULL DEFAULT '[]',
    acc_points INT NOT NULL DEFAULT 0,
    speed_sec INT NOT NULL DEFAULT 0,
    early_sec INT NOT NULL DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint (will be updated in partitioning to include created_at)
    CONSTRAINT uniq_attempt_user_dailyquiz UNIQUE (user_id, daily_quiz_id)
);

CREATE TABLE IF NOT EXISTS practice_attempt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_quiz_id UUID NOT NULL REFERENCES daily_quiz(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    finish_at TIMESTAMPTZ,
    answers_json JSONB NOT NULL DEFAULT '[]',
    score INT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attempt_user_dailyquiz ON attempt (user_id, daily_quiz_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempt_user_dailyquiz ON practice_attempt (user_id, daily_quiz_id);