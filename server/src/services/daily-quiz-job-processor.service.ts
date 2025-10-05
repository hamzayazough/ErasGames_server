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
import { QuizCreationService } from './quiz-creation';

/**
 * Background job processor for daily quiz operations
 *
 * Handles:
 * - daily-quiz-complete (2:00 AM UTC) - Complete quiz creation (composition + template generation)
 * - template-retry (every 30 min) - Retry failed template generations for resilience
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
    private readonly quizCreationService: QuizCreationService,
  ) {
    this.logger.log('DailyQuizJobProcessor service initialized');
  }

  /**
   * Complete daily quiz creation job
   * Runs every day at 2:00 AM UTC to generate tomorrow's quiz with random drop time (5-8 PM Toronto)
   * Includes both composition and template generation in a single atomic operation
   */
  @Cron('0 2 * * *', {
    name: 'daily-quiz-complete',
    timeZone: 'UTC',
  })
  async runDailyQuizCreation(): Promise<void> {
    this.logger.log('Starting complete daily quiz creation job');

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

      // Check if quiz already exists for tomorrow using the new service
      const existingCheck =
        await this.quizCreationService.checkExistingQuizForDate(tomorrow);

      if (existingCheck.exists) {
        this.logger.log(
          `Quiz already exists for ${tomorrow.toDateString()} (${existingCheck.quiz!.dropAtUTC.toISOString()}), attempting template generation if needed`,
        );

        // If quiz exists but doesn't have template, try to generate it
        if (!existingCheck.quiz!.templateCdnUrl) {
          const quizDetails = await this.quizCreationService.getQuizDetails(
            existingCheck.quiz!.id,
          );
          await this.quizCreationService.generateTemplate(
            quizDetails.quiz,
            quizDetails.questions,
            (quiz) => this.scheduleNotificationForQuiz(quiz), // Only schedule notification when template is ready
          );
        }
        return;
      }

      // Create complete quiz using the new service with notification callback
      const result = await this.quizCreationService.createCompleteQuiz({
        dropAtUTC: tomorrow,
        mode: DailyQuizMode.MIX,
        onTemplateReady: (quiz) => this.scheduleNotificationForQuiz(quiz), // Only schedule notification when template is ready
      });

      this.logger.log(
        `🚀 Complete daily quiz creation finished successfully for quiz ${result.quiz.id}`,
      );
    } catch (error) {
      this.logger.error('Failed in daily quiz creation process', error);

      // In production, this would trigger critical alerts:
      // - PagerDuty notification (wakes up engineers at 3 AM)
      // - Slack message to #engineering channel
      // - DataDog error metric for monitoring dashboards
      // - Sentry error tracking for debugging
      //
      // Example production code:
      // await this.alertingService.sendCriticalAlert('DailyQuizCreation', error, {
      //   dropTime: tomorrow.toISOString(),
      //   quizMode: DailyQuizMode.MIX,
      //   quizCreated: !!result?.quiz,
      //   templateGenerated: !!result?.templateUrl
      // });
    }
  }

  /**
   * Template retry job
   * Runs every 6 hours to retry failed template generations
   * This provides resilience if template generation fails during main job
   */
  @Cron('0 */6 * * *', {
    name: 'template-retry',
    timeZone: 'UTC',
  })
  async runTemplateRetry(): Promise<void> {
    this.logger.log('Starting template retry job');

    try {
      // Find quizzes without templates that are scheduled for the future
      const now = new Date();
      const quizzesNeedingTemplates = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC > :now', { now })
        .andWhere("quiz.templateCdnUrl IS NULL OR quiz.templateCdnUrl = ''")
        .orderBy('quiz.dropAtUTC', 'ASC')
        .limit(5) // Process up to 5 at a time to avoid overload
        .getMany();

      if (quizzesNeedingTemplates.length === 0) {
        this.logger.log('No quizzes found that need template generation');
        return;
      }

      this.logger.log(
        `Found ${quizzesNeedingTemplates.length} quizzes needing template generation`,
      );

      // Process each quiz using the new service
      for (const quiz of quizzesNeedingTemplates) {
        try {
          const quizDetails = await this.quizCreationService.getQuizDetails(
            quiz.id,
          );
          await this.quizCreationService.generateTemplate(
            quizDetails.quiz,
            quizDetails.questions,
            (quiz) => this.scheduleNotificationForQuiz(quiz), // Only schedule notification when template is ready
          );

          this.logger.log(`✅ Template generated for quiz ${quiz.id}`);
        } catch (error) {
          this.logger.error(
            `Failed to generate template for quiz ${quiz.id}`,
            error,
          );
          // Continue with next quiz even if this one fails
        }
      }
    } catch (error) {
      this.logger.error('Failed in template retry job', error);
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

    // Check if notification job already exists (prevent duplicates)
    try {
      const existingJob = this.schedulerRegistry.getCronJob(jobName);
      if (existingJob) {
        this.logger.log(
          `Notification already scheduled for quiz ${quiz.id}, skipping duplicate`,
        );
        return;
      }
    } catch (error) {
      console.log("Job doesn't exist yet. We are gonna create it", error);
      // Job doesn't exist, which is fine - we'll create it
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
      // Fetch fresh quiz data from database to ensure we have the latest templateCdnUrl
      const freshQuiz = await this.dailyQuizRepository.findOne({
        where: { id: quiz.id },
      });

      if (!freshQuiz) {
        this.logger.error(
          `Quiz ${quiz.id} not found in database during notification`,
        );
        return;
      }

      // Check if template is ready using fresh data
      if (!freshQuiz.templateCdnUrl) {
        this.logger.error(
          `Quiz found but template not ready for ${freshQuiz.id}`,
        );
        return;
      }

      // Check if notification was already sent
      if (freshQuiz.notificationSent) {
        this.logger.log(
          `Notification already sent for quiz ${freshQuiz.id}, skipping`,
        );
        return;
      }

      // Send push notifications to all users
      await this.notificationService.sendDailyQuizNotification(
        freshQuiz.id,
        freshQuiz.dropAtUTC,
      );

      // Mark notification as sent to avoid duplicate sends
      await this.dailyQuizRepository.update(freshQuiz.id, {
        notificationSent: true,
      });

      this.logger.log(
        `🚀 Quiz notification sent successfully for quiz ${freshQuiz.id} at ${freshQuiz.dropAtUTC.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification for quiz ${quiz.id}`,
        error,
      );
    }
  }

  /**
   * Manual trigger for complete daily quiz creation (for testing/admin)
   * If no dropAtUTC provided, generates one with random time for tomorrow
   */
  async triggerDailyQuizCreation(dropAtUTC?: Date): Promise<void> {
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
      `Manually triggering complete quiz creation for ${targetDropTime.toISOString()}`,
    );

    const result = await this.quizCreationService.createCompleteQuiz({
      dropAtUTC: targetDropTime,
      mode: DailyQuizMode.MIX,
      onTemplateReady: (quiz) => this.scheduleNotificationForQuiz(quiz), // Only schedule notification when template is ready
    });

    this.logger.log(
      `Manual complete quiz creation finished for ${result.quiz.id}`,
    );
  }

  /**
   * Manual trigger for template generation (for testing/admin)
   */
  async triggerTemplateGeneration(quizId: string): Promise<void> {
    this.logger.log(
      `Manually triggering template generation for quiz ${quizId}`,
    );

    const quizDetails = await this.quizCreationService.getQuizDetails(quizId);
    await this.quizCreationService.generateTemplate(
      quizDetails.quiz,
      quizDetails.questions,
      (quiz) => this.scheduleNotificationForQuiz(quiz), // Only schedule notification when template is ready
    );

    this.logger.log(`Manual template generation completed for quiz ${quizId}`);
  }

  /**
   * Health check for scheduled jobs
   */
  getJobStatus(): {
    dailyQuizCreation: {
      lastRun: string | null;
      nextRun: string;
      status: string;
    };
    templateRetry: {
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
    tomorrow.setUTCHours(2, 0, 0, 0); // Next daily quiz creation time (2 AM UTC)

    const nextTemplateRetry = new Date(now);
    nextTemplateRetry.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0); // Next 30-minute interval

    return {
      dailyQuizCreation: {
        lastRun: null, // Would track actual last run in production
        nextRun: tomorrow.toISOString(),
        status: 'scheduled',
      },
      templateRetry: {
        lastRun: null, // Would track actual last run in production
        nextRun: nextTemplateRetry.toISOString(),
        status: 'scheduled',
      },
    };
  }
}
