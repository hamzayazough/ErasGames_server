import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronJob } from 'cron';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';
import { Question } from '../database/entities/question.entity';
import {
  DailyQuizComposerService,
  TemplateService,
  DailyQuizMode,
} from '../database/services/daily-quiz-composer';
import { NotificationService } from './notification.service';

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
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.log('DailyQuizJobProcessor service initialized');
  }

  /**
   * Daily quiz composition job
   * Runs every day at 2:00 AM UTC to generate tomorrow's quiz with random drop time (5-8 PM Toronto)
   */
  @Cron('0 2 * * *', {
    name: 'composer:daily',
    timeZone: 'UTC',
  })
  async runDailyComposition(): Promise<void> {
    this.logger.log('Starting daily quiz composition job');

    try {
      // Calculate tomorrow's drop time with random hour (5-8 PM Toronto)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Generate random hour between 5 PM and 8 PM Toronto time (22-03 UTC)
      const randomHour = Math.floor(Math.random() * 3) + 17; // 5 PM (17) to 7 PM (19) Toronto (inclusive range)
      const randomMinute = Math.floor(Math.random() * 60); // Random minute within the hour

      // Convert Toronto time to UTC (Toronto is UTC-5 in summer, UTC-4 in winter)
      // For simplicity, assuming UTC-5 offset (Eastern Daylight Time)
      const utcHour = (randomHour + 5) % 24;
      tomorrow.setUTCHours(utcHour, randomMinute, 0, 0);

      this.logger.log(
        `🎲 Random drop time selected: ${tomorrow.toISOString()} (${randomHour}:${randomMinute.toString().padStart(2, '0')} Toronto time)`,
      );

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

      // In production, this would trigger critical alerts:
      // - PagerDuty notification (wakes up engineers at 3 AM)
      // - Slack message to #engineering channel
      // - DataDog error metric for monitoring dashboards
      // - Sentry error tracking for debugging
      //
      // Example production code:
      // await this.alertingService.sendCriticalAlert('DailyQuizComposition', error, {
      //   dropTime: tomorrow.toISOString(),
      //   quizMode: DailyQuizMode.MIX
      // });
      //
      // This ensures engineers are immediately notified when daily quiz
      // creation fails, preventing users from having no quiz to play
    }
  }

  /**
   * Template warmup job (runs every 5 minutes)
   * Checks for quizzes that need template generation and are dropping soon
   */
  @Cron('*/5 * * * *', {
    name: 'warmup:template',
    timeZone: 'UTC',
  })
  async runTemplateWarmup(): Promise<void> {
    this.logger.log('Starting template warmup job');

    try {
      // Find today's quiz with any drop time (since it's now random)
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Find quizzes that need template generation and are dropping within the next 10 minutes
      const tenMinutesFromNow = new Date(today.getTime() + 10 * 60 * 1000);

      const quiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC > :now', { now: today })
        .andWhere('quiz.dropAtUTC <= :tenMinutesFromNow', { tenMinutesFromNow })
        .andWhere("quiz.templateCdnUrl IS NULL OR quiz.templateCdnUrl = ''")
        .orderBy('quiz.dropAtUTC', 'ASC')
        .getOne();

      if (!quiz) {
        this.logger.warn(
          `No quiz found for today that needs template generation`,
        );
        return;
      }

      // Check if template is already uploaded (URL will only be set after successful upload)
      if (quiz.templateCdnUrl) {
        this.logger.log(
          `Template already uploaded for quiz ${quiz.id}: ${quiz.templateCdnUrl}`,
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

      // Update the quiz record with the actual CDN URL after successful upload
      await this.dailyQuizRepository.update(quiz.id, {
        templateCdnUrl: templateUrl,
      });

      // Schedule notification for exact drop time (OPTIMAL APPROACH)
      const updatedQuiz = await this.dailyQuizRepository.findOne({
        where: { id: quiz.id },
      });
      if (updatedQuiz) {
        this.scheduleNotificationForQuiz(updatedQuiz);
      }

      this.logger.log(
        `Template uploaded successfully for quiz ${quiz.id}: ${templateUrl} (v${version})`,
      );
    } catch (error) {
      this.logger.error('Failed to build template', error);

      // In production, this would trigger critical alerts:
      // - Engineers get immediately notified via PagerDuty
      // - Slack alert: "Template upload failed - users won't be able to play quiz"
      // - DataDog dashboard shows template failure spike
      // - Automatic retry mechanism could be triggered
      //
      // Example production code:
      // await this.alertingService.sendCriticalAlert('TemplateWarmup', error, {
      //   quizId: quiz.id,
      //   dropTime: quiz.dropAtUTC.toISOString(),
      //   questionsCount: questions.length
      // });
    }
  }

  /**
   * Schedule notification for a quiz when it's created or template is ready
   * Creates a specific cron job for the exact drop time (OPTIMAL APPROACH)
   */
  scheduleNotificationForQuiz(quiz: DailyQuiz): void {
    const jobName = `notification-${quiz.id}`;

    // Don't schedule if already sent or if drop time has passed
    if (quiz.notificationSent || quiz.dropAtUTC <= new Date()) {
      this.logger.log(`Skipping notification scheduling for quiz ${quiz.id}`);
      return;
    }

    // Create cron expression for exact drop time
    const dropTime = quiz.dropAtUTC;
    const cronExpression = `${dropTime.getUTCSeconds()} ${dropTime.getUTCMinutes()} ${dropTime.getUTCHours()} ${dropTime.getUTCDate()} ${dropTime.getUTCMonth() + 1} *`;

    this.logger.log(
      `📅 OPTIMAL: Scheduling notification for quiz ${quiz.id} at EXACT time ${dropTime.toISOString()}`,
    );
    this.logger.log(`   No more database polling! Cron: ${cronExpression}`);

    try {
      // Create the cron job for exact timing
      const job = new CronJob(
        cronExpression,
        async () => {
          await this.sendQuizNotification(quiz);
          // Clean up the job after execution
          this.schedulerRegistry.deleteCronJob(jobName);
        },
        null, // onComplete
        true, // start immediately
        'UTC',
      );

      // Register the job with NestJS scheduler
      this.schedulerRegistry.addCronJob(jobName, job);

      this.logger.log(`✅ Notification scheduled for EXACT drop time`);
    } catch (error) {
      this.logger.error(
        `Failed to schedule notification for quiz ${quiz.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send notification for a specific quiz at its drop time
   */
  private async sendQuizNotification(quiz: DailyQuiz): Promise<void> {
    this.logger.log(
      `🔔 Sending notification for quiz ${quiz.id} - quiz is now live at ${quiz.dropAtUTC.toISOString()}!`,
    );

    try {
      // Check if template is ready
      if (!quiz.templateCdnUrl) {
        this.logger.error(`Quiz found but template not ready for ${quiz.id}`);
        return;
      }

      // Send push notifications to all users
      await this.notificationService.sendDailyQuizNotification(
        quiz.id,
        quiz.dropAtUTC,
      );

      // Mark notification as sent to avoid duplicate sends
      await this.dailyQuizRepository.update(quiz.id, {
        notificationSent: true,
      });

      this.logger.log(
        `🚀 Quiz notification sent successfully for quiz ${quiz.id} at ${quiz.dropAtUTC.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification for quiz ${quiz.id}`,
        error,
      );
    }
  }

  /**
   * Manual trigger for daily composition (for testing/admin)
   * If no dropAtUTC provided, generates one with random time for tomorrow
   */
  async triggerDailyComposition(dropAtUTC?: Date): Promise<void> {
    let targetDropTime = dropAtUTC;

    if (!targetDropTime) {
      // Generate random drop time for tomorrow (5-8 PM Toronto)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const randomHour = Math.floor(Math.random() * 3) + 17; // 5 PM to 7 PM Toronto
      const randomMinute = Math.floor(Math.random() * 60);
      const utcHour = (randomHour + 5) % 24; // Convert to UTC

      tomorrow.setUTCHours(utcHour, randomMinute, 0, 0);
      targetDropTime = tomorrow;

      this.logger.log(
        `🎲 Generated random drop time: ${targetDropTime.toISOString()} (${randomHour}:${randomMinute.toString().padStart(2, '0')} Toronto time)`,
      );
    }

    this.logger.log(
      `Manually triggering composition for ${targetDropTime.toISOString()}`,
    );

    const result = await this.composerService.composeDailyQuiz(
      targetDropTime,
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

    // Update the quiz record with the actual CDN URL after successful upload
    await this.dailyQuizRepository.update(quiz.id, {
      templateCdnUrl: templateUrl,
    });

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
    tomorrow.setUTCHours(2, 0, 0, 0); // Next composition time (2 AM UTC)

    const nextTemplateCheck = new Date(now);
    nextTemplateCheck.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0); // Next 5-minute interval

    return {
      composer: {
        lastRun: null, // Would track actual last run in production
        nextRun: tomorrow.toISOString(),
        status: 'scheduled',
      },
      template: {
        lastRun: null, // Would track actual last run in production
        nextRun: nextTemplateCheck.toISOString(),
        status: 'scheduled',
      },
    };
  }
}
