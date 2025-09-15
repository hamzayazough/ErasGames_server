-- 17_quiz_system_indexes.sql: Comprehensive indexing for daily quiz system performance

-- ===========================================
-- QUESTION TABLE INDEXES (for question selection)
-- ===========================================

-- Index for anti-repeat logic: (last_used_at, difficulty, exposure_count) 
-- This supports the primary query for question selection with progressive relaxation
CREATE INDEX IF NOT EXISTS idx_questions_antirepeat ON questions (last_used_at, difficulty, exposure_count);

-- Index for theme-based selection
CREATE INDEX IF NOT EXISTS idx_questions_themes_gin ON questions USING GIN (themes_json);

-- Index for approval status queries
CREATE INDEX IF NOT EXISTS idx_questions_approved_disabled ON questions (approved, disabled) WHERE approved = TRUE AND disabled = FALSE;

-- Index for difficulty-based queries
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions (difficulty);

-- Composite index for daily composition queries
CREATE INDEX IF NOT EXISTS idx_questions_composition ON questions (approved, disabled, difficulty, last_used_at, exposure_count) WHERE approved = TRUE AND disabled = FALSE;

-- ===========================================
-- ATTEMPT TABLE INDEXES (for user attempts)
-- ===========================================

-- Unique constraint index already exists: (user_id, daily_quiz_id)
-- Additional performance indexes:

-- Index for active attempts lookup
CREATE INDEX IF NOT EXISTS idx_attempts_user_status ON attempt (user_id, status) WHERE status = 'active';

-- Index for daily quiz attempts
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_status ON attempt (daily_quiz_id, status);

-- Index for deadline-based queries
CREATE INDEX IF NOT EXISTS idx_attempts_deadline ON attempt (deadline) WHERE status = 'active';

-- Index for attempt analytics (finish time, score)
CREATE INDEX IF NOT EXISTS idx_attempts_finished ON attempt (finish_at, score) WHERE status = 'finished';

-- ===========================================
-- DAILY QUIZ TABLE INDEXES
-- ===========================================

-- Index for drop time queries (primary lookup for daily endpoint)
CREATE INDEX IF NOT EXISTS idx_daily_quiz_drop_time ON daily_quiz (drop_at_utc);

-- Index for template status
CREATE INDEX IF NOT EXISTS idx_daily_quiz_template ON daily_quiz (template_cdn_url) WHERE template_cdn_url IS NOT NULL;

-- ===========================================
-- DAILY QUIZ QUESTION TABLE INDEXES
-- ===========================================

-- Index for quiz question lookup
CREATE INDEX IF NOT EXISTS idx_daily_quiz_questions_quiz ON daily_quiz_question (daily_quiz_id);

-- Index for question usage tracking
CREATE INDEX IF NOT EXISTS idx_daily_quiz_questions_question ON daily_quiz_question (question_id);

-- ===========================================
-- ATTEMPT ANSWER TABLE INDEXES (already in 16_attempt_answer.sql)
-- ===========================================

-- These are already created:
-- - idx_attempt_answer_attempt_id ON attempt_answer (attempt_id)
-- - idx_attempt_answer_idempotency ON attempt_answer (idempotency_key)
-- - idx_attempt_answer_submitted_at ON attempt_answer (submitted_at)

-- Additional performance index for answer analysis
CREATE INDEX IF NOT EXISTS idx_attempt_answer_correctness ON attempt_answer (is_correct, accuracy_points);

-- ===========================================
-- PERFORMANCE MONITORING INDEXES
-- ===========================================

-- Index for composition logs (if using them for analytics)
CREATE INDEX IF NOT EXISTS idx_composition_logs_date ON composition_log (created_at);

-- ===========================================
-- PARTITIONING SUPPORT INDEXES
-- ===========================================

-- For future partitioning by date, these indexes will help:
-- Index for monthly partitioning of attempts
CREATE INDEX IF NOT EXISTS idx_attempts_created_month ON attempt (EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));

-- Index for monthly partitioning of attempt answers
CREATE INDEX IF NOT EXISTS idx_attempt_answer_submitted_month ON attempt_answer (EXTRACT(YEAR FROM submitted_at), EXTRACT(MONTH FROM submitted_at));

-- ===========================================
-- QUERY OPTIMIZATION NOTES
-- ===========================================

-- The following queries are optimized by these indexes:

-- 1. Question Selection (AntiRepeatService.getEligibleQuestions):
--    → idx_questions_composition handles the main WHERE clause
--    → idx_questions_themes_gin handles theme filtering

-- 2. Daily Quiz Lookup (DailyQuizController.getTodaysQuiz):
--    → idx_daily_quiz_drop_time handles dropAtUTC lookup

-- 3. Attempt Creation (AttemptsController.startAttempt):
--    → idx_attempts_user_status handles existing attempt check

-- 4. Answer Submission (AttemptsController.submitAnswer):
--    → idx_attempt_answer_idempotency handles idempotency checks
--    → idx_attempt_answer_attempt_id handles attempt-specific queries

-- 5. Quiz Composition (DailyQuizComposerService):
--    → Multiple indexes support the complex question selection logic

-- ===========================================
-- MAINTENANCE COMMANDS
-- ===========================================

-- To analyze index usage (run periodically):
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE idx_scan > 0 
-- ORDER BY idx_scan DESC;

-- To find unused indexes:
-- SELECT schemaname, tablename, indexname, idx_scan 
-- FROM pg_stat_user_indexes 
-- WHERE idx_scan = 0 AND indexname NOT LIKE '%_pkey';