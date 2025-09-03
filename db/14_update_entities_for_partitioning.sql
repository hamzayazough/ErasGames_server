-- 14_update_entities_for_partitioning.sql
-- Update existing entity constraints and indexes to support partitioning

-- ===============================================
-- UPDATE ATTEMPT ENTITY CONSTRAINTS
-- ===============================================

-- Note: If you have existing data, you'll need to migrate it first
-- The partitioning migrations (12_partition_attempts.sql) handle this

-- Drop the old PRIMARY KEY constraint if it exists (single column)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attempt_pkey' 
        AND table_name = 'attempt'
    ) THEN
        ALTER TABLE attempt DROP CONSTRAINT attempt_pkey;
    END IF;
END $$;

-- Drop the old unique constraint if it exists (without created_at)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uniq_attempt_user_dailyquiz' 
        AND table_name = 'attempt'
    ) THEN
        ALTER TABLE attempt DROP CONSTRAINT uniq_attempt_user_dailyquiz;
    END IF;
END $$;

-- ===============================================
-- UPDATE DAILY_QUIZ_QUESTION ENTITY CONSTRAINTS  
-- ===============================================

-- Add quiz_year column if it doesn't exist (for partitioning)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_quiz_question' 
        AND column_name = 'quiz_year'
    ) THEN
        ALTER TABLE daily_quiz_question 
        ADD COLUMN quiz_year INTEGER;
        
        -- Populate quiz_year for existing data
        UPDATE daily_quiz_question 
        SET quiz_year = EXTRACT(YEAR FROM dq.drop_at_utc)::INTEGER
        FROM daily_quiz dq 
        WHERE daily_quiz_question.daily_quiz_id = dq.id;
        
        -- Make it NOT NULL after populating
        ALTER TABLE daily_quiz_question 
        ALTER COLUMN quiz_year SET NOT NULL;
        
        -- Add check constraint
        ALTER TABLE daily_quiz_question 
        ADD CONSTRAINT ck_quiz_year_range 
        CHECK (quiz_year >= 2025 AND quiz_year <= 2050);
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_quiz_question' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE daily_quiz_question 
        ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- ===============================================
-- COMMENTS FOR CLARITY
-- ===============================================

COMMENT ON COLUMN daily_quiz_question.quiz_year IS 
'Year extracted from daily_quiz.drop_at_utc for partitioning. Auto-populated via trigger.';

-- ===============================================
-- HELPER VIEWS FOR EASIER QUERIES
-- ===============================================

-- Create a view for attempt queries that handles partitioning complexity
CREATE OR REPLACE VIEW v_user_attempts AS
SELECT 
    a.id,
    a.user_id,
    a.daily_quiz_id,
    a.start_at,
    a.deadline,
    a.finish_at,
    a.answers_json,
    a.acc_points,
    a.speed_sec,
    a.early_sec,
    a.score,
    a.status,
    a.created_at,
    dq.drop_at_utc,
    dq.mode as quiz_mode,
    u.handle as user_handle,
    u.country as user_country
FROM attempt a
JOIN daily_quiz dq ON a.daily_quiz_id = dq.id
JOIN users u ON a.user_id = u.id;

COMMENT ON VIEW v_user_attempts IS 
'Convenient view for attempt queries with quiz and user details. Abstracts partition complexity.';

-- ===============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ===============================================

-- These will be created automatically by the partitioning migrations
-- But documenting the strategy here for reference:

/*
For partitioned tables, indexes are created per partition:

ATTEMPT PARTITIONS:
- Primary Key: (id, created_at) 
- Unique: (user_id, daily_quiz_id, created_at)
- Performance: user_id, status, score DESC (for leaderboards)

DAILY_QUIZ_QUESTION PARTITIONS:
- Primary Key: (id, quiz_year)
- Unique: (daily_quiz_id, question_id, quiz_year)  
- Performance: daily_quiz_id, question_id, difficulty, question_type
*/

-- ===============================================
-- PARTITION BEST PRACTICES DOCUMENTATION
-- ===============================================

/*
PARTITION STRATEGY SUMMARY:

1. ATTEMPT TABLE (Monthly Partitions)
   - Partition Key: created_at
   - Retention: 12 months (configurable)
   - Benefits: Fast queries for current/recent attempts, efficient cleanup

2. DAILY_QUIZ_QUESTION TABLE (Yearly Partitions)  
   - Partition Key: quiz_year
   - Retention: 5 years (configurable)
   - Benefits: Fast queries by year, manageable partition sizes

QUERY PATTERNS TO LEVERAGE PARTITIONING:

Good (partition elimination):
- SELECT * FROM attempt WHERE created_at >= '2025-09-01' AND created_at < '2025-10-01'
- SELECT * FROM daily_quiz_question WHERE quiz_year = 2025

Avoid (scans all partitions):
- SELECT * FROM attempt WHERE user_id = 'uuid' (without date filter)
- SELECT * FROM daily_quiz_question WHERE difficulty = 'hard' (without year)

Better patterns:
- SELECT * FROM attempt WHERE user_id = 'uuid' AND created_at >= '2025-09-01'
- SELECT * FROM v_user_attempts WHERE user_handle = 'swiftie123' AND created_at >= NOW() - INTERVAL '30 days'
*/
