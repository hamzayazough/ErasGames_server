import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttemptAnswer } from '../../database/entities/attempt-answer.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Attempt } from '../../database/entities/attempt.entity';
import { QuestionCorrectnessService } from './question-correctness.service';
import { Difficulty } from '../../database/enums/question.enums';
import { SeasonIntegrationService } from '../season-integration.service';

export interface ScoreCalculationResult {
  score: number;
  breakdown: {
    base: number; // Base accuracy points
    questionPoints: number; // Same as base (for compatibility)
    speedMultiplier: number; // Display multiplier (for UI)
    earlyMultiplier: number; // Display multiplier (for UI)
    totalQuestionPoints: number; // Total bonus points added
    unusedSeconds: number;
    startDelayMinutes: number;
    minutesEarly: number;
  };
  accPoints: number; // Raw accuracy points
  finishTimeSec: number;
  questions: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpentMs: number;
    accuracyPoints: number;
    difficulty: string;
  }>;
}

@Injectable()
export class AttemptScoringService {
  private readonly logger = new Logger(AttemptScoringService.name);

  constructor(
    @InjectRepository(AttemptAnswer)
    private readonly attemptAnswerRepository: Repository<AttemptAnswer>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    private readonly questionCorrectnessService: QuestionCorrectnessService,
    private readonly seasonIntegrationService: SeasonIntegrationService,
  ) {}

  /**
   * Calculate the final score for a completed attempt
   */
  async calculateScore(
    attempt: Attempt,
    answers: AttemptAnswer[],
    quizQuestions: DailyQuizQuestion[],
    finishTime: Date,
  ): Promise<ScoreCalculationResult> {
    // Check if submission was after deadline
    const isExpired = finishTime > attempt.deadline;

    if (isExpired) {
      this.logger.warn(
        `⏰ Expired submission detected! Deadline: ${attempt.deadline.toISOString()}, Finish: ${finishTime.toISOString()}`,
      );
      return this.getExpiredAttemptResult(
        attempt,
        answers,
        quizQuestions,
        finishTime,
      );
    }

    // Calculate overall timing first
    const finishTimeSec = Math.round(
      (finishTime.getTime() - attempt.startAt.getTime()) / 1000,
    );
    const totalTimeMs = finishTime.getTime() - attempt.startAt.getTime();

    // Distribute time evenly across questions for display purposes
    const avgTimePerQuestionMs = Math.round(totalTimeMs / quizQuestions.length);

    this.logger.log(
      `📊 Quiz timing: Total ${finishTimeSec}s (${totalTimeMs}ms), Avg per question: ${avgTimePerQuestionMs}ms`,
    );

    // New accuracy-first scoring system with scaled bonuses
    let questionPoints = 0;
    let correctAnswersCount = 0;
    const questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      timeSpentMs: number;
      accuracyPoints: number;
      difficulty: string;
    }> = [];

    // Calculate maximum possible points for this quiz (for scaling bonuses)
    let maxPossiblePoints = 0;
    for (const quizQuestion of quizQuestions) {
      switch (quizQuestion.question.difficulty) {
        case Difficulty.EASY:
          maxPossiblePoints += 200;
          break;
        case Difficulty.MEDIUM:
          maxPossiblePoints += 500;
          break;
        case Difficulty.HARD:
          maxPossiblePoints += 1000;
          break;
        default:
          maxPossiblePoints += 200; // fallback to easy
      }
    }

    for (const quizQuestion of quizQuestions) {
      const answer = answers.find(
        (a) => a.questionId === quizQuestion.question.id,
      );
      let isCorrect = false;
      let accuracyPoints = 0;

      if (answer) {
        // Use question correctness service to check answer
        isCorrect = this.questionCorrectnessService.checkAnswerCorrectness(
          answer.answerJSON,
          quizQuestion.question.correctJSON,
          quizQuestion.question.questionType,
        );

        if (isCorrect) {
          correctAnswersCount++;
          // Points based on difficulty: Easy=200, Medium=500, Hard=1000
          switch (quizQuestion.question.difficulty) {
            case Difficulty.EASY:
              accuracyPoints = 200;
              break;
            case Difficulty.MEDIUM:
              accuracyPoints = 500;
              break;
            case Difficulty.HARD:
              accuracyPoints = 1000;
              break;
            default:
              accuracyPoints = 200; // fallback to easy
          }
          questionPoints += accuracyPoints;
        }

        // Update answer record with calculated timing and correctness
        answer.isCorrect = isCorrect;
        answer.accuracyPoints = accuracyPoints;
        answer.timeSpentMs = avgTimePerQuestionMs; // Use average time for display
        await this.attemptAnswerRepository.save(answer);
      }

      questionResults.push({
        questionId: quizQuestion.question.id,
        isCorrect,
        timeSpentMs: avgTimePerQuestionMs,
        accuracyPoints,
        difficulty: quizQuestion.question.difficulty,
      });
    }

