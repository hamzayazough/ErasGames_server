import {
  Controller,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attempt } from '../database/entities/attempt.entity';
import { AttemptAnswer } from '../database/entities/attempt-answer.entity';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';
import { Question } from '../database/entities/question.entity';
import { User } from '../database/entities/user.entity';
import { Answer } from '../database/entities/answers/answer.interface';

/**
 * Controller for attempt-related endpoints
 */
@Controller('attempts')
export class AttemptsController {
  private readonly logger = new Logger(AttemptsController.name);

  constructor(
    @InjectRepository(Attempt)
    private readonly attemptRepository: Repository<Attempt>,
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepository: Repository<AttemptAnswer>,
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * POST /attempts/start
   * Create a new attempt for the user
   */
  @Post('start')
  async startAttempt(
    @Body()
    request: {
      localDate: string;
      userId?: string; // For now, we'll stub this or get from auth
    },
  ): Promise<{
    attemptId: string;
    serverStartAt: string;
    deadline: string;
    seed: number;
    templateUrl: string;
  }> {
    try {
      // For demo purposes, use a stub user ID
      // In production, this would come from authentication
      const userId = request.userId || 'demo-user-id';

      // Parse local date and find the daily quiz
      const localDate = new Date(request.localDate);

      // Convert to UTC for database query (assuming 12:00 PM Toronto time)
      const dropAtUTC = new Date(localDate);
      dropAtUTC.setUTCHours(17, 0, 0, 0); // 12 PM Toronto = 5 PM UTC (approximate)

      const quiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC },
      });

