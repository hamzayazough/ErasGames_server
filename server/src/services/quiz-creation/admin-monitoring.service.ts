import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyQuiz } from '../../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';

export interface QuizByDaysQuery {
  days?: string;
}

/**
 * 🔍 Admin Monitoring Service
 *
 * Handles all monitoring and retrieval operations:
 * - Quiz status checking
 * - Quiz retrieval by date
 * - System monitoring
 */
@Injectable()
export class AdminMonitoringService {
  private readonly logger = new Logger(AdminMonitoringService.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
  ) {}

  /**
   * Get quiz for a specific number of days from now
   */
  async getQuizByDaysFromNow(query: QuizByDaysQuery) {
    try {
      const daysNumber = parseInt(query.days || '0');

      if (isNaN(daysNumber) || daysNumber < 0) {
        throw new HttpException(
          'Invalid days parameter. Must be a non-negative integer.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Calculate target date
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysNumber);

      // Set to start of day to search for any quiz on that date
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      this.logger.log(
        `Searching for quiz on ${targetDate.toDateString()} (${daysNumber} days from now)`,
      );

      // Find quiz for the target date
      const quiz = await this.dailyQuizRepository.findOne({
        where: {
          dropAtUTC: Between(startOfDay, endOfDay),
        },
      });

      if (!quiz) {
        const dateLabel =
          daysNumber === 0
            ? 'today'
            : daysNumber === 1
              ? 'tomorrow'
              : `in ${daysNumber} days`;

        return {
          success: false,
          data: null,
          message: `No quiz found for ${dateLabel} (${targetDate.toDateString()})`,
        };
      }

      // Get question count by querying the daily_quiz_question table
      const questionCount = await this.dailyQuizRepository.manager
        .query(
          'SELECT COUNT(*) as count FROM daily_quiz_question WHERE daily_quiz_id = $1',
          [quiz.id],
        )
        .then((result) => parseInt(result[0]?.count || '0'));

      return {
        success: true,
        data: {
          id: quiz.id,
          dropAtUTC: quiz.dropAtUTC.toISOString(),
          mode: quiz.mode,
          themePlan: quiz.themePlanJSON,
          questionCount: questionCount,
          templateCdnUrl: quiz.templateCdnUrl,
          templateVersion: quiz.templateVersion,
          notificationSent: quiz.notificationSent,
          createdAt: quiz.createdAt.toISOString(),
          isReady: !!quiz.templateCdnUrl,
          status: quiz.templateCdnUrl ? 'ready' : 'pending_template',
        },
        message: `Quiz found for ${targetDate.toDateString()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get quiz by days: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to retrieve quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 📊 Get current quiz status for testing (today and tomorrow)
   */
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
        action: 'Use POST /admin/daily-quiz/create-todays-quiz to create them',
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
   * 🧹 Clean up today's and tomorrow's quizzes (for testing)
   */
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
