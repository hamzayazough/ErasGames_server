import { Controller, Get, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../database/entities/question.entity';
import { Difficulty } from '../database/enums/question.enums';

@Controller('test/debug-questions')
export class DebugQuestionsController {
  private readonly logger = new Logger(DebugQuestionsController.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  @Get('stats')
  async getQuestionStats() {
    const total = await this.questionRepository.count();
    const approved = await this.questionRepository.count({
      where: { approved: true },
    });
    const enabled = await this.questionRepository.count({
      where: { disabled: false },
    });
    const approvedAndEnabled = await this.questionRepository.count({
      where: { approved: true, disabled: false },
    });

    const easyCount = await this.questionRepository.count({
      where: { approved: true, disabled: false, difficulty: Difficulty.EASY },
    });
    const mediumCount = await this.questionRepository.count({
      where: { approved: true, disabled: false, difficulty: Difficulty.MEDIUM },
    });
    const hardCount = await this.questionRepository.count({
      where: { approved: true, disabled: false, difficulty: Difficulty.HARD },
    });

    return {
      total,
      approved,
      enabled,
      approvedAndEnabled,
      byDifficulty: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    };
  }

  @Get('sample')
  async getSampleQuestions() {
    const questions = await this.questionRepository.find({
      take: 10,
    });

    return questions.map((q) => ({
      id: q.id,
      difficulty: q.difficulty,
      approved: q.approved,
      disabled: q.disabled,
      exposureCount: q.exposureCount,
      lastUsedAt: q.lastUsedAt,
      themes: q.themesJSON,
      subjects: q.subjectsJSON,
    }));
  }
}
