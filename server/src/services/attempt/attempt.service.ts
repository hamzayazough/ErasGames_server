import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attempt } from '../../database/entities/attempt.entity';
import { AttemptAnswer } from '../../database/entities/attempt-answer.entity';
import { DailyQuiz } from '../../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { User } from '../../database/entities/user.entity';
import { Answer } from '../../database/entities/answers/answer.interface';
import {
  AttemptScoringService,
  ScoreCalculationResult,
} from '../attempt-scoring';
import { SeasonService } from '../../database/services/season.service';

export interface ScoreCalculationResultWithRanking
  extends ScoreCalculationResult {
  previousScore: number; // User's total score before this quiz
  newTotalScore: number; // User's total score after this quiz
  ranking: {
    currentRank: number;
    previousRank?: number;
    totalPoints: number;
    rankingContext: Array<{
      userId: string;
      handle: string;
      name?: string | null;
      country?: string | null;
      totalPoints: number;
      rank: number;
      isCurrentUser: boolean;
    }>;
    seasonInfo: {
      id: string;
      name: string;
      displayName: string;
    };
  };
}

@Injectable()
export class AttemptService {
  private readonly logger = new Logger(AttemptService.name);

  constructor(
    @InjectRepository(Attempt)
    private readonly attemptRepository: Repository<Attempt>,
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepository: Repository<AttemptAnswer>,
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    private readonly attemptScoringService: AttemptScoringService,
    private readonly seasonService: SeasonService,
  ) {}

