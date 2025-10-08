import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Answer } from '../database/entities/answers/answer.interface';
import {
  AttemptService,
  AttemptAnswerService,
  UserService,
  ScoreCalculationResultWithRanking,
} from '../services/attempt';
import type { FirebaseUser } from '../services/attempt';

// Extended Request interface with Firebase user
interface AuthenticatedRequest extends Request {
  firebaseUser?: FirebaseUser;
}

/**
 * Controller for attempt-related endpoints
 */
@Controller('attempts')
export class AttemptsController {
  private readonly logger = new Logger(AttemptsController.name);

  constructor(
    private readonly attemptService: AttemptService,
    private readonly attemptAnswerService: AttemptAnswerService,
    private readonly userService: UserService,
  ) {}

  /**
   * GET /attempts/today
   * Get user's attempt status for today's quiz
   */
  @Get('today')
  async getTodayAttempt(@Req() req: AuthenticatedRequest): Promise<{
    hasAttempt: boolean;
    attempt?: {
      id: string;
      status: 'active' | 'finished';
      startedAt: string;
      finishedAt?: string;
      score?: number;
    };
  }> {
    try {
      // Get Firebase user from middleware and validate user
      if (!req.firebaseUser) {
        throw new HttpException(
          'Authentication required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findOrCreateUser(req.firebaseUser);

      return await this.attemptService.getTodayAttempt(user.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('Failed to get today attempt', error);
      throw new HttpException(
        'Failed to get attempt status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /attempts/start
   * Create a new attempt for the user
   */
  @Post('start')
  async startAttempt(
    @Body()
    request: {
      localDate: string;
    },
    @Req() req: AuthenticatedRequest,
  ): Promise<{
    attemptId: string;
    serverStartAt: string;
    deadline: string;
    seed: number;
    templateUrl: string;
  }> {
    try {
      // Get Firebase user from middleware and validate user
      if (!req.firebaseUser) {
        throw new HttpException(
          'Authentication required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findOrCreateUser(req.firebaseUser);

      return await this.attemptService.startAttempt(user.id, request.localDate);
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
   * POST /attempts/:id/finish
   * Submit all answers and finish the attempt with score calculation
   */
  @Post(':id/finish')
  async finishAttempt(
    @Param('id') attemptId: string,
    @Req() req: AuthenticatedRequest,
    @Body()
    request?: {
      answers?: Array<{
        questionId: string;
        answer: Answer;
      }>;
    },
  ): Promise<ScoreCalculationResultWithRanking> {
    try {
      // Get Firebase user from middleware and validate user
      if (!req.firebaseUser) {
        throw new HttpException(
          'Authentication required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findOrCreateUser(req.firebaseUser);

      return await this.attemptService.finishAttempt(
        attemptId,
        user.id,
        request?.answers,
      );
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
}
