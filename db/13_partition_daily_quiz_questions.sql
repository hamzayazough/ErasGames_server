-- 13_partition_daily_quiz_questions.sql
-- Convert daily_quiz_question table to partitioned table for better performance
-- Partition by year based on daily_quiz.drop_at_utc (via JOIN) - simpler yearly partitions since less volume
-- FIXED VERSION: Removes references to non-existent created_at column

-- ===============================================
-- BACKUP EXISTING DATA & CREATE PARTITIONED TABLE
-- ===============================================

-- Step 1: Rename existing table to backup
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_quiz_question' AND table_type = 'BASE TABLE') THEN
        -- Check if table is already partitioned
        IF NOT EXISTS (SELECT 1 FROM pg_partitioned_table WHERE partrelid = 'daily_quiz_question'::regclass) THEN
            ALTER TABLE daily_quiz_question RENAME TO daily_quiz_question_backup_pre_partition;
        END IF;
    END IF;
END $$;

-- Step 2: Create new partitioned table (matching TypeORM entity structure)
-- Note: TypeORM entity does NOT have created_at, so we don't include it
CREATE TABLE IF NOT EXISTS daily_quiz_question (
    id UUID DEFAULT gen_random_uuid(),
    daily_quiz_id UUID NOT NULL,
    question_id UUID NOT NULL,
    difficulty VARCHAR(16) NOT NULL,
    question_type VARCHAR(32) NOT NULL,
    quiz_year INTEGER NOT NULL, -- Partition key: EXTRACT(YEAR FROM daily_quiz.drop_at_utc)
    
    -- Constraints (note: unique constraints must include partition key)
    CONSTRAINT pk_daily_quiz_question_id_year PRIMARY KEY (id, quiz_year),
    CONSTRAINT uniq_daily_quiz_question_quiz_question UNIQUE (daily_quiz_id, question_id, quiz_year),
    CONSTRAINT fk_daily_quiz_question_daily_quiz FOREIGN KEY (daily_quiz_id) REFERENCES daily_quiz(id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_quiz_question_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Check constraint to ensure quiz_year is reasonable
    CONSTRAINT ck_quiz_year_range CHECK (quiz_year >= 2025 AND quiz_year <= 2050)
) PARTITION BY RANGE (quiz_year);

-- ===============================================
-- CREATE INITIAL PARTITIONS (2025 - 2027)
-- ===============================================

-- 2025 partition
CREATE TABLE daily_quiz_question_2025 PARTITION OF daily_quiz_question
    FOR VALUES FROM (2025) TO (2026);

-- 2026 partition 
CREATE TABLE daily_quiz_question_2026 PARTITION OF daily_quiz_question
    FOR VALUES FROM (2026) TO (2027);

-- 2027 partition
CREATE TABLE daily_quiz_question_2027 PARTITION OF daily_quiz_question
    FOR VALUES FROM (2027) TO (2028);

-- ===============================================
-- CREATE INDEXES ON PARTITIONS
-- ===============================================

-- 2025 indexes
CREATE INDEX idx_daily_quiz_question_2025_daily_quiz ON daily_quiz_question_2025 (daily_quiz_id);
CREATE INDEX idx_daily_quiz_question_2025_question ON daily_quiz_question_2025 (question_id);
CREATE INDEX idx_daily_quiz_question_2025_difficulty ON daily_quiz_question_2025 (difficulty);

-- 2026 indexes
CREATE INDEX idx_daily_quiz_question_2026_daily_quiz ON daily_quiz_question_2026 (daily_quiz_id);
CREATE INDEX idx_daily_quiz_question_2026_question ON daily_quiz_question_2026 (question_id);
CREATE INDEX idx_daily_quiz_question_2026_difficulty ON daily_quiz_question_2026 (difficulty);

-- 2027 indexes
CREATE INDEX idx_daily_quiz_question_2027_daily_quiz ON daily_quiz_question_2027 (daily_quiz_id);
CREATE INDEX idx_daily_quiz_question_2027_question ON daily_quiz_question_2027 (question_id);
CREATE INDEX idx_daily_quiz_question_2027_difficulty ON daily_quiz_question_2027 (difficulty);

-- ===============================================
-- MIGRATE EXISTING DATA (if backup table exists)
-- ===============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_quiz_question_backup_pre_partition') THEN
        -- Insert data from backup table to partitioned table
        -- Calculate quiz_year from daily_quiz.drop_at_utc
        INSERT INTO daily_quiz_question (
            id, daily_quiz_id, question_id, difficulty, question_type, quiz_year
        )
        SELECT 
            dqq.id, 
            dqq.daily_quiz_id, 
            dqq.question_id, 
            dqq.difficulty, 
            dqq.question_type,
            EXTRACT(YEAR FROM dq.drop_at_utc)::INTEGER as quiz_year
        FROM daily_quiz_question_backup_pre_partition dqq
        JOIN daily_quiz dq ON dqq.daily_quiz_id = dq.id;
        
        RAISE NOTICE 'Migrated % rows from daily_quiz_question_backup_pre_partition to partitioned daily_quiz_question table', 
                     (SELECT COUNT(*) FROM daily_quiz_question_backup_pre_partition);
    END IF;
END $$;

-- ===============================================
-- PARTITION MANAGEMENT FUNCTIONS
-- ===============================================

-- Function to create next year's partition
CREATE OR REPLACE FUNCTION create_yearly_daily_quiz_question_partition()
RETURNS TEXT AS $$
DECLARE
    next_year INTEGER;
    partition_name TEXT;
    index_prefix TEXT;
BEGIN
    -- Calculate next year
    next_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1;
    partition_name := 'daily_quiz_question_' || next_year;
    index_prefix := 'idx_daily_quiz_question_' || next_year;
    
    -- Create partition if it doesn't exist
    EXECUTE FORMAT('CREATE TABLE IF NOT EXISTS %I PARTITION OF daily_quiz_question FOR VALUES FROM (%L) TO (%L)',
                   partition_name, next_year, next_year + 1);
                   
    -- Create indexes with snake_case column names
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_daily_quiz ON %I (daily_quiz_id)',
                   index_prefix, partition_name);
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_question ON %I (question_id)',
                   index_prefix, partition_name);
    EXECUTE FORMAT('CREATE INDEX IF NOT EXISTS %I_difficulty ON %I (difficulty)',
                   index_prefix, partition_name);
    
    RETURN partition_name || ' created successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to drop old partitions (for data retention)
