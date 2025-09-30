import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attempt } from '../../database/entities/attempt.entity';
import { AttemptAnswer } from '../../database/entities/attempt-answer.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Answer } from '../../database/entities/answers/answer.interface';

@Injectable()
export class AttemptAnswerService {
  private readonly logger = new Logger(AttemptAnswerService.name);

  constructor(
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepository: Repository<AttemptAnswer>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
  ) {}

  /**
   * Submit an answer for a question
   */
  async submitAnswer(
    attemptId: string,
    quizId: string,
    questionId: string,
    answer: Answer,
    idempotencyKey: string,
    timeSpentMs: number,
    shuffleProof?: any,
  ): Promise<{ status: string }> {
    // Validate that the question belongs to this daily quiz
    const quizQuestion = await this.dailyQuizQuestionRepository.findOne({
      where: {
        dailyQuiz: { id: quizId },
        question: { id: questionId },
      },
      relations: ['question'],
    });

    if (!quizQuestion) {
      throw new HttpException(
        'Question not found in this quiz',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check for existing answer with same idempotency key
    const existingAnswer = await this.attemptAnswerRepository.findOne({
      where: { idempotencyKey },
    });

    if (existingAnswer) {
      // Return success for idempotent requests
      return { status: 'ok' };
    }

    // Create or update answer
    let attemptAnswer = await this.attemptAnswerRepository.findOne({
      where: {
        attempt: { id: attemptId },
        questionId,
      },
    });

    if (attemptAnswer) {
      // Update existing answer
      attemptAnswer.answerJSON = answer;
      attemptAnswer.idempotencyKey = idempotencyKey;
      attemptAnswer.timeSpentMs = timeSpentMs;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      attemptAnswer.shuffleProof = shuffleProof;
    } else {
      // Create new answer
      attemptAnswer = this.attemptAnswerRepository.create({
        attempt: { id: attemptId } as Attempt,
        questionId,
        answerJSON: answer,
        idempotencyKey,
        timeSpentMs,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        shuffleProof,
      });
    }

    await this.attemptAnswerRepository.save(attemptAnswer);

    return { status: 'ok' };
  }
}