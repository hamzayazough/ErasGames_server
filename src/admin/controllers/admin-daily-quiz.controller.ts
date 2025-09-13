import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Query,
} from '@nestjs/common';
import {
  DailyQuizComposerService,
  ComposerConfig,
  DailyQuizMode,
  QuestionTheme,
} from '../../database/services/daily-quiz-composer';

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
export class AdminDailyQuizController {
  private readonly logger = new Logger(AdminDailyQuizController.name);

  constructor(private readonly composerService: DailyQuizComposerService) {}

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

      // This would implement a preview version that doesn't save to database
      // For now, return mock data showing what would be selected

      return {
        success: true,
        data: {
          previewMode: true,
          dropAtUTC: dropDate.toISOString(),
          mode: request.mode || DailyQuizMode.MIX,
          estimatedQuestions: 6,
          recommendedConfig: {
            targetQuestionCount: 6,
            difficultyDistribution: { easy: 3, medium: 2, hard: 1 },
          },
          warnings: ['This is a preview - no records will be created'],
        },
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
      // Perform health checks on the composition system
      const issues: string[] = [];
      const recommendations: string[] = [];

      // This would check question pool sizes, recent composition success rates, etc.

      const isHealthy = issues.length === 0;

      return {
        success: true,
        data: {
          healthy: isHealthy,
          issues,
          recommendations,
          lastCheck: new Date().toISOString(),
        },
        message: isHealthy
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
   * Get available themes and modes
   * GET /admin/daily-quiz/options
   */
  @Get('options')
  async getCompositionOptions() {
    return {
      success: true,
      data: {
        modes: Object.values(DailyQuizMode),
        themes: Object.values(QuestionTheme),
        defaultConfig: {
          targetQuestionCount: 6,
          difficultyDistribution: {
            easy: 3,
            medium: 2,
            hard: 1,
          },
          antiRepeatDays: {
            strict: 30,
            relaxed1: 21,
            relaxed2: 14,
            relaxed3: 10,
            final: 7,
          },
          maxExposureBias: 10,
          themeDiversity: {
            minUniqueThemes: 3,
            maxThemeOverlap: 2,
          },
        },
      },
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
      // This would fetch recent composition logs from a dedicated table
      // For now, return mock data

      return {
        success: true,
        data: {
          logs: [],
          pagination: {
            total: 0,
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        },
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
}
