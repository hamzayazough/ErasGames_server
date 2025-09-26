import { Controller, Post, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizMode } from '../database/enums/daily-quiz-mode.enum';

@Controller('test/daily-quiz')
export class TestDailyQuizController {
  private readonly logger = new Logger(TestDailyQuizController.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
  ) {}

  @Post('create-test')
  async createTestQuiz() {
    try {
      // Delete any existing test quizzes
      await this.dailyQuizRepository.delete({});

      // Create a new test daily quiz
      const testQuiz = this.dailyQuizRepository.create({
        dropAtUTC: new Date(),
        mode: DailyQuizMode.MIX,
        themePlanJSON: { themes: ['test'], weights: { test: 1 } },
        templateVersion: 1,
        templateCdnUrl: 'https://example.com/test-quiz.json',
        notificationSent: false,
      });

      const savedQuiz = await this.dailyQuizRepository.save(testQuiz);

      this.logger.log(`Created test daily quiz: ${savedQuiz.id}`);

      return {
        success: true,
        message: 'Test daily quiz created',
        quiz: {
          id: savedQuiz.id,
          dropTime: savedQuiz.dropAtUTC.toISOString(),
          templateUrl: savedQuiz.templateCdnUrl,
        },
      };
    } catch (error) {
      this.logger.error('Error creating test quiz:', error);
      throw error;
    }
  }
}
