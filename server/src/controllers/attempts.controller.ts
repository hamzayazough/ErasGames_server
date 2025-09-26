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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Attempt } from '../database/entities/attempt.entity';

// Extended Request interface with Firebase user
interface AuthenticatedRequest extends Request {
  firebaseUser?: {
    uid: string;
    email?: string;
    name?: string;
  };
}
import { AttemptAnswer } from '../database/entities/attempt-answer.entity';
import { DailyQuiz } from '../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../database/entities/daily-quiz-question.entity';
import { Question } from '../database/entities/question.entity';
import { User } from '../database/entities/user.entity';
import { Answer } from '../database/entities/answers/answer.interface';
import { AuthProvider } from '../database/enums/user.enums';

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
      // Get Firebase user from middleware
      const firebaseUser = req.firebaseUser;
      if (!firebaseUser) {
        throw new HttpException(
          'Authentication required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userId = firebaseUser.uid;
      this.logger.log(`Getting today's attempt for user: ${userId}`);

      // Parse local date and find the daily quiz for that date
      const today = new Date();
      const localDate = new Date(today.toISOString().split('T')[0]); // Use today's date
      const startOfDay = new Date(localDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(localDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Find quiz for today
      const quiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
        .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
        .orderBy('quiz.dropAtUTC', 'ASC')
        .getOne();

      if (!quiz) {
        return { hasAttempt: false };
      }

      // Check if user has an attempt for this quiz
      const attempt = await this.attemptRepository.findOne({
        where: {
          user: { id: userId } as User,
          dailyQuiz: { id: quiz.id } as DailyQuiz,
        },
        order: { createdAt: 'DESC' },
      });

      if (!attempt) {
        return { hasAttempt: false };
      }

      return {
        hasAttempt: true,
        attempt: {
          id: attempt.id,
          status: attempt.status as 'active' | 'finished',
          startedAt: attempt.startAt.toISOString(),
          finishedAt: attempt.finishAt?.toISOString(),
          score: attempt.score,
        },
      };
    } catch (error) {
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
      // Get Firebase user from middleware
      const firebaseUser = req.firebaseUser;
      if (!firebaseUser) {
        throw new HttpException(
          'Authentication required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userId = firebaseUser.uid;
      this.logger.log(`Starting attempt for Firebase user: ${userId}`);

      // Find or create user in our database
      let user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.log(`Creating new user with Firebase UID: ${userId}`);
        user = this.userRepository.create({
          id: userId,
          email: firebaseUser.email || null,
          name: firebaseUser.name || 'User',
          handle: `user_${userId.slice(0, 8)}`,
          authProvider: AuthProvider.FIREBASE,
          providerUserId: userId,
        });
        await this.userRepository.save(user);
        this.logger.log(`New user created successfully: ${userId}`);
      }

      // Parse local date and find the daily quiz for that date
      const localDate = new Date(request.localDate);

      // Find any quiz for the given date (instead of hardcoding specific time)
      const startOfDay = new Date(localDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(localDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      this.logger.log(
        `Looking for quiz between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`,
      );

      const quiz = await this.dailyQuizRepository
        .createQueryBuilder('quiz')
        .where('quiz.dropAtUTC >= :startOfDay', { startOfDay })
        .andWhere('quiz.dropAtUTC <= :endOfDay', { endOfDay })
        .orderBy('quiz.dropAtUTC', 'ASC')
        .getOne();

      if (!quiz) {
        this.logger.warn(
          `No daily quiz found for date ${request.localDate} (${startOfDay.toISOString()} - ${endOfDay.toISOString()})`,
        );
        throw new HttpException(
          'No daily quiz available for this date',
          HttpStatus.NOT_FOUND,
        );
      }

      this.logger.log(
        `Found quiz for ${request.localDate}: ${quiz.id} (drops at ${quiz.dropAtUTC.toISOString()})`,
      );

      // Check if quiz is currently accessible (within the 1-hour window after drop)
      const now = new Date();
      const oneHourAfterDrop = new Date(
        quiz.dropAtUTC.getTime() + 60 * 60 * 1000,
      );

      if (now < quiz.dropAtUTC) {
        this.logger.warn(
          `Quiz not yet available. Current: ${now.toISOString()}, Drop time: ${quiz.dropAtUTC.toISOString()}`,
        );
        throw new HttpException(
          `Quiz will be available at ${quiz.dropAtUTC.toISOString()}`,
          HttpStatus.FORBIDDEN,
        );
      }

      if (now > oneHourAfterDrop) {
        this.logger.warn(
          `Quiz window expired. Current: ${now.toISOString()}, Window ended: ${oneHourAfterDrop.toISOString()}`,
        );
        throw new HttpException(
          `Quiz window expired at ${oneHourAfterDrop.toISOString()}`,
          HttpStatus.GONE,
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

      // Check if we're within the join window (reuse the 'now' variable from above)
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
   * Submit all answers and finish the attempt with score calculation
   */
  @Post(':id/finish')
  async finishAttempt(
    @Param('id') attemptId: string,
    @Body()
    request?: {
      answers?: Array<{
        questionId: string;
        answer: Answer;
      }>;
    },
  ): Promise<{
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

      // If new answers are provided, save them first (bulk submission)
      if (request?.answers && request.answers.length > 0) {
        this.logger.log(
          `💾 Saving ${request.answers.length} answers in bulk...`,
        );

        for (const answerData of request.answers) {
          // Validate that the question belongs to this daily quiz
          const quizQuestion = await this.dailyQuizQuestionRepository.findOne({
            where: {
              dailyQuiz: { id: attempt.dailyQuiz.id },
              question: { id: answerData.questionId },
            },
            relations: ['question'],
          });

          if (!quizQuestion) {
            this.logger.warn(
              `Question ${answerData.questionId} not found in quiz ${attempt.dailyQuiz.id}`,
            );
            continue; // Skip invalid questions rather than failing
          }

          // Create or update answer
          let attemptAnswer = await this.attemptAnswerRepository.findOne({
            where: {
              attempt: { id: attemptId },
              questionId: answerData.questionId,
            },
          });

          if (attemptAnswer) {
            // Update existing answer
            attemptAnswer.answerJSON = answerData.answer;
            // Note: timeSpentMs will be calculated from overall attempt timing
          } else {
            // Create new answer
            attemptAnswer = this.attemptAnswerRepository.create({
              attempt: { id: attemptId } as Attempt,
              questionId: answerData.questionId,
              answerJSON: answerData.answer,
              timeSpentMs: 0, // Will be calculated from overall timing
              idempotencyKey: `bulk-${attemptId}-${answerData.questionId}`,
            });
          }

          await this.attemptAnswerRepository.save(attemptAnswer);
        }

        this.logger.log(`✅ Bulk answer submission completed`);
      }

      // Get all answers for this attempt (including newly submitted ones)
      const answers = await this.attemptAnswerRepository.find({
        where: { attempt: { id: attemptId } },
      });

      // Get quiz questions with correct answers
      const quizQuestions = await this.dailyQuizQuestionRepository.find({
        where: { dailyQuiz: { id: attempt.dailyQuiz.id } },
        relations: ['question'],
      });

      // Calculate overall timing first
      const finishTime = now;
      const finishTimeSec = Math.round(
        (finishTime.getTime() - attempt.startAt.getTime()) / 1000,
      );
      const totalTimeMs = finishTime.getTime() - attempt.startAt.getTime();

      // Distribute time evenly across questions for display purposes
      const avgTimePerQuestionMs = Math.round(
        totalTimeMs / quizQuestions.length,
      );

      this.logger.log(
        `📊 Quiz timing: Total ${finishTimeSec}s (${totalTimeMs}ms), Avg per question: ${avgTimePerQuestionMs}ms`,
      );

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

        if (answer) {
          // Use improved answer correctness checking
          isCorrect = this.checkAnswerCorrectness(
            answer.answerJSON,
            quizQuestion.question.correctJSON,
            quizQuestion.question.questionType,
          );

          if (isCorrect) {
            // Base points per question (10 total accuracy points possible)
            accuracyPoints = Math.round((10 / quizQuestions.length) * 10) / 10;
            totalAccuracyPoints += accuracyPoints;
          }

          // Update answer record with calculated timing
          answer.isCorrect = isCorrect;
          answer.accuracyPoints = accuracyPoints;
          answer.timeSpentMs = avgTimePerQuestionMs; // Use average time for display
          await this.attemptAnswerRepository.save(answer);
        }

        questionResults.push({
          questionId: quizQuestion.question.id,
          isCorrect,
          timeSpentMs: avgTimePerQuestionMs, // Use average time for display
          accuracyPoints,
        });
      }

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
   * Question-type specific answer correctness check
   * Handles different question types with appropriate validation logic
   */
  private checkAnswerCorrectness(
    userAnswer: Answer,
    correctAnswer: any,
    questionType: string,
  ): boolean {
    try {
      this.logger.debug(
        `🔍 Checking answer for question type: ${questionType}`,
      );

      switch (questionType) {
        case 'fill_blank':
          return this.checkFillBlankAnswer(userAnswer, correctAnswer);

        case 'tracklist_order':
          return this.checkTracklistOrderAnswer(userAnswer, correctAnswer);

        case 'timeline_order':
          return this.checkTimelineOrderAnswer(userAnswer, correctAnswer);

        case 'speed_tap':
          return this.checkSpeedTapAnswer(userAnswer, correctAnswer);

        case 'song_album_match':
          return this.checkSongAlbumMatchAnswer(userAnswer, correctAnswer);

        case 'popularity_match':
          return this.checkPopularityMatchAnswer(userAnswer, correctAnswer);

        case 'odd_one_out':
          return this.checkOddOneOutAnswer(userAnswer, correctAnswer);

        case 'guess_by_lyric':
          return this.checkGuessByLyricAnswer(userAnswer, correctAnswer);

        case 'album_year_guess':
          return this.checkAlbumYearGuessAnswer(userAnswer, correctAnswer);

        case 'life_trivia':
          return this.checkLifeTriviaAnswer(userAnswer, correctAnswer);

        // Add more question types as needed
        default:
          // Fallback to basic comparison for unknown types
          this.logger.warn(
            `⚠️ Unknown question type: ${questionType}, using basic comparison`,
          );
          return this.checkBasicAnswer(userAnswer, correctAnswer);
      }
    } catch (error) {
      this.logger.error(
        `❌ Error checking answer for type ${questionType}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Basic answer check (fallback)
   */
  private checkBasicAnswer(userAnswer: any, correctAnswer: any): boolean {
    try {
      return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } catch {
      return false;
    }
  }

  /**
   * Fill in the blank - check choice index
   */
  private checkFillBlankAnswer(userAnswer: any, correctAnswer: any): boolean {
    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }

  /**
   * Tracklist order - check array order
   */
  private checkTracklistOrderAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    const userTracks = userAnswer?.answer?.orderedTracks;
    const correctTracks = correctAnswer?.answer?.orderedTracks;

    if (!Array.isArray(userTracks) || !Array.isArray(correctTracks)) {
      return false;
    }

    if (userTracks.length !== correctTracks.length) {
      return false;
    }

    return userTracks.every((track, index) => track === correctTracks[index]);
  }

  /**
   * Timeline order - check array order (similar to tracklist)
   */
  private checkTimelineOrderAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    const userOrder = userAnswer?.answer?.orderedItems;
    const correctOrder = correctAnswer?.answer?.orderedItems;

    if (!Array.isArray(userOrder) || !Array.isArray(correctOrder)) {
      return false;
    }

    return (
      userOrder.length === correctOrder.length &&
      userOrder.every((item, index) => item === correctOrder[index])
    );
  }

  /**
   * Speed tap - check final tap counts or score
   */
  private checkSpeedTapAnswer(userAnswer: any, correctAnswer: any): boolean {
    const userSummary = userAnswer?.answer?.clientSummary;
    const correctSummary = correctAnswer?.answer?.clientSummary;

    if (!userSummary || !correctSummary) {
      return false;
    }

    // Check if user achieved the required correct taps
    return userSummary.correct >= correctSummary.correct;
  }

  /**
   * Song-Album match - check matching pairs
   */
  private checkSongAlbumMatchAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    const userMatches = userAnswer?.answer?.matches;
    const correctMatches = correctAnswer?.answer?.matches;

    if (!userMatches || !correctMatches) {
      return false;
    }

    // Check if all matches are correct
    return Object.keys(correctMatches).every(
      (songId) => userMatches[songId] === correctMatches[songId],
    );
  }

  /**
   * Popularity match - check ranking order
   */
  private checkPopularityMatchAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    const userRanking = userAnswer?.answer?.ranking;
    const correctRanking = correctAnswer?.answer?.ranking;

    if (!Array.isArray(userRanking) || !Array.isArray(correctRanking)) {
      return false;
    }

    return (
      userRanking.length === correctRanking.length &&
      userRanking.every((item, index) => item === correctRanking[index])
    );
  }

  /**
   * Odd one out - check selected item
   */
  private checkOddOneOutAnswer(userAnswer: any, correctAnswer: any): boolean {
    return (
      userAnswer?.answer?.selectedItem === correctAnswer?.answer?.selectedItem
    );
  }

  /**
   * Guess by lyric - check selected choice
   */
  private checkGuessByLyricAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }

  /**
   * Album year guess - check if within acceptable range
   */
  private checkAlbumYearGuessAnswer(
    userAnswer: any,
    correctAnswer: any,
  ): boolean {
    const userYear = userAnswer?.answer?.year;
    const correctYear = correctAnswer?.answer?.year;
    const tolerance = correctAnswer?.answer?.tolerance || 0;

    if (typeof userYear !== 'number' || typeof correctYear !== 'number') {
      return false;
    }

    return Math.abs(userYear - correctYear) <= tolerance;
  }

  /**
   * Life trivia - check choice index
   */
  private checkLifeTriviaAnswer(userAnswer: any, correctAnswer: any): boolean {
    return (
      userAnswer?.answer?.choiceIndex === correctAnswer?.answer?.choiceIndex
    );
  }
}
