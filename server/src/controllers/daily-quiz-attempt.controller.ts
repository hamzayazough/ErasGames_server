import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { Attempt } from '../database/entities/attempt.entity';
import { AttemptAnswer } from '../database/entities/attempt-answer.entity';

/**
 * Controller for quiz attempt management
 * Handles starting, submitting, and scoring daily quiz attempts
 */
@Controller('daily/attempt')
export class DailyQuizAttemptController {
  private readonly logger = new Logger(DailyQuizAttemptController.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(Attempt)
    private readonly attemptRepository: Repository<Attempt>,
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepository: Repository<AttemptAnswer>,
  ) {}

  /**
   * Start a new quiz attempt
   * Returns the quiz template URL and attempt ID
   */
  @Post('start')
  async startQuizAttempt() {
    try {
      // For testing, return mock data without database operations
      const mockAttemptId = `test-attempt-${Date.now()}`;

      this.logger.log(`Starting mock quiz attempt: ${mockAttemptId}`);

      return {
        success: true,
        attemptId: mockAttemptId,
        quizTemplateUrl: 'https://example.com/mock-quiz-template.json',
        timeLimit: 300, // 5 minutes in seconds
        startedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error starting quiz attempt:', error);
      throw new HttpException(
        'Failed to start quiz attempt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Submit quiz answers and get score
   */
  @Post(':id/submit')
  async submitQuizAttempt(
    @Param('id') attemptId: string,
    @Body()
    body: { answers: Array<{ questionIndex: number; selectedAnswer: string }> },
  ) {
    try {
      this.logger.log(
        `Submitting quiz attempt: ${attemptId} with ${body.answers.length} answers`,
      );

      // For testing, return mock results without database operations
      const correctAnswers = Math.floor(body.answers.length * 0.8);
      const score = Math.round((correctAnswers / body.answers.length) * 100);

      return {
        success: true,
        score,
        totalQuestions: body.answers.length,
        correctAnswers,
        submittedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error submitting quiz attempt:', error);
      throw new HttpException(
        'Failed to submit quiz attempt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get attempt status and time remaining
   */
  @Get(':id/status')
  async getAttemptStatus(@Param('id') attemptId: string) {
    try {
      this.logger.log(`Getting status for attempt: ${attemptId}`);

      // For testing, return mock status based on when the attempt was started
      // Extract timestamp from the attemptId if it's a mock ID
      const timestampMatch = attemptId.match(/test-attempt-(\d+)/);
      const startTime = timestampMatch
        ? parseInt(timestampMatch[1])
        : Date.now() - 60000; // Default to 1 minute ago

      const timeLimit = 300000; // 5 minutes in milliseconds
      const elapsedTime = Date.now() - startTime;
      const timeRemaining = Math.max(0, timeLimit - elapsedTime);

      return {
        attemptId,
        startedAt: new Date(startTime).toISOString(),
        submittedAt: null, // Mock as not submitted yet
        timeRemaining: Math.floor(timeRemaining / 1000), // return in seconds
        isCompleted: false,
        isTimeUp: timeRemaining === 0,
      };
    } catch (error) {
      this.logger.error('Error getting attempt status:', error);
      throw new HttpException(
        'Failed to get attempt status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