    // Calculate bonus scaling factor based on accuracy
    const accuracyRatio =
      maxPossiblePoints > 0 ? questionPoints / maxPossiblePoints : 0;

    this.logger.log(
      `📊 Accuracy: ${correctAnswersCount}/${quizQuestions.length} correct, ${questionPoints}/${maxPossiblePoints} points (${Math.round(accuracyRatio * 100)}% ratio)`,
    );

    // Calculate timing variables
    const unusedSeconds = Math.max(0, 60 - finishTimeSec);
    const quizDropTime = attempt.dailyQuiz.dropAtUTC;
    const startDelay =
      (attempt.startAt.getTime() - quizDropTime.getTime()) / 1000;
    const startDelayMinutes = Math.max(0, Math.floor(startDelay / 60));
    const maxDelayMinutes = 60;
    const minutesEarly = Math.max(0, maxDelayMinutes - startDelayMinutes);

    // Calculate bonuses (only applied if user got some answers right)
    let speedBonus = 0;
    let earlyBonus = 0;
    let speedMultiplier = 1;
    let earlyMultiplier = 1;

    if (questionPoints > 0) {
      // Speed bonus: unused seconds * 5 points, scaled by accuracy
      const rawSpeedBonus = unusedSeconds * 5;
      speedBonus = Math.round(rawSpeedBonus * accuracyRatio);
      speedMultiplier = speedBonus > 0 ? 1 + speedBonus / questionPoints : 1;

      // Early starter bonus: minutes early * 10 points, scaled by accuracy
      const rawEarlyBonus = minutesEarly * 10;
      earlyBonus = Math.round(rawEarlyBonus * accuracyRatio);
      earlyMultiplier = earlyBonus > 0 ? 1 + earlyBonus / questionPoints : 1;

      this.logger.log(
        `🎯 Bonuses: Speed ${speedBonus} (${unusedSeconds}s unused), Early ${earlyBonus} (${minutesEarly}min early), scaled by ${Math.round(accuracyRatio * 100)}%`,
      );
    }

    // Final score calculation: base accuracy points + scaled bonuses
    const score = questionPoints + speedBonus + earlyBonus;
    const totalBonusPoints = speedBonus + earlyBonus; // For breakdown display

    const result = {
      score,
      breakdown: {
        base: questionPoints, // Base accuracy points
        questionPoints: questionPoints, // Same as base for compatibility
        speedMultiplier: Math.round(speedMultiplier * 100) / 100,
        earlyMultiplier: Math.round(earlyMultiplier * 100) / 100,
        totalQuestionPoints: totalBonusPoints, // Bonus points
        unusedSeconds: unusedSeconds,
        startDelayMinutes: startDelayMinutes,
        minutesEarly: minutesEarly,
      },
      accPoints: questionPoints, // Raw accuracy points
      finishTimeSec,
      questions: questionResults,
    };

    // Record season progress with detailed performance data (async, don't wait)
    this.recordSeasonProgress(
      attempt,
      result,
      correctAnswersCount,
      accuracyRatio,
    ).catch((error) => {
      this.logger.error(
        `Failed to record season progress for attempt ${attempt.id}:`,
        error,
      );
    });