  /**
   * Get user's attempt status for today's quiz
   */
  async getTodayAttempt(userId: string): Promise<{
    hasAttempt: boolean;
    attempt?: {
      id: string;
      status: 'active' | 'finished';
      startedAt: string;
      finishedAt?: string;
      score?: number;
    };
  }> {
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
      relations: ['dailyQuiz'],
    });

    if (!attempt) {
      return { hasAttempt: false };
    }

    // Check if active attempt has expired and auto-finish it
    const now = new Date();
    if (attempt.status === 'active' && now > attempt.deadline) {
      await this.autoFinishExpiredAttempt(attempt, now);
    }

    return {
      hasAttempt: true,
      attempt: {
        id: attempt.id,
        status: attempt.status as 'finished',
        startedAt: attempt.startAt.toISOString(),
        finishedAt: attempt.finishAt?.toISOString(),
        score: attempt.score,
      },
    };
  }

  /**
   * Create a new attempt for the user
   */
  async startAttempt(
    userId: string,
    localDate: string,
  ): Promise<{
    attemptId: string;
    serverStartAt: string;
    deadline: string;
    seed: number;
    templateUrl: string;
  }> {
    this.logger.log(`Starting attempt for user: ${userId}`);

    // Parse local date and find the daily quiz for that date
    const dateObj = new Date(localDate);

    // Find any quiz for the given date
    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
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
        `No daily quiz found for date ${localDate} (${startOfDay.toISOString()} - ${endOfDay.toISOString()})`,
      );
      throw new HttpException(
        'No daily quiz available for this date',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(
      `Found quiz for ${localDate}: ${quiz.id} (drops at ${quiz.dropAtUTC.toISOString()})`,
    );

    // Validate quiz accessibility
    this.validateQuizAccessibility(quiz);

    // Check for existing attempts
    await this.checkExistingAttempts(userId, quiz.id);

    // Validate join window
    this.validateJoinWindow(quiz);

    // Create new attempt
    const serverStartAt = new Date();
    const deadline = new Date(serverStartAt.getTime() + 65 * 1000); // 65 seconds (1 min + 5s buffer)
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
  }

  /**
   * Get attempt by ID with validation
   */
  async getActiveAttempt(attemptId: string): Promise<Attempt> {
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

    return attempt;
  }

  /**
   * Get attempt by ID (any status)
   */
  async getAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['dailyQuiz'],
    });

    if (!attempt) {
      throw new HttpException('Attempt not found', HttpStatus.NOT_FOUND);
    }

    return attempt;
  }

  /**
   * Finish an attempt and calculate score
   */
  async finishAttempt(
    attemptId: string,
    userId: string,
    answers?: Array<{ questionId: string; answer: any }>,
  ): Promise<ScoreCalculationResultWithRanking> {
    const attempt = await this.getAttempt(attemptId);

    // Check if already finished (idempotent)
    if (attempt.status === 'finished') {
      const result = await this.getFinishedAttemptResult(attempt);
      const ranking = await this.getRankingContext(userId, result.score);

      // Get user's score info for idempotent case
      const currentSeason = await this.seasonService.getCurrentSeason();
      let previousScore = 0;
      let newTotalScore = result.score;

      if (currentSeason) {
        const userParticipation = await this.seasonService.getUserParticipation(
          currentSeason.id,
          userId,
        );
        const totalPoints = userParticipation?.totalPoints || 0;
        // For finished attempts, we assume the quiz score is already included in total
        previousScore = totalPoints - result.score;
        newTotalScore = totalPoints;
      }

      return {
        ...result,
        previousScore,
        newTotalScore,
        ranking: {
          ...ranking,
          previousRank: ranking.previousRank ?? undefined,
        },
      };
    }

    const now = new Date();
    const isExpired = now > attempt.deadline;

    if (isExpired) {
      this.logger.warn(
        `⏰ Late submission detected for attempt ${attemptId}. Deadline: ${attempt.deadline.toISOString()}, Current: ${now.toISOString()}`,
      );
    }

    // Save bulk answers if provided
    if (answers && answers.length > 0) {
      await this.saveBulkAnswers(attemptId, attempt.dailyQuiz.id, answers);
    }

    // Get all answers for scoring
    const allAnswers = await this.attemptAnswerRepository.find({
      where: { attempt: { id: attemptId } },
    });

    // Get quiz questions
    const quizQuestions = await this.dailyQuizQuestionRepository.find({
      where: { dailyQuiz: { id: attempt.dailyQuiz.id } },
      relations: ['question'],
    });

    // Calculate score
    const result = await this.attemptScoringService.calculateScore(
      attempt,
      allAnswers,
      quizQuestions,
      now,
    );

    // Update attempt
    attempt.finishAt = now;
    attempt.accPoints = result.accPoints;
    attempt.speedSec = result.finishTimeSec;
    attempt.score = result.score;
    attempt.status = 'finished';

    await this.attemptRepository.save(attempt);

    // Get user's score before this quiz for animation purposes
    const currentSeason = await this.seasonService.getCurrentSeason();
    let previousScore = 0;
    if (currentSeason) {
      const userParticipation = await this.seasonService.getUserParticipation(
        currentSeason.id,
        userId,
      );
      previousScore = userParticipation?.totalPoints || 0;
    }

    // Add ranking information
    const ranking = await this.getRankingContext(userId, result.score);
    return {
      ...result,
      previousScore, // Score before this quiz
      newTotalScore: previousScore + result.score, // Total score after this quiz
      ranking: {
        ...ranking,
        previousRank: ranking.previousRank ?? undefined,
      },
    };
  }

  /**
   * Get ranking context for user after completing a quiz
   */
  private async getRankingContext(userId: string, newScore: number) {
    try {
      // Get current active season
      const currentSeason = await this.seasonService.getCurrentSeason();

      if (!currentSeason) {
        throw new Error('No active season found');
      }

      // Get user's previous ranking (before this quiz)
      const userParticipationBefore =
        await this.seasonService.getUserParticipation(currentSeason.id, userId);
      const previousRank = userParticipationBefore?.currentRank;

      // Update user's season participation with new score (add to existing total)
      await this.seasonService.updateUserParticipation(
        currentSeason.id,
        userId,
        newScore, // This should be the points from this quiz, not total
      );

      // Get updated ranking context (5 above, user, 5 below)
      const rankingContext = await this.seasonService.getRankingContext(
        currentSeason.id,
        userId,
        5, // positions above
        5, // positions below
      );

      return {
        currentRank: rankingContext.userRank,
        previousRank,
        totalPoints: rankingContext.userTotalPoints,
        rankingContext: rankingContext.players,
        seasonInfo: {
          id: currentSeason.id,
          name: currentSeason.name,
          displayName: currentSeason.displayName,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get ranking context:', error);
      // Return default ranking info if there's an error
      return {
        currentRank: 1,
        previousRank: undefined,
        totalPoints: newScore,
        rankingContext: [
          {
            userId,
            handle: 'You',
            name: undefined,
            country: undefined,
            totalPoints: newScore,
            rank: 1,
            isCurrentUser: true,
          },
        ],
        seasonInfo: {
          id: 'unknown',
          name: 'Season 1',
          displayName: 'Season 1',
        },
      };
    }
  }

  /**
   * Auto-finish expired attempt
   */
  private async autoFinishExpiredAttempt(
    attempt: Attempt,
    now: Date,
  ): Promise<void> {
    this.logger.warn(
      `⏰ Auto-finishing expired attempt ${attempt.id}. Deadline: ${attempt.deadline.toISOString()}, Current: ${now.toISOString()}`,
    );

    try {
      // Get existing answers for this attempt
      const answers = await this.attemptAnswerRepository.find({
        where: { attempt: { id: attempt.id } },
      });

      // Get quiz questions
      const quizQuestions = await this.dailyQuizQuestionRepository.find({
        where: { dailyQuiz: { id: attempt.dailyQuiz.id } },
        relations: ['question'],
      });

      // Use scoring service to finalize the expired attempt
      const result = await this.attemptScoringService.calculateScore(
        attempt,
        answers,
        quizQuestions,
        now,
      );

      // Update attempt as finished with score of 0 (due to expiration)
      attempt.finishAt = now;
      attempt.accPoints = result.accPoints;
      attempt.speedSec = result.finishTimeSec;
      attempt.score = result.score; // Will be 0 for expired attempts
      attempt.status = 'finished';

      await this.attemptRepository.save(attempt);

      this.logger.log(
        `✅ Expired attempt auto-finished with score: ${result.score}`,
      );
    } catch (error) {
      this.logger.error('Failed to auto-finish expired attempt:', error);
      // Continue with the original attempt status if auto-finish fails
    }
  }

  /**
   * Validate quiz accessibility
   */
  private validateQuizAccessibility(quiz: DailyQuiz): void {
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
  }

  /**
   * Check for existing attempts
   */
  private async checkExistingAttempts(
    userId: string,
    quizId: string,
  ): Promise<void> {
    const existingAttempt = await this.attemptRepository.findOne({
      where: {
        user: { id: userId } as User,
        dailyQuiz: { id: quizId } as DailyQuiz,
      },
      order: { createdAt: 'DESC' },
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'active') {
        const now = new Date();
        if (now > existingAttempt.deadline) {
          this.logger.warn(
            `Found expired active attempt ${existingAttempt.id}, user should not be able to start new attempt`,
          );
          throw new HttpException(
            'Your previous attempt has expired. You cannot start a new attempt for today.',
            HttpStatus.CONFLICT,
          );
        }
        throw new HttpException(
          'You already have an active attempt for this quiz',
          HttpStatus.CONFLICT,
        );
      } else if (existingAttempt.status === 'finished') {
        throw new HttpException(
          "You have already completed today's quiz",
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  /**
   * Validate join window
   */
  private validateJoinWindow(quiz: DailyQuiz): void {
    const now = new Date();
    const joinWindowEnd = new Date(quiz.dropAtUTC);
    joinWindowEnd.setHours(joinWindowEnd.getHours() + 24);

    if (now > joinWindowEnd) {
      throw new HttpException(
        'Join window has ended for this quiz',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  /**
   * Save bulk answers
   */
  private async saveBulkAnswers(
    attemptId: string,
    quizId: string,
    answers: Array<{ questionId: string; answer: Answer }>,
  ): Promise<void> {
    this.logger.log(`💾 Saving ${answers.length} answers in bulk...`);

    for (const answerData of answers) {
      // Validate that the question belongs to this daily quiz
      const quizQuestion = await this.dailyQuizQuestionRepository.findOne({
        where: {
          dailyQuiz: { id: quizId },
          question: { id: answerData.questionId },
        },
        relations: ['question'],
      });

      if (!quizQuestion) {
        this.logger.warn(
          `Question ${answerData.questionId} not found in quiz ${quizId}`,
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

  /**
   * Get results for already finished attempts (idempotent)
   */
  private async getFinishedAttemptResult(attempt: Attempt) {
    const answers = await this.attemptAnswerRepository.find({
      where: { attempt: { id: attempt.id } },
    });

    return this.attemptScoringService.getFinishedAttemptResult(
      attempt,
      answers,
    );
  }
}
