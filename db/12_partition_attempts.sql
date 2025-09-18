-- 12_partition_attempts.sql
-- Convert attempt table to partitioned table for better performance
-- Simplified version for fresh database initialization

-- ===============================================
-- CREATE PARTITIONED ATTEMPT TABLE
-- ===============================================

-- Drop existing non-partitioned table if it exists
DROP TABLE IF EXISTS attempt CASCADE;

-- Create new partitioned table with TypeORM-compatible column names
CREATE TABLE attempt (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    daily_quiz_id UUID NOT NULL,
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
    
    -- Constraints (note: unique constraints must include partition key)
    CONSTRAINT pk_attempt_id_created PRIMARY KEY (id, created_at),
    CONSTRAINT uniq_attempt_user_dailyquiz UNIQUE (user_id, daily_quiz_id, created_at),
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_daily_quiz FOREIGN KEY (daily_quiz_id) REFERENCES daily_quiz(id) ON DELETE CASCADE
) PARTITION BY RANGE (created_at);

-- ===============================================
-- CREATE INITIAL PARTITIONS (Sep 2025 - Dec 2025)
-- ===============================================

-- September 2025 (current month)
CREATE TABLE attempt_2025_09 PARTITION OF attempt
    FOR VALUES FROM ('2025-09-01 00:00:00+00') TO ('2025-10-01 00:00:00+00');

-- October 2025
CREATE TABLE attempt_2025_10 PARTITION OF attempt
    FOR VALUES FROM ('2025-10-01 00:00:00+00') TO ('2025-11-01 00:00:00+00');

-- November 2025
CREATE TABLE attempt_2025_11 PARTITION OF attempt
    FOR VALUES FROM ('2025-11-01 00:00:00+00') TO ('2025-12-01 00:00:00+00');

-- December 2025
CREATE TABLE attempt_2025_12 PARTITION OF attempt
    FOR VALUES FROM ('2025-12-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');

-- ===============================================
-- CREATE INDEXES ON PARTITIONS
-- ===============================================

-- September 2025 indexes
CREATE INDEX idx_attempt_2025_09_user_dailyquiz ON attempt_2025_09 (user_id, daily_quiz_id);
CREATE INDEX idx_attempt_2025_09_user_created ON attempt_2025_09 (user_id, created_at);
CREATE INDEX idx_attempt_2025_09_status ON attempt_2025_09 (status);
CREATE INDEX idx_attempt_2025_09_score ON attempt_2025_09 (score DESC) WHERE status = 'finished';

-- October 2025 indexes
CREATE INDEX idx_attempt_2025_10_user_dailyquiz ON attempt_2025_10 (user_id, daily_quiz_id);
CREATE INDEX idx_attempt_2025_10_user_created ON attempt_2025_10 (user_id, created_at);
CREATE INDEX idx_attempt_2025_10_status ON attempt_2025_10 (status);
CREATE INDEX idx_attempt_2025_10_score ON attempt_2025_10 (score DESC) WHERE status = 'finished';

-- November 2025 indexes
CREATE INDEX idx_attempt_2025_11_user_dailyquiz ON attempt_2025_11 (user_id, daily_quiz_id);
CREATE INDEX idx_attempt_2025_11_user_created ON attempt_2025_11 (user_id, created_at);
CREATE INDEX idx_attempt_2025_11_status ON attempt_2025_11 (status);
CREATE INDEX idx_attempt_2025_11_score ON attempt_2025_11 (score DESC) WHERE status = 'finished';

-- December 2025 indexes
CREATE INDEX idx_attempt_2025_12_user_dailyquiz ON attempt_2025_12 (user_id, daily_quiz_id);
CREATE INDEX idx_attempt_2025_12_user_created ON attempt_2025_12 (user_id, created_at);
CREATE INDEX idx_attempt_2025_12_status ON attempt_2025_12 (status);
CREATE INDEX idx_attempt_2025_12_score ON attempt_2025_12 (score DESC) WHERE status = 'finished';

-- ===============================================
-- PARTITION MANAGEMENT FUNCTIONS
-- ===============================================

-- Function to create next month's partition
CREATE OR REPLACE FUNCTION create_monthly_attempt_partition()
RETURNS TEXT AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
    index_prefix TEXT;
BEGIN
    -- Calculate next month
    start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')::DATE;
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'attempt_' || TO_CHAR(start_date, 'YYYY_MM');
    index_prefix := 'idx_attempt_' || TO_CHAR(start_date, 'YYYY_MM');
    
    -- Create partition if it doesn't exist
    EXECUTE FORMAT('CREATE TABLE IF NOT EXISTS %I PARTITION OF attempt FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
                   
    -- Create indexes with snake_case column names
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_user_dailyquiz ON %I (user_id, daily_quiz_id)',
                   index_prefix, partition_name);
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_user_created ON %I (user_id, created_at)',
                   index_prefix, partition_name);
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_status ON %I (status)',
                   index_prefix, partition_name);
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_score ON %I (score DESC) WHERE status = %L',
                   index_prefix, partition_name, 'finished');
    
    RETURN partition_name || ' created successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to drop old partitions (for data retention)
CREATE OR REPLACE FUNCTION drop_old_attempt_partitions(months_to_keep INTEGER DEFAULT 12)
RETURNS TEXT AS $$
DECLARE
    cutoff_date DATE;
    partition_record RECORD;
    dropped_count INTEGER := 0;
BEGIN
    -- Calculate cutoff date
    cutoff_date := DATE_TRUNC('month', CURRENT_DATE - (months_to_keep || ' months')::INTERVAL)::DATE;
    
    -- Find and drop old partitions
    FOR partition_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'attempt_20%'
        AND tablename < 'attempt_' || TO_CHAR(cutoff_date, 'YYYY_MM')
    LOOP
        EXECUTE FORMAT('DROP TABLE IF EXISTS %I.%I CASCADE', 
                       partition_record.schemaname, partition_record.tablename);
        dropped_count := dropped_count + 1;
        RAISE NOTICE 'Dropped partition: %', partition_record.tablename;
    END LOOP;
    
    RETURN FORMAT('Dropped %s old partitions (keeping %s months)', dropped_count, months_to_keep);
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- COMMENTS & DOCUMENTATION
-- ===============================================

COMMENT ON TABLE attempt IS 
'Partitioned table storing user quiz attempts. Partitioned by month on createdAt for optimal performance with time-based queries.';

COMMENT ON FUNCTION create_monthly_attempt_partition() IS 
'Creates next month partition for attempt table. Should be called monthly via cron job or application scheduler.';

COMMENT ON FUNCTION drop_old_attempt_partitions(INTEGER) IS 
'Drops old attempt partitions beyond retention period. Default keeps 12 months of data.';

-- ===============================================
-- USAGE EXAMPLES
-- ===============================================

-- Example: Create next few months' partitions
-- SELECT create_monthly_attempt_partition();

-- Example: Drop partitions older than 6 months
-- SELECT drop_old_attempt_partitions(6);

-- Example: Check current partitions
-- SELECT schemaname, tablename, tableowner 
-- FROM pg_tables 
-- WHERE tablename LIKE 'attempt_20%' 
-- ORDER BY tablename;

-- Example: Check partition sizes
-- SELECT 
--     schemaname, 
--     tablename, 
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
-- FROM pg_tables 
-- WHERE tablename LIKE 'attempt_20%' 
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;