import { Controller, Delete, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';

@Controller('test/debug-questions')
export class DebugQuizCleanupController {
  private readonly logger = new Logger(DebugQuizCleanupController.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
  ) {}

  @Delete('cleanup-old-quizzes')
  async cleanupOldQuizzes() {
    // Delete old quiz questions first
    const deletedQuestions = await this.dailyQuizQuestionRepository
      .createQueryBuilder()
      .delete()
      .where('daily_quiz_id IN (SELECT id FROM daily_quiz WHERE drop_at_utc < :now)', {
        now: new Date(),
      })
      .execute();

    // Delete old quizzes (those that have already dropped)
    const deletedQuizzes = await this.dailyQuizRepository
      .createQueryBuilder()
      .delete()
      .where('drop_at_utc < :now', { now: new Date() })
      .execute();

    this.logger.log(`Cleaned up ${deletedQuizzes.affected} old quizzes and ${deletedQuestions.affected} old quiz questions`);

    return {
      message: `Cleaned up ${deletedQuizzes.affected} old quizzes and ${deletedQuestions.affected} old quiz questions`,
      deletedQuizzes: deletedQuizzes.affected,
      deletedQuestions: deletedQuestions.affected,
    };
  }
}