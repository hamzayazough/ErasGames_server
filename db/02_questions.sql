-- 02_questions.sql: Create the questions table for ErasGames
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_type VARCHAR(32) NOT NULL,
    difficulty VARCHAR(16) NOT NULL,
    themes_json JSONB NOT NULL DEFAULT '[]',
    subjects_json JSONB NOT NULL DEFAULT '[]',
    prompt_json JSONB NOT NULL,
    choices_json JSONB,
    correct_json JSONB,
    media_json JSONB,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    disabled BOOLEAN NOT NULL DEFAULT FALSE,
    exposure_count INT NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_lastused_diff ON questions (last_used_at, difficulty);
CREATE INDEX IF NOT EXISTS idx_question_exposure ON questions (exposure_count);
