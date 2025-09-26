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
   * 🚀 Create Today's Quiz (Launches in 5 minutes)
   *
   * This endpoint mimics the daily quiz job crons to:
   * 1. Create today's quiz with drop time in 5 minutes
   * 2. Generate and upload CDN template immediately
   * 3. Schedule notification for the drop time
   *
   * Perfect for testing the React Native app with real quiz data!
   */
  @Post('create-todays-quiz')
  async createTodaysQuiz() {
    this.logger.log("🚀 Creating today's quiz for React Native testing...");

    try {
      // Calculate drop time (5 minutes from now)
      const dropTime = new Date();
      dropTime.setMinutes(dropTime.getMinutes() + 5);
      dropTime.setSeconds(0, 0); // Clean up seconds/milliseconds

      this.logger.log(`⏰ Quiz will drop at: ${dropTime.toISOString()}`);

      // Check if quiz already exists for today
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existingQuiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
        .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
        .getOne();

      if (existingQuiz) {
        this.logger.log(
          "⚠️  Today's quiz already exists, cleaning up first...",
        );

        // Delete existing quiz questions
        await this.dailyQuizQuestionRepository.delete({
          dailyQuiz: { id: existingQuiz.id },
        });

        // Delete existing quiz
        await this.dailyQuizRepository.delete(existingQuiz.id);

        this.logger.log('✅ Cleaned up existing quiz');
      }

      // STEP 1: Create the quiz (mimics daily composition job)
      this.logger.log('📋 Step 1: Creating quiz with questions...');

      const compositionResult = await this.composerService.composeDailyQuiz(
        dropTime,
        DailyQuizMode.MIX,
      );

      const quiz = compositionResult.dailyQuiz;
      const questions = compositionResult.questions;

      this.logger.log(
        `✅ Quiz created: ${quiz.id} with ${questions.length} questions`,
      );

      // STEP 2: Generate and upload template (mimics template warmup job)
      this.logger.log('🎨 Step 2: Generating CDN template...');

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

      // STEP 3: Schedule notification (mimics notification scheduling)
      this.logger.log('📱 Step 3: Scheduling push notification...');

      this.jobProcessor.scheduleNotificationForQuiz(quiz);

      this.logger.log('✅ Notification scheduled for drop time');

      // Success response
      const response = {
        success: true,
        message: "Today's quiz created successfully! 🎉",
        quiz: {
          id: quiz.id,
          dropTime: dropTime.toISOString(),
          templateUrl: templateUrl,
          questionsCount: questions.length,
          timeUntilDrop: '5 minutes',
        },
        workflow: {
          step1: '✅ Quiz composition complete',
          step2: '✅ CDN template generated and uploaded',
          step3: '✅ Push notification scheduled',
        },
        testing: {
          message: 'Your React Native app can now fetch the quiz!',
          endpoints: {
            'GET /daily':
              'Check if quiz is available (returns 404 until drop time)',
            'GET /daily/next': 'Get next quiz drop time',
            'POST /daily/attempt/start':
              'Start quiz attempt (available after drop)',
          },
        },
      };

      this.logger.log("🎉 TODAY'S QUIZ SETUP COMPLETE!");
      this.logger.log(`   📋 Quiz ID: ${quiz.id}`);
      this.logger.log(`   ⏰ Drops in: 5 minutes (${dropTime.toISOString()})`);
      this.logger.log(`   🌐 Template: ${templateUrl}`);
      this.logger.log(`   📱 React Native app ready for testing!`);

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
   * 📊 Get current quiz status for testing
   */
  @Get('status')
  async getQuizStatus() {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const todaysQuiz = await this.dailyQuizRepository
      .createQueryBuilder('quiz')
      .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
      .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
      .getOne();

    if (!todaysQuiz) {
      return {
        hasQuiz: false,
        message: 'No quiz scheduled for today',
        action: 'Use POST /test/daily-quiz/create-todays-quiz to create one',
      };
    }

    const now = new Date();
    const isLive = now >= todaysQuiz.dropAtUTC;
    const timeUntilDrop = isLive
      ? 'Quiz is live!'
      : `${Math.ceil((todaysQuiz.dropAtUTC.getTime() - now.getTime()) / 1000 / 60)} minutes`;

    const questionsCount = await this.dailyQuizQuestionRepository.count({
      where: { dailyQuiz: { id: todaysQuiz.id } },
    });

    return {
      hasQuiz: true,
      quiz: {
        id: todaysQuiz.id,
        dropTime: todaysQuiz.dropAtUTC.toISOString(),
        isLive,
        timeUntilDrop,
        templateUrl: todaysQuiz.templateCdnUrl,
        questionsCount,
        notificationSent: todaysQuiz.notificationSent,
      },
      testing: {
        message: isLive
          ? 'Quiz is live! Your React Native app can access it now.'
          : 'Quiz is scheduled. React Native app will get 404 until drop time.',
      },
    };
  }

  /**
   * 🧹 Clean up today's quiz (for testing)
   */
  @Post('cleanup')
  async cleanupTodaysQuiz() {
    this.logger.log("🧹 Cleaning up today's quiz...");

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const todaysQuiz = await this.dailyQuizRepository
      .createQueryBuilder('quiz')
      .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
      .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
      .getOne();

    if (!todaysQuiz) {
      return {
        success: true,
        message: 'No quiz to clean up',
      };
    }

    // Delete quiz questions
    const deletedQuestions = await this.dailyQuizQuestionRepository.delete({
      dailyQuiz: { id: todaysQuiz.id },
    });

    // Delete quiz
    await this.dailyQuizRepository.delete(todaysQuiz.id);

    this.logger.log(
      `✅ Cleaned up quiz ${todaysQuiz.id} and ${deletedQuestions.affected} questions`,
    );

    return {
      success: true,
      message: "Today's quiz cleaned up successfully",
      cleaned: {
        quizId: todaysQuiz.id,
        questionsDeleted: deletedQuestions.affected,
      },
    };
  }
}
