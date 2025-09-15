import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Attempt } from '../entities/attempt.entity';
import { DailyQuizQuestion } from '../entities/daily-quiz-question.entity';

interface PartitionQueryResult {
  result: string;
}

export interface PartitionInfo {
  schemaname: string;
  tablename: string;
  tableowner: string;
  size: string;
  row_count: number;
}

interface TableExistsCheckResult {
  [key: string]: any; // For SELECT 1 queries
}

/**
 * PartitionManagementService
 *
 * Handles automatic creation and maintenance of database partitions for:
 * - attempt table (monthly partitions)
 * - daily_quiz_question table (yearly partitions)
 *
 * Features:
 * - Automatic partition creation via cron jobs
 * - Old partition cleanup for data retention
 * - Health checks and monitoring
 * - Manual partition management methods
 */
@Injectable()
export class PartitionManagementService {
  private readonly logger = new Logger(PartitionManagementService.name);
  private readonly retentionMonths: number;
  private readonly retentionYears: number;

  constructor(
    @InjectRepository(Attempt)
    private attemptRepository: Repository<Attempt>,
    @InjectRepository(DailyQuizQuestion)
    private dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
  ) {
    // Environment-based configuration
    this.retentionMonths = parseInt(
      process.env.PARTITION_RETENTION_MONTHS || '12',
    );
    this.retentionYears = parseInt(
      process.env.PARTITION_RETENTION_YEARS || '5',
    );
  }

  /**
   * Utility method to get current month partition name in UTC
   */
  private getCurrentMonthPartitionName(): string {
    const now = new Date();
    const utcDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
    return utcDate.toISOString().slice(0, 7).replace('-', '_');
  }

  /**
   * Utility method to get next month partition name in UTC
   */
  private getNextMonthPartitionName(): string {
    const now = new Date();
    const nextMonth = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
    return nextMonth.toISOString().slice(0, 7).replace('-', '_');
  }

  /**
   * Utility method to get current year
   */
  private getCurrentYear(): number {
    return new Date().getUTCFullYear();
  }

  /**
   * Utility method to get next year
   */
  private getNextYear(): number {
    return new Date().getUTCFullYear() + 1;
  }

