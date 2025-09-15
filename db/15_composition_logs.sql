-- 15_composition_logs.sql: Create the composition_logs table for daily quiz monitoring

CREATE TABLE IF NOT EXISTS composition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_quiz_id UUID NOT NULL REFERENCES daily_quiz(id) ON DELETE CASCADE,
    target_date TIMESTAMPTZ NOT NULL,
    mode VARCHAR(16) NOT NULL,
    theme_plan_json JSONB NOT NULL DEFAULT '{}',
    selection_process_json JSONB NOT NULL DEFAULT '[]',
    final_selection_json JSONB NOT NULL DEFAULT '{}',
    warnings_json JSONB NOT NULL DEFAULT '[]',
    performance_json JSONB NOT NULL DEFAULT '{}',
    has_errors BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_composition_logs_daily_quiz ON composition_logs (daily_quiz_id);
CREATE INDEX IF NOT EXISTS idx_composition_logs_created_at ON composition_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_composition_logs_mode ON composition_logs (mode);
CREATE INDEX IF NOT EXISTS idx_composition_logs_target_date ON composition_logs (target_date);