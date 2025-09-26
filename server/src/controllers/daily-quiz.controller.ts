import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { Attempt } from '../database/entities/attempt.entity';
import { User } from '../database/entities/user.entity';

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
    @InjectRepository(Attempt)
    private readonly attemptRepository: Repository<Attempt>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * GET /daily/status
   * Consolidated endpoint that returns quiz availability, timing, and user attempt status
   * This replaces the need for separate /daily and /daily/next calls
   */
  @Get('status')
  async getDailyQuizStatus(@Req() req: Request): Promise<{
    isAvailable: boolean;
    quiz?: {
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
    };
    nextDrop: {
      nextDropTime: string;
      nextDropTimeLocal: string;
      localDate: string;
      tz: string;
      isToday: boolean;
      timeUntilDrop: number;
    };
    attempt?: {
      id: string;
      status: 'in_progress' | 'completed';
      score?: number;
      completedAt?: string;
    };
  }> {
    try {
      // Get Firebase user from middleware
      const firebaseUser = req.firebaseUser;
      if (!firebaseUser) {
        throw new HttpException(
          'Authentication required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const uid = firebaseUser.uid;
      const now = new Date();

      // Get user for attempt checking
      let user = await this.userRepository.findOne({ where: { id: uid } });
      if (!user) {
        // Create user if doesn't exist
        user = this.userRepository.create({
          id: uid,
          email: firebaseUser.email || null,
          name: firebaseUser.name || 'User',
          handle: `user_${uid.slice(0, 8)}`,
        });
        user = await this.userRepository.save(user);
        this.logger.log(`Created new user with UID: ${uid}`);
      }

      // Check for today's quiz and availability
      const startOfToday = new Date(now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      const endOfToday = new Date(now);
      endOfToday.setUTCHours(23, 59, 59, 999);

      const todaysQuiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfToday', { startOfToday })
        .andWhere('quiz.dropAtUTC <= :endOfToday', { endOfToday })
        .orderBy('quiz.dropAtUTC', 'ASC')
        .getOne();

      let isAvailable = false;
      let quizData = null;
      let attemptData = null;

      if (todaysQuiz) {
        const oneHourAfterDrop = new Date(
          todaysQuiz.dropAtUTC.getTime() + 60 * 60 * 1000,
        );

        // Check if quiz is currently available (within 1-hour window)
        isAvailable =
          now >= todaysQuiz.dropAtUTC &&
          now <= oneHourAfterDrop &&
          !!todaysQuiz.templateCdnUrl;

        if (isAvailable) {
          const dropAtLocal = new Date(
            todaysQuiz.dropAtUTC.toLocaleString('en-US', {
              timeZone: 'America/Toronto',
            }),
          );
          const localDate = dropAtLocal.toISOString().split('T')[0];
          const joinWindowEnd = oneHourAfterDrop;

          quizData = {
            localDate,
            tz: 'America/Toronto',
            window: {
              start: todaysQuiz.dropAtUTC.toISOString(),
              end: oneHourAfterDrop.toISOString(),
            },
            dropAtLocal: dropAtLocal.toISOString(),
            joinWindowEndsAtLocal: joinWindowEnd.toISOString(),
            templateUrl: todaysQuiz.templateCdnUrl,
            templateVersion: todaysQuiz.templateVersion,
          };
        }

        // Check for existing attempt
        const existingAttempt = await this.attemptRepository.findOne({
          where: {
            user: { id: user.id },
            dailyQuiz: { id: todaysQuiz.id },
          },
        });

        if (existingAttempt) {
          attemptData = {
            id: existingAttempt.id,
            status: existingAttempt.finishAt
              ? ('completed' as const)
              : ('in_progress' as const),
            score: existingAttempt.score || undefined,
            completedAt: existingAttempt.finishAt?.toISOString(),
          };
        }
      }

      // Get next drop time (reuse existing logic)
      const nextDropInfo = await this.getNextQuizDropTimeInternal();

      return {
        isAvailable,
        quiz: quizData || undefined,
        nextDrop: nextDropInfo,
        attempt: attemptData || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to get daily quiz status', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Internal method to get next quiz drop time
   * Used by both /daily/next and /daily/status endpoints
   */
  private async getNextQuizDropTimeInternal(): Promise<{
    nextDropTime: string;
    nextDropTimeLocal: string;
    localDate: string;
    tz: string;
    isToday: boolean;
    timeUntilDrop: number;
  }> {
    const now = new Date();

    // First, check if there's a quiz today that's currently available (within 1-hour window)
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setUTCHours(23, 59, 59, 999);

    const currentQuiz = await this.dailyQuizRepository
      .createQueryBuilder('quiz')
      .where('quiz.dropAtUTC >= :startOfToday', { startOfToday })
      .andWhere('quiz.dropAtUTC <= :endOfToday', { endOfToday })
      .andWhere('quiz.dropAtUTC <= :now', { now }) // Quiz has already dropped
      .andWhere('quiz.dropAtUTC > :oneHourAgo', {
        oneHourAgo: new Date(now.getTime() - 60 * 60 * 1000),
      }) // Still within 1-hour window
      .orderBy('quiz.dropAtUTC', 'DESC')
      .getOne();

    if (currentQuiz) {
      // There's a quiz available right now
      const dropAtLocal = new Date(
        currentQuiz.dropAtUTC.toLocaleString('en-US', {
          timeZone: 'America/Toronto',
        }),
      );
      const localDate = dropAtLocal.toISOString().split('T')[0];

      return {
        nextDropTime: currentQuiz.dropAtUTC.toISOString(),
        nextDropTimeLocal: dropAtLocal.toISOString(),
        localDate,
        tz: 'America/Toronto',
        isToday: true,
        timeUntilDrop: 0, // Quiz is available now
      };
    }

    // Check if there's a quiz today that hasn't started yet
    const todaysQuiz = await this.dailyQuizRepository
      .createQueryBuilder('quiz')
      .where('quiz.dropAtUTC >= :startOfToday', { startOfToday })
      .andWhere('quiz.dropAtUTC <= :endOfToday', { endOfToday })
      .andWhere('quiz.dropAtUTC > :now', { now }) // Only future quizzes
      .orderBy('quiz.dropAtUTC', 'ASC')
      .getOne();

    if (todaysQuiz) {
      // There's a quiz today that hasn't dropped yet
      const dropAtLocal = new Date(
        todaysQuiz.dropAtUTC.toLocaleString('en-US', {
          timeZone: 'America/Toronto',
        }),
      );
      const localDate = dropAtLocal.toISOString().split('T')[0];
      const timeUntilDrop = Math.max(
        0,
        Math.floor((todaysQuiz.dropAtUTC.getTime() - now.getTime()) / 1000),
      );

      return {
        nextDropTime: todaysQuiz.dropAtUTC.toISOString(),
        nextDropTimeLocal: dropAtLocal.toISOString(),
        localDate,
        tz: 'America/Toronto',
        isToday: true,
        timeUntilDrop,
      };
    }

    // No quiz today, look for tomorrow's quiz
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setUTCHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(now);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setUTCHours(23, 59, 59, 999);

    const tomorrowsQuiz = await this.dailyQuizRepository
      .createQueryBuilder('quiz')
      .where('quiz.dropAtUTC >= :startOfTomorrow', { startOfTomorrow })
      .andWhere('quiz.dropAtUTC <= :endOfTomorrow', { endOfTomorrow })
      .orderBy('quiz.dropAtUTC', 'ASC')
      .getOne();

    if (tomorrowsQuiz) {
      const dropAtLocal = new Date(
        tomorrowsQuiz.dropAtUTC.toLocaleString('en-US', {
          timeZone: 'America/Toronto',
        }),
      );
      const localDate = dropAtLocal.toISOString().split('T')[0];
      const timeUntilDrop = Math.max(
        0,
        Math.floor((tomorrowsQuiz.dropAtUTC.getTime() - now.getTime()) / 1000),
      );

      return {
        nextDropTime: tomorrowsQuiz.dropAtUTC.toISOString(),
        nextDropTimeLocal: dropAtLocal.toISOString(),
        localDate,
        tz: 'America/Toronto',
        isToday: false,
        timeUntilDrop,
      };
    }

    // No quiz found for today or tomorrow
    throw new HttpException('No upcoming quiz found', HttpStatus.NOT_FOUND);
  }

  /**
   * GET /daily/next
   * Returns the next quiz drop time for countdown display
   */
  @Get('next')
  async getNextQuizDropTime(): Promise<{
    nextDropTime: string;
    nextDropTimeLocal: string;
    localDate: string;
    tz: string;
    isToday: boolean;
    timeUntilDrop: number; // seconds until drop
  }> {
    try {
      return await this.getNextQuizDropTimeInternal();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to get next quiz drop time', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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

      // Find today's quiz (could be at any random time during the day)
      const startOfDay = new Date(now);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const quiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
        .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
        .orderBy('quiz.dropAtUTC', 'ASC')
        .getOne();

      if (!quiz) {
        this.logger.warn(`No daily quiz found for ${localDate}`);
        throw new HttpException(
          'No daily quiz available for today',
          HttpStatus.NOT_FOUND,
        );
      }

      // Convert quiz drop time to Toronto timezone
      const dropAtLocal = new Date(
        quiz.dropAtUTC.toLocaleString('en-US', { timeZone: 'America/Toronto' }),
      );

      // Enforce 1-hour access window
      const oneHourAfterDrop = new Date(
        quiz.dropAtUTC.getTime() + 60 * 60 * 1000,
      );

      if (now < quiz.dropAtUTC) {
        this.logger.warn(
          `⏰ Quiz access denied - not yet available. Current: ${now.toISOString()}, Drops at: ${quiz.dropAtUTC.toISOString()}`,
        );
        throw new HttpException(
          `Daily quiz will be available at ${dropAtLocal.toLocaleString()}`,
          HttpStatus.FORBIDDEN,
        );
      }

      if (now > oneHourAfterDrop) {
        this.logger.warn(
          `⏰ Quiz access denied - window expired. Current: ${now.toISOString()}, Window ended: ${oneHourAfterDrop.toISOString()}`,
        );
        throw new HttpException(
          `Daily quiz window expired at ${new Date(oneHourAfterDrop.toLocaleString('en-US', { timeZone: 'America/Toronto' })).toLocaleString()}`,
          HttpStatus.GONE,
        );
      }

      this.logger.log(
        `✅ Quiz access granted. Quiz: ${quiz.id}, Drop: ${quiz.dropAtUTC.toISOString()}, Window ends: ${oneHourAfterDrop.toISOString()}`,
      );

      if (!quiz.templateCdnUrl) {
        this.logger.warn(`Quiz found but template not ready for ${localDate}`);
        throw new HttpException(
          'Daily quiz template not ready yet',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Calculate 1-hour join window
      const joinWindowEnd = oneHourAfterDrop;

      // Quiz window is exactly 1 hour from drop time
      const windowStart = new Date(quiz.dropAtUTC);
      const windowEnd = oneHourAfterDrop;

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