  /**
   * Check if a partition exists
   */
  private async checkPartitionExists(tableName: string): Promise<boolean> {
    const result: TableExistsCheckResult[] = await this.attemptRepository.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
      [tableName],
    );
    return result.length > 0;
  }

  /**
   * Sleep utility for retry logic
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Send alert for critical failures (placeholder for monitoring integration)
   */
  private sendAlert(message: string, error: any): void {
    this.logger.error(`CRITICAL PARTITION ALERT: ${message}`, error);
    // TODO: Integrate with monitoring system (e.g., Slack, PagerDuty, etc.)
  }

  /**
   * Automatically create next month's attempt partition
   * Runs on the 25th of each month at 2 AM to prepare for next month
   */
  @Cron('0 2 25 * *', {
    name: 'create-monthly-attempt-partition',
    timeZone: 'UTC',
  })
  async createMonthlyAttemptPartitionCron() {
    this.logger.log("Creating next month's attempt partition (cron job)");

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.createMonthlyAttemptPartition();
        this.logger.log(`Cron job completed successfully: ${result}`);
        return;
      } catch (error) {
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed to create monthly partition`,
          error,
        );

        if (attempt === maxRetries) {
          this.sendAlert(
            `Failed to create monthly attempt partition after ${maxRetries} attempts`,
            error,
          );
          throw error;
        }

        // Exponential backoff: 5s, 10s, 15s
        await this.sleep(5000 * attempt);
      }
    }
  }

  /**
   * Automatically create next year's daily quiz question partition
   * Runs on December 1st at 2 AM to prepare for next year
   */
  @Cron('0 2 1 12 *', {
    name: 'create-yearly-quiz-question-partition',
    timeZone: 'UTC',
  })
  async createYearlyQuizQuestionPartitionCron() {
    this.logger.log(
      "Creating next year's daily quiz question partition (cron job)",
    );

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.createYearlyQuizQuestionPartition();
        this.logger.log(`Cron job completed successfully: ${result}`);
        return;
      } catch (error) {
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed to create yearly partition`,
          error,
        );

        if (attempt === maxRetries) {
          this.sendAlert(
            `Failed to create yearly quiz question partition after ${maxRetries} attempts`,
            error,
          );
          throw error;
        }

        await this.sleep(5000 * attempt);
      }
    }
  }

  /**
   * Cleanup old attempt partitions monthly
   * Runs on the 1st of each month at 3 AM
   */
  @Cron('0 3 1 * *', {
    name: 'cleanup-old-attempt-partitions',
    timeZone: 'UTC',
  })
  async cleanupOldAttemptPartitionsCron() {
    this.logger.log('Cleaning up old attempt partitions (cron job)');
    try {
      const result = await this.dropOldAttemptPartitions(this.retentionMonths);
      this.logger.log(`Cleanup completed: ${result}`);
    } catch (error) {
      this.logger.error(
        'Failed to cleanup old attempt partitions via cron',
        error,
      );
      this.sendAlert('Failed to cleanup old attempt partitions', error);
    }
  }

  /**
   * Cleanup old quiz question partitions annually
   * Runs on January 2nd at 3 AM
   */
  @Cron('0 3 2 1 *', {
    name: 'cleanup-old-quiz-question-partitions',
    timeZone: 'UTC',
  })
  async cleanupOldQuizQuestionPartitionsCron() {
    this.logger.log('Cleaning up old quiz question partitions (cron job)');
    try {
      const result = await this.dropOldQuizQuestionPartitions(
        this.retentionYears,
      );
      this.logger.log(`Cleanup completed: ${result}`);
    } catch (error) {
      this.logger.error(
        'Failed to cleanup old quiz question partitions via cron',
        error,
      );
      this.sendAlert('Failed to cleanup old quiz question partitions', error);
    }
  }

  /**
   * Manually create next month's attempt partition
   */
  async createMonthlyAttemptPartition(): Promise<string> {
    this.logger.log('Creating monthly attempt partition...');

    // Check if next month's partition already exists
    const nextMonthPartition = `attempt_${this.getNextMonthPartitionName()}`;
    const exists = await this.checkPartitionExists(nextMonthPartition);

    if (exists) {
      const message = `Partition ${nextMonthPartition} already exists`;
      this.logger.log(message);
      return message;
    }

    const result: PartitionQueryResult[] = await this.attemptRepository.query(
      'SELECT create_monthly_attempt_partition() as result',
    );

    const message = result[0]?.result || 'Partition created';
    this.logger.log(`Attempt partition result: ${message}`);
    return message;
  }

  /**
   * Manually create next year's quiz question partition
   */
  async createYearlyQuizQuestionPartition(): Promise<string> {
    this.logger.log('Creating yearly quiz question partition...');

    // Check if next year's partition already exists
    const nextYearPartition = `daily_quiz_question_${this.getNextYear()}`;
    const exists = await this.checkPartitionExists(nextYearPartition);

    if (exists) {
      const message = `Partition ${nextYearPartition} already exists`;
      this.logger.log(message);
      return message;
    }

    const result: PartitionQueryResult[] =
      await this.dailyQuizQuestionRepository.query(
        'SELECT create_yearly_daily_quiz_question_partition() as result',
      );

    const message = result[0]?.result || 'Partition created';
    this.logger.log(`Quiz question partition result: ${message}`);
    return message;
  }

  /**
   * Drop old attempt partitions beyond retention period
   */
  async dropOldAttemptPartitions(monthsToKeep: number = 12): Promise<string> {
    this.logger.log(
      `Dropping attempt partitions older than ${monthsToKeep} months...`,
    );

    const result: PartitionQueryResult[] = await this.attemptRepository.query(
      'SELECT drop_old_attempt_partitions($1) as result',
      [monthsToKeep],
    );

    const message = result[0]?.result || 'Cleanup completed';
    this.logger.log(`Attempt partition cleanup result: ${message}`);
    return message;
  }

  /**
   * Drop old quiz question partitions beyond retention period
   */
  async dropOldQuizQuestionPartitions(
    yearsToKeep: number = 5,
  ): Promise<string> {
    this.logger.log(
      `Dropping quiz question partitions older than ${yearsToKeep} years...`,
    );

    const result: PartitionQueryResult[] =
      await this.dailyQuizQuestionRepository.query(
        'SELECT drop_old_daily_quiz_question_partitions($1) as result',
        [yearsToKeep],
      );

    const message = result[0]?.result || 'Cleanup completed';
    this.logger.log(`Quiz question partition cleanup result: ${message}`);
    return message;
  }

  /**
   * Get information about current partitions
   */
  async getPartitionInfo(): Promise<{
    attemptPartitions: PartitionInfo[];
    quizQuestionPartitions: PartitionInfo[];
  }> {
    this.logger.log('Retrieving partition information...');

    // Get attempt partitions
    const attemptPartitions: PartitionInfo[] = await this.attemptRepository
      .query(`
      SELECT 
        schemaname, 
        tablename, 
        tableowner,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        (SELECT COUNT(*) FROM attempt WHERE tableoid = (schemaname||'.'||tablename)::regclass) as row_count
      FROM pg_tables 
      WHERE tablename LIKE 'attempt_20%' 
      ORDER BY tablename DESC
    `);

    // Get quiz question partitions
    const quizQuestionPartitions: PartitionInfo[] = await this
      .dailyQuizQuestionRepository.query(`
      SELECT 
        schemaname, 
        tablename, 
        tableowner,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        (SELECT COUNT(*) FROM daily_quiz_question WHERE tableoid = (schemaname||'.'||tablename)::regclass) as row_count
      FROM pg_tables 
      WHERE tablename LIKE 'daily_quiz_question_20%' 
      ORDER BY tablename DESC
    `);

    this.logger.log(
      `Found ${attemptPartitions.length} attempt partitions, ${quizQuestionPartitions.length} quiz question partitions`,
    );

    return {
      attemptPartitions: attemptPartitions,
      quizQuestionPartitions: quizQuestionPartitions,
    };
  }

  /**
   * Health check for partition system
   */
  async checkPartitionHealth(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if current month attempt partition exists
      const currentMonth = this.getCurrentMonthPartitionName();
      const attemptPartitionExists: TableExistsCheckResult[] =
        await this.attemptRepository.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
          [`attempt_${currentMonth}`],
        );

      if (attemptPartitionExists.length === 0) {
        issues.push(
          `Current month attempt partition (attempt_${currentMonth}) does not exist`,
        );
        recommendations.push(
          'Run createMonthlyAttemptPartition() to create current month partition',
        );
      }

      // Check if current year quiz question partition exists
      const currentYear = this.getCurrentYear();
      const quizQuestionPartitionExists: TableExistsCheckResult[] =
        await this.dailyQuizQuestionRepository.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
          [`daily_quiz_question_${currentYear}`],
        );

      if (quizQuestionPartitionExists.length === 0) {
        issues.push(
          `Current year quiz question partition (daily_quiz_question_${currentYear}) does not exist`,
        );
        recommendations.push(
          'Run createYearlyQuizQuestionPartition() to create current year partition',
        );
      }

      // Check for very large partitions that might need splitting
      const partitionInfo = await this.getPartitionInfo();

      for (const partition of partitionInfo.attemptPartitions) {
        if (partition.row_count > 1000000) {
          // 1M rows
          recommendations.push(
            `Attempt partition ${partition.tablename} has ${partition.row_count} rows - consider archiving old data`,
          );
        }
      }

      // Check for missing next month/year partitions
      const nextMonth = this.getNextMonthPartitionName();
      const nextMonthExists: TableExistsCheckResult[] =
        await this.attemptRepository.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
          [`attempt_${nextMonth}`],
        );

      // Use UTC date for consistent day-of-month checking
      const utcNow = new Date();
      const dayOfMonth = utcNow.getUTCDate();

      if (nextMonthExists.length === 0 && dayOfMonth >= 25) {
        recommendations.push(
          `Next month's attempt partition (attempt_${nextMonth}) should be created soon`,
        );
      }
    } catch (error) {
      issues.push(`Health check failed: ${(error as Error).message}`);
    }

    const healthy = issues.length === 0;

    this.logger.log(
      `Partition health check completed. Healthy: ${healthy}, Issues: ${issues.length}, Recommendations: ${recommendations.length}`,
    );

    return {
      healthy,
      issues,
      recommendations,
    };
  }

  /**
   * Initialize partitions for a new deployment
   */
  async initializePartitions(): Promise<void> {
    this.logger.log('Initializing partitions for new deployment...');

    try {
      // Ensure current month partition exists
      await this.createMonthlyAttemptPartition();

      // Ensure current year partition exists
      await this.createYearlyQuizQuestionPartition();

      // Create next month's partition if we're near month end
      const utcNow = new Date();
      const dayOfMonth = utcNow.getUTCDate();

      if (dayOfMonth >= 25) {
        this.logger.log(
          "Near month end, creating next month's partition proactively",
        );
        await this.createMonthlyAttemptPartition();
      }

      this.logger.log('Partition initialization completed successfully');
    } catch (error) {
      this.logger.error('Failed to initialize partitions', error);
      throw error;
    }
  }
}
