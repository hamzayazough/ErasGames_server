import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { QuestionType, Difficulty } from '../../enums/question.enums';

interface StatResult {
  difficulty?: string;
  questionType?: string;
  count: string;
}

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  /**
   * Get all questions ordered by most recently updated
   */
  async getAllQuestions(): Promise<Question[]> {
    return await this.questionRepository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /**
   * Get questions by approval status
   */
  async getQuestionsByApprovalStatus(approved: boolean): Promise<Question[]> {
    return await this.questionRepository.find({
      where: {
        approved,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /**
   * Get questions by type
   */
  async getQuestionsByType(questionType: string): Promise<Question[]> {
    return await this.questionRepository.find({
      where: {
        questionType: questionType as QuestionType,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /**
   * Get questions by difficulty
   */
  async getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
    return await this.questionRepository.find({
      where: {
        difficulty: difficulty as Difficulty,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /**
   * Get questions with pagination
   */
  async getQuestionsWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    questions: Question[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [questions, total] = await this.questionRepository.findAndCount({
      order: {
        updatedAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      questions,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(id: string): Promise<Question | null> {
    return await this.questionRepository.findOne({
      where: { id },
    });
  }

  /**
   * Update question approval status
   */
  async approveQuestion(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new Error(`Question with ID ${id} not found`);
    }

    question.approved = true;
    return await this.questionRepository.save(question);
  }

  /**
   * Disable a question
   */
  async disableQuestion(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new Error(`Question with ID ${id} not found`);
    }

    question.disabled = true;
    return await this.questionRepository.save(question);
  }

  /**
   * Get question statistics
   */
  async getQuestionStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    disabled: number;
    byDifficulty: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const total = await this.questionRepository.count();
    const approved = await this.questionRepository.count({
      where: { approved: true },
    });
    const pending = await this.questionRepository.count({
      where: { approved: false },
    });
    const disabled = await this.questionRepository.count({
      where: { disabled: true },
    });

    // Get counts by difficulty
    const difficultyStats = await this.questionRepository
      .createQueryBuilder('question')
      .select('question.difficulty', 'difficulty')
      .addSelect('COUNT(*)', 'count')
      .groupBy('question.difficulty')
      .getRawMany();

    const byDifficulty: Record<string, number> = {};
    difficultyStats.forEach((stat: StatResult) => {
      if (stat.difficulty) {
        byDifficulty[stat.difficulty] = parseInt(stat.count);
      }
    });

    // Get counts by type
    const typeStats = await this.questionRepository
      .createQueryBuilder('question')
      .select('question.question_type', 'questionType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('question.question_type')
      .getRawMany();

    const byType: Record<string, number> = {};
    typeStats.forEach((stat: StatResult) => {
      if (stat.questionType) {
        byType[stat.questionType] = parseInt(stat.count);
      }
    });

    return {
      total,
      approved,
      pending,
      disabled,
      byDifficulty,
      byType,
    };
  }
}
