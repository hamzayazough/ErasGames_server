import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Question } from '../../database/entities/question.entity';
import { DailyQuizJobProcessor } from '../daily-quiz-job-processor.service';
import { QuizCreationService } from './quiz-creation.service';
import {
  DailyQuizComposerService,
  TemplateService,
  DailyQuizMode,
} from '../../database/services/daily-quiz-composer';

/**
 * 🧪 Admin Testing Service
 *
 * Handles all testing-related operations for React Native development:
 * - Creating test quizzes with immediate availability
 * - Managing test data lifecycle
 * - Simulating production workflows
 */
@Injectable()
export class AdminTestingService {
  private readonly logger = new Logger(AdminTestingService.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly composerService: DailyQuizComposerService,
    private readonly templateService: TemplateService,
    private readonly jobProcessor: DailyQuizJobProcessor,
    private readonly quizCreationService: QuizCreationService,
  ) {}

  /**
   * 🚀 Create Today's and Tomorrow's Quiz for Testing
   *
   * This method mimics the daily quiz job crons to:
   * 1. Create today's quiz with drop time in 5 minutes
   * 2. Create tomorrow's quiz with standard drop time
   * 3. Generate and upload CDN templates for both
   * 4. Schedule notifications for both quizzes
   *
   * Perfect for testing the React Native app with real quiz data!
   */
  async createTodaysQuiz() {
    this.logger.log(
      "🚀 Creating today's and tomorrow's quiz for React Native testing...",
    );

    try {
      // Helper function to create a quiz using the new service
      const createQuiz = async (
        dropTime: Date,
        dayLabel: string,
        isToday: boolean = false,
      ) => {
        this.logger.log(`📋 Creating ${dayLabel}'s quiz...`);

        // Create complete quiz with cleanup using the new service
        const result = await this.quizCreationService.createCompleteQuiz({
          dropAtUTC: dropTime,
          mode: DailyQuizMode.MIX,
          replaceExisting: true, // Always replace existing for testing
          onTemplateReady: (quiz) => {
            this.logger.log(
              `📱 Scheduling push notification for ${dayLabel}...`,
            );
            this.jobProcessor.scheduleNotificationForQuiz(quiz);
            this.logger.log(`✅ ${dayLabel} notification scheduled`);
          },
        });

        this.logger.log(
          `✅ ${dayLabel} quiz created: ${result.quiz.id} with ${result.questions.length} questions`,
        );
        this.logger.log(
          `✅ ${dayLabel} template uploaded: ${result.templateUrl} (v${result.templateVersion})`,
        );

        return {
          quiz: result.quiz,
          questions: result.questions,
          templateUrl: result.templateUrl,
          version: result.templateVersion,
          dropTime,
          timeUntilDrop: isToday
            ? 'AVAILABLE IN 3 MINUTES'
            : 'tomorrow at usual time',
        };
      };

      // Calculate drop times - Set to 3 minutes from now
      const todayDropTime = new Date();
      todayDropTime.setMinutes(todayDropTime.getMinutes() + 3); // 3 minutes from now

      this.logger.log(`🕐 Current time: ${new Date().toISOString()}`);
      this.logger.log(
        `🕒 Setting today's drop time to: ${todayDropTime.toISOString()} (IN 3 MINUTES)`,
      );

      const tomorrowDropTime = new Date();
      tomorrowDropTime.setDate(tomorrowDropTime.getDate() + 1);
      tomorrowDropTime.setHours(16, 0, 0, 0); // Set to 4 PM tomorrow (next calendar day)

      this.logger.log(
        `⏰ Today's quiz will drop at: ${todayDropTime.toISOString()}`,
      );
      this.logger.log(
        `⏰ Tomorrow's quiz will drop at: ${tomorrowDropTime.toISOString()}`,
      );

      // Create both quizzes
      const todayResult = await createQuiz(todayDropTime, 'Today', true);
      const tomorrowResult = await createQuiz(
        tomorrowDropTime,
        'Tomorrow',
        false,
      );

      // Success response
      const response = {
        success: true,
        message: "Today's and tomorrow's quizzes created successfully! 🎉",
        today: {
          id: todayResult.quiz.id,
          dropTime: todayResult.dropTime.toISOString(),
          templateUrl: todayResult.templateUrl,
          questionsCount: todayResult.questions.length,
          timeUntilDrop: todayResult.timeUntilDrop,
        },
        tomorrow: {
          id: tomorrowResult.quiz.id,
          dropTime: tomorrowResult.dropTime.toISOString(),
          templateUrl: tomorrowResult.templateUrl,
          questionsCount: tomorrowResult.questions.length,
          timeUntilDrop: tomorrowResult.timeUntilDrop,
        },
        workflow: {
          step1: '✅ Both quiz compositions complete',
          step2: '✅ Both CDN templates generated and uploaded',
          step3: '✅ Both push notifications scheduled',
        },
        testing: {
          message: 'Your React Native app can now fetch both quizzes!',
          endpoints: {
            'GET /daily':
              'Check if quiz is available (returns 404 until drop time)',
            'GET /daily/next': 'Get next quiz drop time',
            'POST /daily/attempt/start':
              'Start quiz attempt (available after drop)',
          },
        },
      };

      this.logger.log("🎉 TODAY'S AND TOMORROW'S QUIZ SETUP COMPLETE!");
      this.logger.log("   📋 TODAY'S QUIZ:");
      this.logger.log(`     ID: ${todayResult.quiz.id}`);
      this.logger.log(
        `     Available NOW (${todayResult.dropTime.toISOString()})`,
      );
      this.logger.log(`     Template: ${todayResult.templateUrl}`);
      this.logger.log("   📋 TOMORROW'S QUIZ:");
      this.logger.log(`     ID: ${tomorrowResult.quiz.id}`);
      this.logger.log(
        `     Drops at: ${tomorrowResult.dropTime.toISOString()}`,
      );
      this.logger.log(`     Template: ${tomorrowResult.templateUrl}`);
      this.logger.log(`   📱 React Native app ready for testing both quizzes!`);

      return response;
    } catch (error) {
      this.logger.error(
        "❌ Failed to create today's and tomorrow's quiz:",
        error,
      );

      return {
        success: false,
        message: "Failed to create today's and tomorrow's quiz",
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 🚀 Create ONLY Today's Quiz (for immediate testing)
   */
  async createTodayOnly() {
    this.logger.log("🚀 Creating ONLY today's quiz for immediate testing...");

    try {
      // Calculate drop time - Set to NOW for immediate availability
      const todayDropTime = new Date();
      todayDropTime.setSeconds(todayDropTime.getSeconds() - 30); // 30 seconds ago to ensure it's immediately available

      this.logger.log(`🕐 Current time: ${new Date().toISOString()}`);
      this.logger.log(
        `🕒 Setting today's drop time to: ${todayDropTime.toISOString()} (IMMEDIATELY AVAILABLE)`,
      );

      // Check if quiz already exists for this time range
      const startOfHour = new Date(todayDropTime);
      startOfHour.setMinutes(0, 0, 0);
      const endOfHour = new Date(todayDropTime);
      endOfHour.setMinutes(59, 59, 999);

      const existingQuiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfHour', { startOfHour })
        .andWhere('quiz.dropAtUTC <= :endOfHour', { endOfHour })
        .getOne();

      if (existingQuiz) {
        this.logger.log(
          `⚠️ Quiz already exists for this hour, cleaning up first...`,
        );
        await this.dailyQuizQuestionRepository.delete({
          dailyQuiz: { id: existingQuiz.id },
        });
        await this.dailyQuizRepository.delete(existingQuiz.id);
        this.logger.log(`✅ Cleaned up existing quiz`);
      }

      // Create the quiz
      const compositionResult = await this.composerService.composeDailyQuiz(
        todayDropTime,
        DailyQuizMode.MIX,
      );

      const quiz = compositionResult.dailyQuiz;
      const questions = compositionResult.questions;

      this.logger.log(
        `✅ Today's quiz created: ${quiz.id} with ${questions.length} questions`,
      );

      // Generate and upload template
      const { templateUrl, version } =
        await this.templateService.buildAndUploadTemplate(
          quiz,
          questions,
          quiz.themePlanJSON as any,
        );

      // Update quiz with CDN URL
      await this.dailyQuizRepository.update(quiz.id, {
        templateCdnUrl: templateUrl,
      });

      this.logger.log(`✅ Template uploaded: ${templateUrl} (v${version})`);

      // Schedule notification
      this.jobProcessor.scheduleNotificationForQuiz(quiz);
      this.logger.log(`✅ Notification scheduled`);

      const response = {
        success: true,
        message: "Today's quiz created and IMMEDIATELY AVAILABLE! 🎉",
        quiz: {
          id: quiz.id,
          dropTime: todayDropTime.toISOString(),
          templateUrl: templateUrl,
          questionsCount: questions.length,
          status: 'LIVE NOW! Your React Native app can access it immediately.',
        },
        testing: {
          message: 'Quiz is live! Start testing now!',
          endpoints: {
            'GET /daily': 'Should return the quiz data',
            'POST /daily/attempt/start': 'Start quiz attempt',
          },
        },
      };

      this.logger.log("🎉 TODAY'S QUIZ SETUP COMPLETE AND LIVE!");
      this.logger.log(`   📋 Quiz ID: ${quiz.id}`);
      this.logger.log(`   🟢 Status: LIVE NOW`);
      this.logger.log(`   📱 Template: ${templateUrl}`);

      return response;
    } catch (error) {
      this.logger.error("❌ Failed to create today's quiz:", error);
      return {
        success: false,
        message: "Failed to create today's quiz",
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
