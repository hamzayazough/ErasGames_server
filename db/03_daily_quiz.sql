-- 03_daily_quiz.sql: Create the daily_quiz and daily_quiz_question tables

CREATE TABLE IF NOT EXISTS daily_quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_at_utc TIMESTAMPTZ NOT NULL,
    mode VARCHAR(16) NOT NULL, -- mix | spotlight | event
    theme_plan_json JSONB NOT NULL DEFAULT '{}',
    template_version INT NOT NULL,
    template_cdn_url VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_quiz_question (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_quiz_id UUID NOT NULL REFERENCES daily_quiz(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    difficulty VARCHAR(16) NOT NULL,
    question_type VARCHAR(32) NOT NULL,
    -- Partitioning by date can be handled at the DB or app level
    UNIQUE (daily_quiz_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_quiz_drop_at ON daily_quiz (drop_at_utc);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_question_dq ON daily_quiz_question (daily_quiz_id);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_question_qid ON daily_quiz_question (question_id);
