import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';
import { Question } from '../database/entities/question.entity';
import {
  DailyQuizComposerService,
  TemplateService,
  DailyQuizMode,
} from '../database/services/daily-quiz-composer';

/**
 * Background job processor for daily quiz operations
 *
 * Handles:
 * - composer:daily (T-60m) - Generate daily quiz questions
 * - warmup:template (T-5m) - Build and upload CDN templates
 */
@Injectable()
export class DailyQuizJobProcessor {
  private readonly logger = new Logger(DailyQuizJobProcessor.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly composerService: DailyQuizComposerService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * Daily quiz composition job (T-60m)
   * Runs every day at 11:00 AM Toronto time to prepare for 12:00 PM drop
   */
  @Cron('0 16 * * *', {
    name: 'composer:daily',
    timeZone: 'UTC', // 11 AM Toronto = 4 PM UTC (approximate)
  })
  async runDailyComposition(): Promise<void> {
    this.logger.log('Starting daily quiz composition job');

    try {
      // Calculate tomorrow's drop time (12:00 PM Toronto)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setUTCHours(17, 0, 0, 0); // 12 PM Toronto = 5 PM UTC (approximate)

      // Check if quiz already exists for tomorrow
      const existingQuiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC: tomorrow },
      });

      if (existingQuiz) {
        this.logger.log(
          `Quiz already exists for ${tomorrow.toISOString()}, skipping composition`,
        );
        return;
      }

      // Compose daily quiz
      const result = await this.composerService.composeDailyQuiz(
        tomorrow,
        DailyQuizMode.MIX, // Default to MIX mode for MVP
      );

      this.logger.log(
        `Daily quiz composed successfully: ${result.dailyQuiz.id} with ${result.questions.length} questions`,
      );
    } catch (error) {
      this.logger.error('Failed to compose daily quiz', error);
      // In production, this would trigger alerts
    }
  }

  /**
   * Template warmup job (T-5m)
   * Runs every day at 11:55 AM Toronto time to prepare templates for 12:00 PM drop
   */
  @Cron('0 55 16 * * *', {
    name: 'warmup:template',
    timeZone: 'UTC', // 11:55 AM Toronto = 4:55 PM UTC (approximate)
  })
  async runTemplateWarmup(): Promise<void> {
    this.logger.log('Starting template warmup job');

    try {
      // Calculate today's drop time (12:00 PM Toronto)
      const today = new Date();
      today.setUTCHours(17, 0, 0, 0); // 12 PM Toronto = 5 PM UTC (approximate)

      // Find today's quiz
      const quiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC: today },
      });

      if (!quiz) {
        this.logger.warn(`No quiz found for today (${today.toISOString()})`);
        return;
      }

      // Check if template is already ready
      if (quiz.templateCdnUrl) {
        this.logger.log(
          `Template already exists for quiz ${quiz.id}: ${quiz.templateCdnUrl}`,
        );
        return;
      }

      // Get quiz questions
      const quizQuestions = await this.dailyQuizQuestionRepository.find({
        where: { dailyQuiz: { id: quiz.id } },
        relations: ['question'],
      });

      if (quizQuestions.length === 0) {
        this.logger.error(`No questions found for quiz ${quiz.id}`);
        return;
      }

      const questions = quizQuestions.map((qq) => qq.question);

      // Build and upload template
      const { templateUrl, version } =
        await this.templateService.buildAndUploadTemplate(
          quiz,
          questions,
          quiz.themePlanJSON as any, // Type assertion for JSON field
        );

      this.logger.log(
        `Template uploaded successfully for quiz ${quiz.id}: ${templateUrl} (v${version})`,
      );
    } catch (error) {
      this.logger.error('Failed to build template', error);
      // In production, this would trigger alerts
    }
  }

  /**
   * Manual trigger for daily composition (for testing/admin)
   */
  async triggerDailyComposition(dropAtUTC: Date): Promise<void> {
    this.logger.log(
      `Manually triggering composition for ${dropAtUTC.toISOString()}`,
    );

    const result = await this.composerService.composeDailyQuiz(
      dropAtUTC,
      DailyQuizMode.MIX,
    );

    this.logger.log(
      `Manual composition completed: ${result.dailyQuiz.id} with ${result.questions.length} questions`,
    );
  }

  /**
   * Manual trigger for template warmup (for testing/admin)
   */
  async triggerTemplateWarmup(quizId: string): Promise<void> {
    this.logger.log(`Manually triggering template warmup for quiz ${quizId}`);

    const quiz = await this.dailyQuizRepository.findOne({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    const quizQuestions = await this.dailyQuizQuestionRepository.find({
      where: { dailyQuiz: { id: quiz.id } },
      relations: ['question'],
    });

    const questions = quizQuestions.map((qq) => qq.question);

    const { templateUrl, version } =
      await this.templateService.buildAndUploadTemplate(
        quiz,
        questions,
        quiz.themePlanJSON as any,
      );

    this.logger.log(
      `Manual template warmup completed: ${templateUrl} (v${version})`,
    );
  }

  /**
   * Health check for scheduled jobs
   */
  getJobStatus(): {
    composer: {
      lastRun: string | null;
      nextRun: string;
      status: string;
    };
    template: {
      lastRun: string | null;
      nextRun: string;
      status: string;
    };
  } {
    // For MVP, return basic status
    // In production, this would query job queue status
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setUTCHours(16, 0, 0, 0); // Next composition time

    const todayTemplate = new Date(now);
    todayTemplate.setUTCHours(16, 55, 0, 0); // Next template time

    return {
      composer: {
        lastRun: null, // Would track actual last run in production
        nextRun: tomorrow.toISOString(),
        status: 'scheduled',
      },
      template: {
        lastRun: null, // Would track actual last run in production
        nextRun: todayTemplate.toISOString(),
        status: 'scheduled',
      },
    };
  }
}
