import { Injectable, Logger } from '@nestjs/common';
import { SeasonService } from '../database/services/season.service';
import { Attempt } from '../database/entities/attempt.entity';

/**
 * SeasonIntegrationService
 *
 * Handles integration between the quiz attempt system and the seasons system.
 * Automatically records season progress when users complete daily quizzes.
 */
@Injectable()
export class SeasonIntegrationService {
  private readonly logger = new Logger(SeasonIntegrationService.name);

  constructor(private readonly seasonService: SeasonService) {}

  /**
   * Record enhanced season progress with detailed performance metrics.
   * This method should be called from the scoring service with rich performance data.
   */
  async recordEnhancedSeasonProgress(
    attempt: Attempt,
    userId: string,
    performanceData: {
      score: number;
      accuracyPoints: number;
      correctAnswers: number;
      totalQuestions: number;
      accuracyRatio: number;
      speedBonus: number;
      unusedSeconds: number;
      finishTime: number;
      isSpeedster: boolean;
      isEarlyBird: boolean;
      isPerfectAccuracy: boolean;
      difficultyBreakdown: Record<string, { correct: number; total: number }>;
    },
  ): Promise<void> {
    try {
      // Get the current active season
      const currentSeason = await this.seasonService.getCurrentSeason();

      if (!currentSeason) {
        this.logger.warn(
          'No active season found, skipping season progress recording',
        );
        return;
      }

      // Get the quiz date (convert from attempt's drop time to local date)
      const quizDate = this.extractQuizDateFromAttempt(attempt);

      // Check if this date falls within the current season
      if (
        !this.isDateInSeason(
          quizDate,
          currentSeason.startDate,
          currentSeason.endDate,
        )
      ) {
        this.logger.warn(
          `Quiz date ${quizDate} is not within current season ${currentSeason.name}, skipping season progress recording`,
        );
        return;
      }

      this.logger.log(
        `🏆 Recording enhanced season progress for user ${userId}:`,
      );
      this.logger.log(
        `  Score: ${performanceData.score} (Accuracy: ${performanceData.accuracyRatio}%)`,
      );
      this.logger.log(
        `  Performance: ${performanceData.correctAnswers}/${performanceData.totalQuestions} correct, ${performanceData.finishTime}s`,
      );
      this.logger.log(
        `  Bonuses: Speed(${performanceData.isSpeedster}), Early(${performanceData.isEarlyBird}), Perfect(${performanceData.isPerfectAccuracy})`,
      );

      // Record the daily progress in the season with enhanced data
      await this.seasonService.recordDailyProgress(
        currentSeason.id,
        userId,
        quizDate,
        attempt.dailyQuiz.id,
        attempt.id,
        performanceData.score,
        performanceData.isPerfectAccuracy,
      );

      this.logger.log(
        `✅ Enhanced season progress recorded for user ${userId} in season ${currentSeason.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record enhanced season progress for attempt ${attempt.id}:`,
        error,
      );
      // Don't throw error - season tracking is supplementary and shouldn't break quiz completion
    }
  }

  /**
   * Record season progress when a user completes a daily quiz attempt.
   * This should be called after an attempt is successfully finished.
   * @deprecated Use recordEnhancedSeasonProgress instead for richer data
   */
  async recordSeasonProgress(attempt: Attempt, userId: string): Promise<void> {
    try {
      // Get the current active season
      const currentSeason = await this.seasonService.getCurrentSeason();

      if (!currentSeason) {
        this.logger.warn(
          'No active season found, skipping season progress recording',
        );
        return;
      }

      // Get the quiz date (convert from attempt's drop time to local date)
      const quizDate = this.extractQuizDateFromAttempt(attempt);

      // Check if this date falls within the current season
      if (
        !this.isDateInSeason(
          quizDate,
          currentSeason.startDate,
          currentSeason.endDate,
        )
      ) {
        this.logger.warn(
          `Quiz date ${quizDate} is not within current season ${currentSeason.name}, skipping season progress recording`,
        );
        return;
      }

      // Determine if this is a perfect score
      // Determine if this is a perfect score
      const isPerfectScore = this.calculatePerfectScore(attempt);

      this.logger.log(
        `Recording season progress for user ${userId}: ${attempt.score} points, perfect: ${isPerfectScore}`,
      );

      // Record the daily progress in the season
      await this.seasonService.recordDailyProgress(
        currentSeason.id,
        userId,
        quizDate,
        attempt.dailyQuiz.id,
        attempt.id,
        attempt.score,
        isPerfectScore,
      );

      this.logger.log(
        `Successfully recorded season progress for user ${userId} in season ${currentSeason.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record season progress for attempt ${attempt.id}:`,
        error,
      );
      // Don't throw error - season tracking is supplementary and shouldn't break quiz completion
    }
  }

  /**
   * Extract the quiz date from an attempt.
   * For now, we'll use the current date, but this could be enhanced to use
   * the actual drop date or user's timezone.
   */
  private extractQuizDateFromAttempt(attempt: Attempt): string {
    // For now, use the start date of the attempt as the quiz date
    const startDate = new Date(attempt.startAt);
    return startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Check if a date falls within a season's date range.
   */
  private isDateInSeason(
    quizDate: string,
    seasonStart: string,
    seasonEnd: string,
  ): boolean {
    return quizDate >= seasonStart && quizDate <= seasonEnd;
  }

  /**
   * Determine if the attempt score represents a perfect score.
   * This can be refined based on your specific perfect score criteria.
   */
  private calculatePerfectScore(attempt: Attempt): boolean {
    // For now, consider it perfect if the score is 100 or higher
    // This can be refined based on your specific perfect score criteria
    return attempt.score >= 100;
  }

  /**
   * Get season statistics for a user (optional helper method).
   */
  async getUserSeasonStats(userId: string): Promise<{
    currentSeason: any;
    participation: any;
  } | null> {
    try {
      const currentSeason = await this.seasonService.getCurrentSeason();

      if (!currentSeason) {
        return null;
      }

      const participation = await this.seasonService.getOrCreateParticipation(
        currentSeason.id,
        userId,
      );

      return {
        currentSeason: {
          id: currentSeason.id,
          name: currentSeason.name,
          displayName: currentSeason.displayName,
          seasonNumber: currentSeason.seasonNumber,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
          daysRemaining: currentSeason.daysRemaining,
          progress: currentSeason.progress,
        },
        participation: {
          totalPoints: participation.totalPoints,
          totalQuizzesCompleted: participation.totalQuizzesCompleted,
          currentStreak: participation.currentStreak,
          longestStreak: participation.longestStreak,
          perfectScores: participation.perfectScores,
          currentRank: participation.currentRank,
          averagePointsPerQuiz: participation.averagePointsPerQuiz,
          perfectScoreRate: participation.perfectScoreRate,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user season stats for ${userId}:`,
        error,
      );
      return null;
    }
  }
}