CREATE OR REPLACE FUNCTION drop_old_daily_quiz_question_partitions(years_to_keep INTEGER DEFAULT 5)
RETURNS TEXT AS $$
DECLARE
    cutoff_year INTEGER;
    partition_record RECORD;
    dropped_count INTEGER := 0;
BEGIN
    -- Calculate cutoff year
    cutoff_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - years_to_keep;
    
    -- Find and drop old partitions
    FOR partition_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'daily_quiz_question_20%'
        AND tablename < 'daily_quiz_question_' || cutoff_year
    LOOP
        EXECUTE FORMAT('DROP TABLE IF EXISTS %I.%I CASCADE', 
                       partition_record.schemaname, partition_record.tablename);
        dropped_count := dropped_count + 1;
        RAISE NOTICE 'Dropped partition: %', partition_record.tablename;
    END LOOP;
    
    RETURN FORMAT('Dropped %s old partitions (keeping %s years)', dropped_count, years_to_keep);
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- TRIGGER TO AUTO-SET QUIZ_YEAR
-- ===============================================

-- Function to automatically set quiz_year from daily_quiz.drop_at_utc
CREATE OR REPLACE FUNCTION set_quiz_year_from_daily_quiz()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the year from the associated daily_quiz.drop_at_utc
    SELECT EXTRACT(YEAR FROM drop_at_utc)::INTEGER 
    INTO NEW.quiz_year
    FROM daily_quiz 
    WHERE id = NEW.daily_quiz_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set quiz_year on INSERT
CREATE TRIGGER tr_daily_quiz_question_set_quiz_year
    BEFORE INSERT ON daily_quiz_question
    FOR EACH ROW
    EXECUTE FUNCTION set_quiz_year_from_daily_quiz();

-- ===============================================
-- VIEWS FOR EASIER QUERYING
-- ===============================================

-- View that JOINs with daily_quiz for common queries (hides partition complexity)
CREATE OR REPLACE VIEW v_daily_quiz_question_with_quiz AS
SELECT 
    dqq.id,
    dqq.daily_quiz_id,
    dqq.question_id,
    dqq.difficulty,
    dqq.question_type,
    dqq.quiz_year,
    dq.drop_at_utc,
    dq.mode as quiz_mode,
    dq.template_version
FROM daily_quiz_question dqq
JOIN daily_quiz dq ON dqq.daily_quiz_id = dq.id;

-- ===============================================
-- COMMENTS & DOCUMENTATION
-- ===============================================

COMMENT ON TABLE daily_quiz_question IS 
'Partitioned table storing questions for each daily quiz. Partitioned by year (quiz_year) for optimal performance.';

COMMENT ON COLUMN daily_quiz_question.quiz_year IS 
'Partition key derived from daily_quiz.drop_at_utc. Automatically set by trigger.';

COMMENT ON FUNCTION create_yearly_daily_quiz_question_partition() IS 
'Creates next year partition for daily_quiz_question table. Should be called annually via cron job.';

COMMENT ON FUNCTION drop_old_daily_quiz_question_partitions(INTEGER) IS 
'Drops old daily_quiz_question partitions beyond retention period. Default keeps 5 years of data.';

-- ===============================================
-- USAGE EXAMPLES
-- ===============================================

-- Example: Create next year's partition
-- SELECT create_yearly_daily_quiz_question_partition();

-- Example: Drop partitions older than 3 years
-- SELECT drop_old_daily_quiz_question_partitions(3);

-- Example: Check current partitions
-- SELECT schemaname, tablename, tableowner 
-- FROM pg_tables 
-- WHERE tablename LIKE 'daily_quiz_question_20%' 
-- ORDER BY tablename;

-- Example: Query via view (recommended for apps)
-- SELECT * FROM v_daily_quiz_question_with_quiz 
-- WHERE quiz_year = 2025 AND difficulty = 'medium';