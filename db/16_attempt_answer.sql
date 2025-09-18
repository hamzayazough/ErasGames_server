-- 16_attempt_answer.sql: Create the attempt_answer table for individual answer submissions
-- Refactored to match TypeORM entity structure with snake_case columns

CREATE TABLE IF NOT EXISTS attempt_answer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    answer_json JSONB NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    time_spent_ms INT NOT NULL DEFAULT 0,
    shuffle_proof JSONB,
    accuracy_points INT NOT NULL DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Note: Cannot add FK to partitioned attempt table with simple reference
    -- Application-level integrity must ensure attempt exists
    
    -- Unique constraint matching TypeORM entity
    CONSTRAINT uniq_attempt_answer_attempt_question UNIQUE (attempt_id, question_id)
);

-- Indexes for performance (matching TypeORM entity structure)
CREATE INDEX IF NOT EXISTS idx_attempt_answer_attempt_id ON attempt_answer (attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answer_idempotency ON attempt_answer (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_attempt_answer_submitted_at ON attempt_answer (submitted_at);