    return result;
  }

  /**
   * Recalculate score breakdown from stored attempt data (for idempotent requests)
   */
  getFinishedAttemptResult(
    attempt: Attempt,
    answers: AttemptAnswer[],
  ): ScoreCalculationResult {
    const questionResults = answers.map((answer) => ({
      questionId: answer.questionId,
      isCorrect: answer.isCorrect,
      timeSpentMs: answer.timeSpentMs,
      accuracyPoints: answer.accuracyPoints,
      difficulty: 'unknown', // We don't store difficulty in answer, so use fallback
    }));

    // Reconstruct breakdown from stored values (approximation since we store final result)
    const basePoints = 100;
    const questionPoints = attempt.accPoints; // Raw question points
    const unusedSeconds = Math.max(0, 60 - attempt.speedSec);
    const speedMultiplier = 1 + unusedSeconds * 0.05;

    // Approximate early multiplier from remaining score
    const totalQuestionPoints = attempt.score - basePoints;
    const expectedWithSpeedOnly = Math.round(questionPoints * speedMultiplier);
    const earlyMultiplier =
      expectedWithSpeedOnly > 0
        ? totalQuestionPoints / expectedWithSpeedOnly
        : 1.0;

    return {
      score: attempt.score,
      breakdown: {
        base: basePoints,
        questionPoints: questionPoints,
        speedMultiplier: Math.round(speedMultiplier * 100) / 100,
        earlyMultiplier: Math.round(earlyMultiplier * 100) / 100,
        totalQuestionPoints: totalQuestionPoints,
        unusedSeconds: unusedSeconds,
        startDelayMinutes: 0, // Can't reconstruct this from stored data
        minutesEarly: 0, // Can't reconstruct this from stored data
      },
      accPoints: attempt.accPoints,
      finishTimeSec: attempt.speedSec,
      questions: questionResults,
    };
  }

  /**
   * Handle expired attempt submission - return score of 0 but still show question results
   */
  private async getExpiredAttemptResult(
    attempt: Attempt,
    answers: AttemptAnswer[],
    quizQuestions: DailyQuizQuestion[],
    finishTime: Date,
  ): Promise<ScoreCalculationResult> {
    // Calculate timing for display
    const finishTimeSec = Math.round(
      (finishTime.getTime() - attempt.startAt.getTime()) / 1000,
    );
    const totalTimeMs = finishTime.getTime() - attempt.startAt.getTime();
    const avgTimePerQuestionMs = Math.round(totalTimeMs / quizQuestions.length);

    this.logger.log(
      `⏰ Expired quiz: Total ${finishTimeSec}s (exceeded 60s limit)`,
    );

    // Still process answers for display but give 0 score
    const questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      timeSpentMs: number;
      accuracyPoints: number;
      difficulty: string;
    }> = [];

    for (const quizQuestion of quizQuestions) {
      const answer = answers.find(
        (a) => a.questionId === quizQuestion.question.id,
      );
      let isCorrect = false;

      if (answer) {
        // Still check correctness for display
        isCorrect = this.questionCorrectnessService.checkAnswerCorrectness(
          answer.answerJSON,
          quizQuestion.question.correctJSON,
          quizQuestion.question.questionType,
        );

        // Update answer record but with 0 points due to expiration
        answer.isCorrect = isCorrect;
        answer.accuracyPoints = 0; // No points for expired submission
        answer.timeSpentMs = avgTimePerQuestionMs;
        await this.attemptAnswerRepository.save(answer);
      }

      questionResults.push({
        questionId: quizQuestion.question.id,
        isCorrect,
        timeSpentMs: avgTimePerQuestionMs,
        accuracyPoints: 0, // No points for expired submission
        difficulty: quizQuestion.question.difficulty,
      });
    }

    // Return score of 0 for expired attempts
    return {
      score: 0,
      breakdown: {
        base: 0, // No base points for expired
        questionPoints: 0, // No question points for expired
        speedMultiplier: 0, // No multiplier for expired
        earlyMultiplier: 0, // No multiplier for expired
        totalQuestionPoints: 0, // No points for expired
        unusedSeconds: 0, // Exceeded time limit
        startDelayMinutes: 0,
        minutesEarly: 0,
      },
      accPoints: 0, // No accuracy points for expired
      finishTimeSec,
      questions: questionResults,
    };
  }

  /**
   * Record season progress with detailed performance metrics
   */
  private async recordSeasonProgress(
    attempt: Attempt,
    result: ScoreCalculationResult,
    correctAnswersCount: number,
    accuracyRatio: number,
  ): Promise<void> {
    try {
      // Extract user ID from attempt
      const userId = attempt.user?.id;
      if (!userId) {
        this.logger.warn(
          'No user ID found in attempt, skipping season progress recording',
        );
        return;
      }

      // Create enhanced performance data for season tracking
      const performanceData = {
        score: result.score,
        accuracyPoints: result.accPoints,
        correctAnswers: correctAnswersCount,
        totalQuestions: result.questions.length,
        accuracyRatio: Math.round(accuracyRatio * 100), // Percentage
        speedBonus: result.breakdown.totalQuestionPoints,
        unusedSeconds: result.breakdown.unusedSeconds,
        finishTime: result.finishTimeSec,
        isSpeedster: result.breakdown.unusedSeconds >= 30, // Finished with 30+ seconds left
        isEarlyBird: result.breakdown.minutesEarly >= 30, // Started 30+ minutes early
        isPerfectAccuracy: correctAnswersCount === result.questions.length,
        difficultyBreakdown: this.calculateDifficultyBreakdown(
          result.questions,
        ),
      };

      this.logger.log(
        `🏆 Enhanced season tracking for user ${userId}: ${JSON.stringify(performanceData)}`,
      );

      // Use the season integration service with enhanced data
      await this.seasonIntegrationService.recordEnhancedSeasonProgress(
        attempt,
        userId,
        performanceData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record enhanced season progress for attempt ${attempt.id}:`,
        error,
      );
      // Don't throw - season tracking is supplementary
    }
  }

  /**
   * Calculate difficulty breakdown from question results
   */
  private calculateDifficultyBreakdown(
    questions: Array<{ difficulty: string; isCorrect: boolean }>,
  ): Record<string, { correct: number; total: number }> {
    const breakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      if (!breakdown[q.difficulty]) {
        breakdown[q.difficulty] = { correct: 0, total: 0 };
      }
      breakdown[q.difficulty].total++;
      if (q.isCorrect) {
        breakdown[q.difficulty].correct++;
      }
    });

    return breakdown;
  }
}
