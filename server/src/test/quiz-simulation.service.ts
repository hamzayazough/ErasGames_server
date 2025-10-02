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
import { NotificationService } from '../services/notification.service';

/**
 * 🧪 QUIZ SIMULATION SERVICE - 10 MINUTE WORKFLOW TEST
 *
 * Simulates the complete daily quiz workflow in 10 minutes:
 * - T+1m:  Create quiz for T+10m drop time
 * - T+6m:  Generate template and upload to CDN
 * - T+10m: Send push notifications to all users
 *
 * Perfect for testing the end-to-end daily quiz experience!
 */
@Injectable()
export class QuizSimulationService {
  private readonly logger = new Logger(QuizSimulationService.name);
  private simulationStartTime: Date | null = null;
  private targetDropTime: Date | null = null;

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly composerService: DailyQuizComposerService,
    private readonly templateService: TemplateService,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.log(
      '🧪 QuizSimulationService initialized - Ready for 10-minute test!',
    );
  }

  /**
   * 📅 Quiz Composition Job for Testing
   * Creates a quiz that will drop in 7 minutes
   */
  @Cron('*/10 * * * * *', {
    // Every 10 seconds to check for new simulation
    name: 'simulation:composition',
    timeZone: 'UTC',
  })
  async runSimulationComposition(): Promise<void> {
    // Only run if simulation is active and we haven't created the quiz yet
    if (!this.simulationStartTime || !this.targetDropTime) {
      return;
    }

    this.logger.log('🎯 [T+0s] Starting simulation quiz composition...');

    try {
      // Check if quiz already exists for this drop time
      const existingQuiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC: this.targetDropTime },
      });

      if (existingQuiz) {
        this.logger.log(
          `✅ Quiz already exists for ${this.targetDropTime.toISOString()}: ${existingQuiz.id}`,
        );
        return;
      }

      // Compose daily quiz for the target drop time
      const result = await this.composerService.composeDailyQuiz(
        this.targetDropTime,
        DailyQuizMode.MIX,
      );

      this.logger.log('🎉 QUIZ COMPOSITION COMPLETE!');
      this.logger.log(`   📋 Quiz ID: ${result.dailyQuiz.id}`);
      this.logger.log(`   📊 Questions: ${result.questions.length}`);
      this.logger.log(`   ⏰ Drop Time: ${this.targetDropTime.toISOString()}`);
      this.logger.log(`   ⏭️  Next: Template generation in 2 minutes`);
    } catch (error) {
      this.logger.error('❌ Quiz composition failed!', error);
    }
  }

  /**
   * 🎨 Template Warmup Job for Testing
   * Generates template and uploads to CDN at T+2m
   */
  @Cron('*/15 * * * * *', {
    // Every 15 seconds to check for template generation
    name: 'simulation:template',
    timeZone: 'UTC',
  })
  async runSimulationTemplate(): Promise<void> {
    if (!this.targetDropTime || !this.simulationStartTime) {
      return; // No simulation running
    }

    const now = new Date();
    const timeSinceStart = now.getTime() - this.simulationStartTime.getTime();

    // Only generate template after 2 minutes have passed
    if (timeSinceStart < 2 * 60 * 1000) {
      return; // Wait for 2 minutes
    }

    this.logger.log('🎨 [T+2m] Starting simulation template generation...');

    try {
      // Find the quiz for our target drop time
      const quiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC: this.targetDropTime },
      });

      if (!quiz) {
        this.logger.warn(
          `⚠️  No quiz found for ${this.targetDropTime.toISOString()}`,
        );
        return;
      }

      // Check if template is already uploaded
      if (quiz.templateCdnUrl) {
        this.logger.log(`✅ Template already uploaded: ${quiz.templateCdnUrl}`);
        return;
      }

      // Get quiz questions
      const quizQuestions = await this.dailyQuizQuestionRepository.find({
        where: { dailyQuiz: { id: quiz.id } },
        relations: ['question'],
      });

      if (quizQuestions.length === 0) {
        this.logger.error(`❌ No questions found for quiz ${quiz.id}`);
        return;
      }

      const questions = quizQuestions.map((qq) => qq.question);

      // Build and upload template
      const { templateUrl, version } =
        await this.templateService.buildAndUploadTemplate(
          quiz,
          questions,
          quiz.themePlanJSON as any,
        );

      // Update the quiz record with CDN URL
      await this.dailyQuizRepository.update(quiz.id, {
        templateCdnUrl: templateUrl,
      });

      this.logger.log('🎉 TEMPLATE GENERATION COMPLETE!');
      this.logger.log(`   📋 Quiz ID: ${quiz.id}`);
      this.logger.log(`   🌐 CDN URL: ${templateUrl}`);
      this.logger.log(`   📦 Version: v${version}`);
      this.logger.log(`   ⏭️  Next: User notifications at T+7m (drop time)`);
    } catch (error) {
      this.logger.error('❌ Template generation failed!', error);
    }
  }

  /**
   * 📱 Notification Job for Testing
   * Sends push notifications to all users at exact drop time
   */
  @Cron('*/10 * * * * *', {
    // Every 10 seconds to check for notification time
    name: 'simulation:notification',
    timeZone: 'UTC',
  })
  async runSimulationNotification(): Promise<void> {
    if (!this.targetDropTime || !this.simulationStartTime) {
      return; // No simulation running
    }

    const now = new Date();
    const timeSinceStart = now.getTime() - this.simulationStartTime.getTime();

    // Only send notification if we're at or past the target drop time
    if (now < this.targetDropTime) {
      return; // Not time yet
    }

    this.logger.log('📱 [T+7m] Starting simulation user notifications...');

    try {
      // Find the quiz for our target drop time
      const quiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC: this.targetDropTime },
      });

      if (!quiz) {
        this.logger.warn(
          `⚠️  No quiz found for ${this.targetDropTime.toISOString()}`,
        );
        return;
      }

      if (!quiz.templateCdnUrl) {
        this.logger.warn(`⚠️  Template not ready for quiz ${quiz.id}`);
        return;
      }

      // Check if notification was already sent
      if (quiz.notificationSent) {
        return; // Already sent
      }

      // Send push notifications to all users
      await this.notificationService.sendDailyQuizNotification(
        quiz.id,
        this.targetDropTime,
      );

      // Mark notification as sent
      await this.dailyQuizRepository.update(quiz.id, {
        notificationSent: true,
      });

      this.logger.log('🎉 SIMULATION COMPLETE! 🎉');
      this.logger.log(
        `   ⏰ Total Duration: ${Math.round(timeSinceStart / 1000)}s (7 minutes)`,
      );
      this.logger.log(`   📋 Quiz ID: ${quiz.id}`);
      this.logger.log(`   🌐 Template: ${quiz.templateCdnUrl}`);
      this.logger.log(`   📱 Notifications: Sent to all users`);
      this.logger.log(`   ✅ End-to-end workflow successful!`);
      this.logger.log(
        `   🎮 Quiz is now LIVE! Frontend should show START button.`,
      );

      // Keep simulation active so frontend can test the quiz experience
      // Reset for next simulation after additional delay
      setTimeout(
        () => {
          this.simulationStartTime = null;
          this.targetDropTime = null;
          this.logger.log('🔄 Simulation reset - ready for next test');
        },
        5 * 60 * 1000,
      ); // Reset after 5 more minutes
    } catch (error) {
      this.logger.error('❌ Notification sending failed!', error);
    }
  }

  /**
   * 🎮 Manual simulation trigger (for immediate testing)
   */
  startSimulation(): {
    simulationId: string;
    startTime: string;
    dropTime: string;
    status: string;
    timelineMinutes: { [key: string]: string };
  } {
    const now = new Date();
    this.simulationStartTime = now;
    this.targetDropTime = new Date(now.getTime() + 7 * 60 * 1000); // 7 minutes from now

    const simulationId = `sim_${Date.now()}`;

    this.logger.log('🚀 MANUAL SIMULATION TRIGGERED!');
    this.logger.log(`   🆔 Simulation ID: ${simulationId}`);
    this.logger.log(
      `   ⏰ Start Time: ${this.simulationStartTime.toISOString()}`,
    );
    this.logger.log(`   🎯 Drop Time: ${this.targetDropTime.toISOString()}`);
    this.logger.log(`   ⏱️  Timeline: 7-minute countdown test`);

    return {
      simulationId,
      startTime: this.simulationStartTime.toISOString(),
      dropTime: this.targetDropTime.toISOString(),
      status: 'started',
      timelineMinutes: {
        'T+0m': 'Quiz creation & questions composition',
        'T+2m': 'Template generation & CDN upload',
        'T+7m': 'Push notifications sent & quiz goes LIVE',
        'After drop': 'Frontend should show START button for 1 hour',
      },
    };
  }

  /**
   * 📊 Get current simulation status
   */
  getSimulationStatus(): {
    isRunning: boolean;
    startTime: string | null;
    dropTime: string | null;
    timeRemaining: number | null;
    currentPhase: string;
  } {
    if (!this.simulationStartTime || !this.targetDropTime) {
      return {
        isRunning: false,
        startTime: null,
        dropTime: null,
        timeRemaining: null,
        currentPhase: 'idle',
      };
    }

    const now = new Date();
    const timeRemaining = this.targetDropTime.getTime() - now.getTime();

    let currentPhase = 'unknown';
    const timeSinceStart = now.getTime() - this.simulationStartTime.getTime();

    if (timeSinceStart < 2 * 60 * 1000) {
      currentPhase = 'composition'; // 0-2 minutes: Creating quiz
    } else if (timeRemaining > 0) {
      currentPhase = 'template_generation'; // 2-7 minutes: Building template
    } else {
      currentPhase = 'quiz_live'; // 7+ minutes: Quiz is live
    }

    return {
      isRunning: true,
      startTime: this.simulationStartTime.toISOString(),
      dropTime: this.targetDropTime.toISOString(),
      timeRemaining: Math.max(0, Math.round(timeRemaining / 1000)),
      currentPhase,
    };
  }

  /**
   * 🛑 Stop current simulation
   */
  stopSimulation(): { status: string; message: string } {
    if (!this.simulationStartTime) {
      return {
        status: 'not_running',
        message: 'No simulation currently running',
      };
    }

    this.logger.log('🛑 Simulation stopped manually');
    this.simulationStartTime = null;
    this.targetDropTime = null;

    return {
      status: 'stopped',
      message: 'Simulation stopped successfully',
    };
  }
}
