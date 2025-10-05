import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AdminGuard } from '../../guards/admin.guard';
import {
  DailyQuizComposerService,
  ComposerConfig,
  DailyQuizMode,
} from '../../database/services/daily-quiz-composer';
import { DailyQuizJobProcessor } from '../../services/daily-quiz-job-processor.service';
import { DailyQuiz } from '../../database/entities/daily-quiz.entity';

/**
 * Admin controller for manual daily quiz composition and monitoring
 *
 * Provides endpoints for:
 * - Manual quiz generation
 * - Composition monitoring and statistics
 * - Question availability checking
 * - System health validation
 */
@Controller('admin/daily-quiz')
@UseGuards(AdminGuard)
export class AdminDailyQuizController {
  private readonly logger = new Logger(AdminDailyQuizController.name);

  constructor(
    private readonly composerService: DailyQuizComposerService,
    private readonly jobProcessor: DailyQuizJobProcessor,
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
  ) {}

  /**
   * Manually compose a daily quiz for a specific date/time
   * POST /admin/daily-quiz/compose
   */
  @Post('compose')
  async composeDailyQuiz(
    @Body()
    request: {
      dropAtUTC: string;
      mode?: DailyQuizMode;
      config?: Partial<ComposerConfig>;
    },
  ) {
    try {
      const dropDate = new Date(request.dropAtUTC);

      if (isNaN(dropDate.getTime())) {
        throw new HttpException(
          'Invalid dropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const mode = request.mode || DailyQuizMode.MIX;

      this.logger.log(
        `Manual composition requested for ${dropDate.toISOString()}`,
      );

      const result = await this.composerService.composeDailyQuiz(
        dropDate,
        mode,
        request.config,
      );

      return {
        success: true,
        data: {
          quizId: result.dailyQuiz.id,
          questionCount: result.questions.length,
          template: {
            version: result.template.version,
            cdnUrl: result.dailyQuiz.templateCdnUrl,
            size: JSON.stringify(result.template).length,
          },
          composition: {
            relaxationLevel:
              result.compositionLog.finalSelection.averageExposure,
            themeDistribution:
              result.compositionLog.finalSelection.themeDistribution,
            difficultyActual:
              result.compositionLog.finalSelection.difficultyActual,
            warnings: result.compositionLog.warnings,
            performanceMs: result.compositionLog.performance.durationMs,
          },
        },
        message: `Successfully composed daily quiz for ${dropDate.toISOString()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to compose quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to compose daily quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get question availability statistics
   * GET /admin/daily-quiz/availability
   */
  @Get('availability')
  async getQuestionAvailability() {
    try {
      const availability = await this.composerService.getCompositionStats();

      return {
        success: true,
        data: availability,
        message: 'Question availability retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get availability: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        `Failed to retrieve question availability: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Preview quiz composition without creating records
   * POST /admin/daily-quiz/preview
   */
  @Post('preview')
  async previewDailyQuiz(
    @Body()
    request: {
      dropAtUTC: string;
      mode?: DailyQuizMode;
      config?: Partial<ComposerConfig>;
    },
  ) {
    try {
      const dropDate = new Date(request.dropAtUTC);

      if (isNaN(dropDate.getTime())) {
        throw new HttpException(
          'Invalid dropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const mode = request.mode || DailyQuizMode.MIX;

      const preview = await this.composerService.previewComposition(
        dropDate,
        mode,
        request.config,
      );

      return {
        success: true,
        data: preview,
        message: 'Preview generated successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to preview quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        `Failed to preview daily quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get composition health check
   * GET /admin/daily-quiz/health
   */
  @Get('health')
  async getCompositionHealth() {
    try {
      const healthData = await this.composerService.getSystemHealth();

      return {
        success: true,
        data: healthData,
        message: healthData.healthy
          ? 'Composition system is healthy'
          : 'Issues detected',
      };
    } catch (error) {
      this.logger.error(
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        'Health check failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get quiz for a specific number of days from now
   * GET /admin/daily-quiz/by-days?days=0 (0=today, 1=tomorrow, etc.)
   */
  @Get('by-days')
  async getQuizByDaysFromNow(@Query('days') days: string = '0') {
    try {
      const daysNumber = parseInt(days);

      if (isNaN(daysNumber) || daysNumber < 0) {
        throw new HttpException(
          'Invalid days parameter. Must be a non-negative integer.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate target date
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysNumber);

      // Set to start of day to search for any quiz on that date
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      this.logger.log(
        `Searching for quiz on ${targetDate.toDateString()} (${daysNumber} days from now)`,
      );

      // Find quiz for the target date
      const quiz = await this.dailyQuizRepository.findOne({
        where: {
          dropAtUTC: Between(startOfDay, endOfDay),
        },
      });

      if (!quiz) {
        const dateLabel =
          daysNumber === 0
            ? 'today'
            : daysNumber === 1
              ? 'tomorrow'
              : `in ${daysNumber} days`;

        return {
          success: false,
          data: null,
          message: `No quiz found for ${dateLabel} (${targetDate.toDateString()})`,
        };
      }

      // Get question count by querying the daily_quiz_question table
      const questionCount = await this.dailyQuizRepository.manager
        .query(
          'SELECT COUNT(*) as count FROM daily_quiz_question WHERE daily_quiz_id = $1',
          [quiz.id],
        )
        .then((result) => parseInt(result[0]?.count || '0'));

      return {
        success: true,
        data: {
          id: quiz.id,
          dropAtUTC: quiz.dropAtUTC.toISOString(),
          mode: quiz.mode,
          themePlan: quiz.themePlanJSON,
          questionCount: questionCount,
          templateCdnUrl: quiz.templateCdnUrl,
          templateVersion: quiz.templateVersion,
          notificationSent: quiz.notificationSent,
          createdAt: quiz.createdAt.toISOString(),
          isReady: !!quiz.templateCdnUrl,
          status: quiz.templateCdnUrl ? 'ready' : 'pending_template',
        },
        message: `Quiz found for ${targetDate.toDateString()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get quiz by days: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to retrieve quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get available themes and modes
   * GET /admin/daily-quiz/options
   */
  @Get('options')
  getCompositionOptions() {
    const options = this.composerService.getConfigurationOptions();

    return {
      success: true,
      data: options,
      message: 'Composition options retrieved successfully',
    };
  }

  /**
   * Get recent composition logs
   * GET /admin/daily-quiz/logs
   */
  @Get('logs')
  async getCompositionLogs(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ) {
    try {
      const logs = await this.composerService.getRecentCompositionLogs(
        parseInt(limit),
        parseInt(offset),
      );

      return {
        success: true,
        data: logs,
        message: 'Composition logs retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        'Failed to retrieve composition logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Manually trigger daily composition job
   * POST /admin/daily-quiz/jobs/trigger-composition
   */
  @Post('jobs/trigger-composition')
  async triggerDailyComposition(@Body() request: { dropAtUTC: string }) {
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

      await this.jobProcessor.triggerDailyComposition(dropDate);

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
   * POST /admin/daily-quiz/jobs/trigger-warmup
   */
  @Post('jobs/trigger-warmup')
  async triggerTemplateWarmup(@Body() request: { quizId: string }) {
    try {
      if (!request.quizId) {
        throw new HttpException('quizId is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(
        `Manual template warmup trigger requested for quiz ${request.quizId}`,
      );

      await this.jobProcessor.triggerTemplateWarmup(request.quizId);

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
   * GET /admin/daily-quiz/jobs/status
   */
  @Get('jobs/status')
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
   * POST /admin/daily-quiz/jobs/test-workflow
   */
  @Post('jobs/test-workflow')
  async testCompleteWorkflow(
    @Body() request: { dropAtUTC: string; mode?: DailyQuizMode },
  ) {
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
      await this.jobProcessor.triggerDailyComposition(dropDate);

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
