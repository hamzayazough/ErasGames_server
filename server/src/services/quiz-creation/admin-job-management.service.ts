import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DailyQuizJobProcessor } from '../daily-quiz-job-processor.service';
import { DailyQuizMode } from '../../database/services/daily-quiz-composer';

export interface TriggerCompositionRequest {
  dropAtUTC: string;
}

export interface TriggerWarmupRequest {
  quizId: string;
}

export interface TestWorkflowRequest {
  dropAtUTC: string;
  mode?: DailyQuizMode;
}

/**
 * 🔧 Admin Job Management Service
 *
 * Handles all job-related admin operations:
 * - Manual job triggering
 * - Job status monitoring
 * - Workflow testing
 */
@Injectable()
export class AdminJobManagementService {
  private readonly logger = new Logger(AdminJobManagementService.name);

  constructor(private readonly jobProcessor: DailyQuizJobProcessor) {}

  /**
   * Manually trigger daily composition job
   */
  async triggerDailyComposition(request: TriggerCompositionRequest) {
    try {
      const dropDate = new Date(request.dropAtUTC);

      if (isNaN(dropDate.getTime())) {
        throw new HttpException(
          'Invalid dropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Manual job composition trigger requested for ${dropDate.toISOString()}`,
      );

      await this.jobProcessor.triggerDailyQuizCreation(dropDate);

      return {
        success: true,
        message: `Daily composition job triggered successfully for ${dropDate.toISOString()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to trigger composition job: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to trigger daily composition job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Manually trigger template warmup job
   */
  async triggerTemplateWarmup(request: TriggerWarmupRequest) {
    try {
      if (!request.quizId) {
        throw new HttpException('quizId is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(
        `Manual template warmup trigger requested for quiz ${request.quizId}`,
      );

      await this.jobProcessor.triggerTemplateGeneration(request.quizId);

      return {
        success: true,
        message: `Template warmup job triggered successfully for quiz ${request.quizId}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to trigger warmup job: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to trigger template warmup job: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get job status and scheduling information
   */
  getJobStatus() {
    try {
      const status = this.jobProcessor.getJobStatus();

      return {
        success: true,
        data: status,
        message: 'Job status retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get job status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        'Failed to retrieve job status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test the complete daily quiz workflow (composition + warmup)
   */
  async testCompleteWorkflow(request: TestWorkflowRequest) {
    try {
      const dropDate = new Date(request.dropAtUTC);

      if (isNaN(dropDate.getTime())) {
        throw new HttpException(
          'Invalid dropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Testing complete workflow for ${dropDate.toISOString()}`,
      );

      // Step 1: Trigger composition
      this.logger.log('Step 1: Running composition...');
      await this.jobProcessor.triggerDailyQuizCreation(dropDate);

      // Step 2: Find the created quiz
      this.logger.log('Step 2: Finding created quiz...');
      // We need to get the quiz ID from the database
      // For now, we'll return the composition result and let the user manually trigger warmup

      return {
        success: true,
        message: `Composition completed for ${dropDate.toISOString()}. Use the quiz ID from the logs endpoint to trigger warmup manually.`,
        nextSteps: [
          '1. Call GET /admin/daily-quiz/logs to find the quiz ID',
          '2. Call POST /admin/daily-quiz/jobs/trigger-warmup with the quiz ID',
          '3. Verify templateCdnUrl is set in the quiz record',
        ],
      };
    } catch (error) {
      this.logger.error(
        `Failed to test workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to test complete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
