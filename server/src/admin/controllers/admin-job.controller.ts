import {
  Controller,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { DailyQuizJobProcessor } from '../../services/daily-quiz-job-processor.service';

/**
 * Admin controller for managing daily quiz background jobs
 */
@Controller('admin/jobs')
@UseGuards(AdminGuard)
export class AdminJobController {
  private readonly logger = new Logger(AdminJobController.name);

  constructor(private readonly jobProcessor: DailyQuizJobProcessor) {}

  /**
   * GET /admin/jobs/status
   * Get status of scheduled jobs
   */
  @Get('status')
  getJobStatus() {
    return this.jobProcessor.getJobStatus();
  }

  /**
   * GET /admin/jobs/notifications
   * Get list of active notification cron jobs for debugging
   */
  @Get('notifications')
  getActiveNotificationJobs() {
    return {
      success: true,
      data: this.jobProcessor.getActiveNotificationJobs(),
      message: 'Active notification jobs retrieved',
    };
  }

  /**
   * POST /admin/jobs/composer/trigger
   * Manually trigger daily composition job
   */
  @Post('composer/trigger')
  async triggerComposer(
    @Body() request: { dropAtUTC: string },
  ): Promise<{ message: string }> {
    try {
      const dropDate = new Date(request.dropAtUTC);

      if (isNaN(dropDate.getTime())) {
        throw new HttpException(
          'Invalid dropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.jobProcessor.triggerDailyQuizCreation(dropDate);

      return {
        message: `Daily composition triggered for ${dropDate.toISOString()}`,
      };
    } catch (error) {
      this.logger.error('Failed to trigger composer job', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /admin/jobs/template/trigger
   * Manually trigger template warmup job
   */
  @Post('template/trigger')
  async triggerTemplate(
    @Body() request: { quizId: string },
  ): Promise<{ message: string }> {
    try {
      await this.jobProcessor.triggerTemplateGeneration(request.quizId);

      return {
        message: `Template warmup triggered for quiz ${request.quizId}`,
      };
    } catch (error) {
      this.logger.error('Failed to trigger template job', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /admin/jobs/composer/run
   * Run daily composition job immediately
   */
  @Post('composer/run')
  async runComposerJob(): Promise<{ message: string }> {
    try {
      await this.jobProcessor.runDailyQuizCreation();

      return {
        message: 'Daily composition job completed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to run composer job', error);
      throw new HttpException(
        'Failed to run composer job',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /admin/jobs/template/run
   * Run template warmup job immediately
   */
  @Post('template/run')
  async runTemplateJob(): Promise<{ message: string }> {
    try {
      await this.jobProcessor.runTemplateRetry();

      return {
        message: 'Template warmup job completed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to run template job', error);
      throw new HttpException(
        'Failed to run template job',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
