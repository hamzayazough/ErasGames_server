import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';

/**
 * Controller for daily quiz endpoints
 *
 * Provides public endpoints for:
 * - Getting today's daily quiz with timezone support
 */
@Controller('daily')
export class DailyQuizController {
  private readonly logger = new Logger(DailyQuizController.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
  ) {}

  /**
   * GET /daily
   * Returns today's DailyQuiz for America/Toronto timezone
   */
  @Get()
  async getTodaysQuiz(): Promise<{
    localDate: string;
    tz: string;
    window: {
      start: string;
      end: string;
    };
    dropAtLocal: string;
    joinWindowEndsAtLocal: string;
    templateUrl: string;
    templateVersion: number;
  }> {
    try {
      // Get current date in America/Toronto timezone
      const now = new Date();
      const torontoDate = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Toronto' }),
      );

      // Format local date as YYYY-MM-DD
      const localDate = torontoDate.toISOString().split('T')[0];

      // Calculate drop time for today (assuming 12:00 PM Toronto time)
      const dropAtLocal = new Date(torontoDate);
      dropAtLocal.setHours(12, 0, 0, 0);

      // Convert to UTC for database query
      const dropAtUTC = new Date(
        dropAtLocal.toLocaleString('en-US', { timeZone: 'UTC' }),
      );

      // Find today's quiz
      const quiz = await this.dailyQuizRepository.findOne({
        where: {
          dropAtUTC: dropAtUTC,
        },
      });

      if (!quiz) {
        this.logger.warn(
          `No daily quiz found for ${localDate} (UTC: ${dropAtUTC.toISOString()})`,
        );
        throw new HttpException(
          'No daily quiz available for today',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!quiz.templateCdnUrl) {
        this.logger.warn(`Quiz found but template not ready for ${localDate}`);
        throw new HttpException(
          'Daily quiz template not ready yet',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Calculate join window (typically 24 hours from drop)
      const joinWindowEnd = new Date(dropAtLocal);
      joinWindowEnd.setHours(dropAtLocal.getHours() + 24);

      // Calculate daily window (from drop time to end of day Toronto time)
      const windowStart = new Date(dropAtLocal);
      const windowEnd = new Date(dropAtLocal);
      windowEnd.setHours(23, 59, 59, 999);

      return {
        localDate,
        tz: 'America/Toronto',
        window: {
          start: windowStart.toISOString(),
          end: windowEnd.toISOString(),
        },
        dropAtLocal: dropAtLocal.toISOString(),
        joinWindowEndsAtLocal: joinWindowEnd.toISOString(),
        templateUrl: quiz.templateCdnUrl,
        templateVersion: quiz.templateVersion,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error("Failed to get today's quiz", error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
