import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  DailyQuizComposerService,
  ComposerConfig,
  DailyQuizMode,
} from '../../database/services/daily-quiz-composer';

export interface ManualCompositionRequest {
  dropAtUTC: string;
  mode?: DailyQuizMode;
  config?: Partial<ComposerConfig>;
}

export interface CompositionLogsQuery {
  limit?: string;
  offset?: string;
}

/**
 * 🎯 Admin Composition Service
 *
 * Handles all composition-related admin operations:
 * - Manual quiz composition
 * - Composition previews
 * - System health checks
 * - Configuration management
 */
@Injectable()
export class AdminCompositionService {
  private readonly logger = new Logger(AdminCompositionService.name);

  constructor(private readonly composerService: DailyQuizComposerService) {}

  /**
   * Manually compose a daily quiz for a specific date/time
   */
  async composeDailyQuiz(request: ManualCompositionRequest) {
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
   * Preview quiz composition without creating records
   */
  async previewDailyQuiz(request: ManualCompositionRequest) {
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
   * Get question availability statistics
   */
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
   * Get composition health check
   */
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
   * Get available themes and modes
   */
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
   */
  async getCompositionLogs(query: CompositionLogsQuery) {
    try {
      const limit = parseInt(query.limit || '10');
      const offset = parseInt(query.offset || '0');

      const logs = await this.composerService.getRecentCompositionLogs(
        limit,
        offset,
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
}
