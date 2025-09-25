import { Controller, Post, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../database/entities/question.entity';

@Controller('test/debug-questions')
export class DebugQuestionsResetController {
  private readonly logger = new Logger(DebugQuestionsResetController.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  @Post('reset-usage')
  async resetQuestionUsage() {
    const result = await this.questionRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        exposureCount: 0,
        lastUsedAt: null,
      })
      .execute();

    this.logger.log(`Reset usage data for ${result.affected} questions`);

    return {
      message: `Reset usage data for ${result.affected} questions`,
      affected: result.affected,
    };
  }
}