      if (!quiz) {
        throw new HttpException(
          'No daily quiz available for this date',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if user already has an active attempt for this quiz
      const existingAttempt = await this.attemptRepository.findOne({
        where: {
          user: { id: userId } as User,
          dailyQuiz: { id: quiz.id } as DailyQuiz,
          status: 'active',
        },
      });

      if (existingAttempt) {
        throw new HttpException(
          'You already have an active attempt for this quiz',
          HttpStatus.CONFLICT,
        );
      }

      // Check if we're within the join window
      const now = new Date();
      const joinWindowEnd = new Date(quiz.dropAtUTC);
      joinWindowEnd.setHours(joinWindowEnd.getHours() + 24);

      if (now > joinWindowEnd) {
        throw new HttpException(
          'Join window has ended for this quiz',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Create new attempt
      const serverStartAt = new Date();
      const deadline = new Date(serverStartAt.getTime() + 10 * 60 * 1000); // 10 minutes
      const seed = Math.floor(Math.random() * 1000000);

      const attempt = this.attemptRepository.create({
        user: { id: userId } as User,
        dailyQuiz: quiz,
        startAt: serverStartAt,
        deadline,
        status: 'active',
      });

      const savedAttempt = await this.attemptRepository.save(attempt);

      return {
        attemptId: savedAttempt.id,
        serverStartAt: serverStartAt.toISOString(),
        deadline: deadline.toISOString(),
        seed,
        templateUrl: quiz.templateCdnUrl || '',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to start attempt', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /attempts/:id/answer
   * Submit an answer for a question
   */
  @Post(':id/answer')
  async submitAnswer(
    @Param('id') attemptId: string,
    @Body()
    request: {
      questionId: string;
      answer: Answer;
      idempotencyKey: string;
      timeSpentMs: number;
      shuffleProof?: any;
    },
  ): Promise<{ status: string }> {
    try {
      // Find the attempt
      const attempt = await this.attemptRepository.findOne({
        where: { id: attemptId, status: 'active' },
        relations: ['dailyQuiz'],
      });

      if (!attempt) {
        throw new HttpException(
          'Attempt not found or not active',
          HttpStatus.NOT_FOUND,
        );
      }

      // Check if deadline has passed
      if (new Date() > attempt.deadline) {
        throw new HttpException(
          'Attempt deadline has expired',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Validate that the question belongs to this daily quiz
      const quizQuestion = await this.dailyQuizQuestionRepository.findOne({
        where: {
          dailyQuiz: { id: attempt.dailyQuiz.id },
          question: { id: request.questionId },
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
        where: { idempotencyKey: request.idempotencyKey },
      });

      if (existingAnswer) {
        // Return success for idempotent requests
        return { status: 'ok' };
      }

      // Create or update answer
      let attemptAnswer = await this.attemptAnswerRepository.findOne({
        where: {
          attempt: { id: attemptId },
          questionId: request.questionId,
        },
      });

      if (attemptAnswer) {
        // Update existing answer
        attemptAnswer.answerJSON = request.answer;
        attemptAnswer.idempotencyKey = request.idempotencyKey;
        attemptAnswer.timeSpentMs = request.timeSpentMs;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        attemptAnswer.shuffleProof = request.shuffleProof;
      } else {
        // Create new answer
        attemptAnswer = this.attemptAnswerRepository.create({
          attempt: { id: attemptId } as Attempt,
          questionId: request.questionId,
          answerJSON: request.answer,
          idempotencyKey: request.idempotencyKey,
          timeSpentMs: request.timeSpentMs,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          shuffleProof: request.shuffleProof,
        });
      }

      await this.attemptAnswerRepository.save(attemptAnswer);

      return { status: 'ok' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to submit answer', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /attempts/:id/finish
   * Finish the attempt and compute score
   */
  @Post(':id/finish')
  async finishAttempt(@Param('id') attemptId: string): Promise<{
    score: number;
    breakdown: {
      base: number;
      accuracyBonus: number;
      speedBonus: number;
      earlyBonus: number;
    };
    accPoints: number;
    finishTimeSec: number;
    questions: Array<{
      questionId: string;
      isCorrect: boolean;
      timeSpentMs: number;
      accuracyPoints: number;
    }>;
  }> {
    try {
      // Find the attempt
      const attempt = await this.attemptRepository.findOne({
        where: { id: attemptId },
        relations: ['dailyQuiz'],
      });

      if (!attempt) {
        throw new HttpException('Attempt not found', HttpStatus.NOT_FOUND);
      }

      // Check if already finished (idempotent)
      if (attempt.status === 'finished') {
        return this.getFinishedAttemptResult(attempt);
      }

      // Check if deadline has passed
      const now = new Date();
      if (now > attempt.deadline) {
        throw new HttpException(
          'Attempt deadline has expired',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      // Get all answers for this attempt
      const answers = await this.attemptAnswerRepository.find({
        where: { attempt: { id: attemptId } },
      });

      // Get quiz questions with correct answers
      const quizQuestions = await this.dailyQuizQuestionRepository.find({
        where: { dailyQuiz: { id: attempt.dailyQuiz.id } },
        relations: ['question'],
      });

      // Calculate accuracy points
      let totalAccuracyPoints = 0;
      const questionResults: Array<{
        questionId: string;
        isCorrect: boolean;
        timeSpentMs: number;
        accuracyPoints: number;
      }> = [];

      for (const quizQuestion of quizQuestions) {
        const answer = answers.find(
          (a) => a.questionId === quizQuestion.question.id,
        );
        let isCorrect = false;
        let accuracyPoints = 0;
        let timeSpentMs = 0;

        if (answer) {
          timeSpentMs = answer.timeSpentMs;
          // Simple correctness check - this would be more sophisticated in practice
          isCorrect = this.checkAnswerCorrectness(
            answer.answerJSON,
            quizQuestion.question.correctJSON,
          );

          if (isCorrect) {
            // Base points per question (10 total accuracy points possible)
            accuracyPoints = Math.round((10 / quizQuestions.length) * 10) / 10;
            totalAccuracyPoints += accuracyPoints;
          }

          // Update answer record
          answer.isCorrect = isCorrect;
          answer.accuracyPoints = accuracyPoints;
          await this.attemptAnswerRepository.save(answer);
        }

        questionResults.push({
          questionId: quizQuestion.question.id,
          isCorrect,
          timeSpentMs,
          accuracyPoints,
        });
      }

      // Calculate timing
      const finishTime = now;
      const finishTimeSec = Math.round(
        (finishTime.getTime() - attempt.startAt.getTime()) / 1000,
      );

      // Calculate score using the specified formula
      const base = 100;
      const accuracyBonus = 25 * (totalAccuracyPoints / 10);
      const speedBonus = Math.max(
        0,
        Math.min(25, 25 * (1 - finishTimeSec / 600)),
      ); // clamp 0..25
      const earlyBonus = 0; // Out of scope for MVP

      const score = Math.round(base + accuracyBonus + speedBonus + earlyBonus);

      // Update attempt
      attempt.finishAt = finishTime;
      attempt.accPoints = totalAccuracyPoints;
      attempt.speedSec = finishTimeSec;
      attempt.score = score;
      attempt.status = 'finished';

      await this.attemptRepository.save(attempt);

      return {
        score,
        breakdown: {
          base,
          accuracyBonus: Math.round(accuracyBonus * 100) / 100,
          speedBonus: Math.round(speedBonus * 100) / 100,
          earlyBonus,
        },
        accPoints: totalAccuracyPoints,
        finishTimeSec,
        questions: questionResults,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to finish attempt', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Helper method to get results for already finished attempts (idempotent)
   */
  private async getFinishedAttemptResult(attempt: Attempt) {
    const answers = await this.attemptAnswerRepository.find({
      where: { attempt: { id: attempt.id } },
    });

    const questionResults = answers.map((answer) => ({
      questionId: answer.questionId,
      isCorrect: answer.isCorrect,
      timeSpentMs: answer.timeSpentMs,
      accuracyPoints: answer.accuracyPoints,
    }));

    // Recalculate breakdown from stored values
    const base = 100;
    const accuracyBonus = 25 * (attempt.accPoints / 10);
    const speedBonus = Math.max(
      0,
      Math.min(25, 25 * (1 - attempt.speedSec / 600)),
    );
    const earlyBonus = 0;

    return {
      score: attempt.score,
      breakdown: {
        base,
        accuracyBonus: Math.round(accuracyBonus * 100) / 100,
        speedBonus: Math.round(speedBonus * 100) / 100,
        earlyBonus,
      },
      accPoints: attempt.accPoints,
      finishTimeSec: attempt.speedSec,
      questions: questionResults,
    };
  }

  /**
   * Simple answer correctness check
   * In practice, this would be more sophisticated and handle different question types
   */
  private checkAnswerCorrectness(
    userAnswer: Answer,
    correctAnswer: any,
  ): boolean {
    // This is a simplified implementation
    // Real implementation would check based on question type and answer format
    try {
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } catch {
      return false;
    }
  }
}
