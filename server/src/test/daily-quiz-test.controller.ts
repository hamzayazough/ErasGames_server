import { Controller, Post, Logger, Get } from '@nestjs/common';
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
import { DailyQuizJobProcessor } from '../services/daily-quiz-job-processor.service';

/**
 * 🧪 Daily Quiz Test Controller
 *
 * Centralized test endpoint to simulate the complete daily quiz workflow
 * for React Native testing in real-life scenarios.
 */
@Controller('test/daily-quiz')
export class DailyQuizTestController {
  private readonly logger = new Logger(DailyQuizTestController.name);

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
  ) {}

  /**
   * 🚀 Create Today's and Tomorrow's Quiz
   *
   * This endpoint mimics the daily quiz job crons to:
   * 1. Create today's quiz with drop time in 5 minutes
   * 2. Create tomorrow's quiz with standard drop time
   * 3. Generate and upload CDN templates for both
   * 4. Schedule notifications for both quizzes
   *
   * Perfect for testing the React Native app with real quiz data!
   */
  @Post('create-todays-quiz')
  async createTodaysQuiz() {
    this.logger.log(
      "🚀 Creating today's and tomorrow's quiz for React Native testing...",
    );

    try {
      // Helper function to create a quiz
      const createQuiz = async (
        dropTime: Date,
        dayLabel: string,
        isToday: boolean = false,
      ) => {
        this.logger.log(`📋 Creating ${dayLabel}'s quiz...`);

        // Check if quiz already exists for this day
        const startOfDay = new Date(dropTime);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dropTime);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingQuiz = await this.dailyQuizRepository
          .createQueryBuilder('quiz')
          .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
          .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
          .getOne();

        if (existingQuiz) {
          this.logger.log(
            `⚠️  ${dayLabel}'s quiz already exists, cleaning up first...`,
          );

          // Delete existing quiz questions
          await this.dailyQuizQuestionRepository.delete({
            dailyQuiz: { id: existingQuiz.id },
          });

          // Delete existing quiz
          await this.dailyQuizRepository.delete(existingQuiz.id);

          this.logger.log(`✅ Cleaned up existing ${dayLabel} quiz`);
        }

        // STEP 1: Create the quiz
        const compositionResult = await this.composerService.composeDailyQuiz(
          dropTime,
          DailyQuizMode.MIX,
        );

        const quiz = compositionResult.dailyQuiz;
        const questions = compositionResult.questions;

        this.logger.log(
          `✅ ${dayLabel} quiz created: ${quiz.id} with ${questions.length} questions`,
        );

        // STEP 2: Generate and upload template
        this.logger.log(`🎨 Generating CDN template for ${dayLabel}...`);

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

        this.logger.log(
          `✅ ${dayLabel} template uploaded: ${templateUrl} (v${version})`,
        );

        // STEP 3: Schedule notification
        this.logger.log(`📱 Scheduling push notification for ${dayLabel}...`);

        this.jobProcessor.scheduleNotificationForQuiz(quiz);

        this.logger.log(`✅ ${dayLabel} notification scheduled`);

        return {
          quiz,
          questions,
          templateUrl,
          version,
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
   * 📊 Get current quiz status for testing (today and tomorrow)
   */
  @Get('status')
  async getQuizStatus() {
    const now = new Date();

    // Helper function to get quiz for a specific day
    const getQuizForDay = async (dayOffset: number) => {
      const targetDay = new Date();
      targetDay.setDate(targetDay.getDate() + dayOffset);

      const startOfDay = new Date(targetDay);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDay);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const quiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
        .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
        .getOne();

      if (!quiz) return null;

      const isLive = now >= quiz.dropAtUTC;
      const timeUntilDrop = isLive
        ? 'Quiz is live!'
        : `${Math.ceil((quiz.dropAtUTC.getTime() - now.getTime()) / 1000 / 60)} minutes`;

      const questionsCount = await this.dailyQuizQuestionRepository.count({
        where: { dailyQuiz: { id: quiz.id } },
      });

      return {
        id: quiz.id,
        dropTime: quiz.dropAtUTC.toISOString(),
        isLive,
        timeUntilDrop,
        templateUrl: quiz.templateCdnUrl,
        questionsCount,
        notificationSent: quiz.notificationSent,
      };
    };

    const todaysQuiz = await getQuizForDay(0);
    const tomorrowsQuiz = await getQuizForDay(1);

    if (!todaysQuiz && !tomorrowsQuiz) {
      return {
        hasQuizzes: false,
        message: 'No quizzes scheduled for today or tomorrow',
        action: 'Use POST /test/daily-quiz/create-todays-quiz to create them',
      };
    }

    return {
      hasQuizzes: true,
      today: todaysQuiz
        ? {
            ...todaysQuiz,
            testing: todaysQuiz.isLive
              ? 'Quiz is live! Your React Native app can access it now.'
              : 'Quiz is scheduled. React Native app will get 404 until drop time.',
          }
        : { message: 'No quiz scheduled for today' },
      tomorrow: tomorrowsQuiz
        ? {
            ...tomorrowsQuiz,
            testing: "Tomorrow's quiz is prepared and ready.",
          }
        : { message: 'No quiz scheduled for tomorrow' },
      overall: {
        message: `${todaysQuiz ? 1 : 0} quiz(es) for today, ${tomorrowsQuiz ? 1 : 0} quiz(es) for tomorrow`,
      },
    };
  }

  /**
   * 🚀 Create ONLY Today's Quiz (for immediate testing)
   */
  @Post('create-today-only')
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

  /**
   * 🧹 Clean up today's and tomorrow's quizzes (for testing)
   */
  @Post('cleanup')
  async cleanupTodaysQuiz() {
    this.logger.log("🧹 Cleaning up today's and tomorrow's quizzes...");

    const cleanupResults = [];

    // Helper function to clean up quiz for a specific day
    const cleanupQuizForDay = async (dayOffset: number, dayLabel: string) => {
      const targetDay = new Date();
      targetDay.setDate(targetDay.getDate() + dayOffset);

      const startOfDay = new Date(targetDay);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDay);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const quiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
        .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
        .getOne();

      if (!quiz) {
        this.logger.log(`ℹ️  No ${dayLabel} quiz to clean up`);
        return null;
      }

      // Delete quiz questions
      const deletedQuestions = await this.dailyQuizQuestionRepository.delete({
        dailyQuiz: { id: quiz.id },
      });

      // Delete quiz
      await this.dailyQuizRepository.delete(quiz.id);

      this.logger.log(
        `✅ Cleaned up ${dayLabel} quiz ${quiz.id} and ${deletedQuestions.affected} questions`,
      );

      return {
        day: dayLabel,
        quizId: quiz.id,
        questionsDeleted: deletedQuestions.affected,
      };
    };

    // Clean up both days
    const todayCleanup = await cleanupQuizForDay(0, "today's");
    const tomorrowCleanup = await cleanupQuizForDay(1, "tomorrow's");

    if (todayCleanup) cleanupResults.push(todayCleanup);
    if (tomorrowCleanup) cleanupResults.push(tomorrowCleanup);

    if (cleanupResults.length === 0) {
      return {
        success: true,
        message: 'No quizzes to clean up',
      };
    }

    return {
      success: true,
      message: `Successfully cleaned up ${cleanupResults.length} quiz(es)`,
      cleaned: cleanupResults,
    };
  }
}
