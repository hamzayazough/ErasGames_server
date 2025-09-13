import { Injectable, Logger } from '@nestjs/common';
import { Difficulty } from '../../enums/question.enums';
import { ComposerConfig } from './interfaces/composer.interfaces';

/**
 * Service for managing difficulty distribution in daily quizzes
 *
 * Ensures proper distribution of questions by difficulty:
 * - 3 Easy questions (50% of quiz)
 * - 2 Medium questions (33% of quiz)
 * - 1 Hard question (17% of quiz)
 *
 * Provides fallback strategies when insufficient questions are available
 * at specific difficulty levels.
 */
@Injectable()
export class DifficultyDistributionService {
  private readonly logger = new Logger(DifficultyDistributionService.name);

  /**
   * Get the target distribution for a given number of questions
   */
  getTargetDistribution(totalQuestions: number): Record<Difficulty, number> {
    // Standard 6-question distribution: 3E/2M/1H
    if (totalQuestions === 6) {
      return {
        [Difficulty.EASY]: 3,
        [Difficulty.MEDIUM]: 2,
        [Difficulty.HARD]: 1,
      };
    }

    // Scale proportionally for other totals
    const easyRatio = 0.5; // 50%
    const mediumRatio = 0.33; // 33%

    const easy = Math.round(totalQuestions * easyRatio);
    const medium = Math.round(totalQuestions * mediumRatio);
    const hard = Math.max(1, totalQuestions - easy - medium); // Ensure at least 1 hard

    return {
      [Difficulty.EASY]: easy,
      [Difficulty.MEDIUM]: medium,
      [Difficulty.HARD]: hard,
    };
  }

  /**
   * Get difficulty distribution with fallback strategies
   */
  getDistributionWithFallbacks(
    config: ComposerConfig,
    availableCounts: Record<Difficulty, number>,
  ): {
    distribution: Record<Difficulty, number>;
    fallbacks: string[];
    warnings: string[];
  } {
    const target = this.getTargetDistribution(config.targetQuestionCount);
    const distribution = { ...target };
    const fallbacks: string[] = [];
    const warnings: string[] = [];

    // Check if we have enough questions for each difficulty
    const shortfalls: Array<{
      difficulty: Difficulty;
      needed: number;
      available: number;
    }> = [];

    for (const difficulty of Object.values(Difficulty)) {
      const targetCount = target[difficulty];
      const available = availableCounts[difficulty] || 0;

      if (available < targetCount) {
        shortfalls.push({
          difficulty,
          needed: targetCount,
          available,
        });
      }
    }

    if (shortfalls.length === 0) {
      this.logger.debug('Target distribution can be met exactly');
      return { distribution, fallbacks, warnings };
    }

    // Apply fallback strategies
    this.logger.warn(
      `Applying fallback strategies for ${shortfalls.length} difficulty levels`,
    );

    // Strategy 1: Redistribute from abundant difficulties to scarce ones
    for (const shortfall of shortfalls) {
      const deficit = shortfall.needed - shortfall.available;
      distribution[shortfall.difficulty] = shortfall.available;

      fallbacks.push(
        `${shortfall.difficulty}: reduced from ${shortfall.needed} to ${shortfall.available} (deficit: ${deficit})`,
      );

      // Try to compensate by adding to other difficulties
      const redistributed = this.redistributeDeficit(
        distribution,
        availableCounts,
        deficit,
      );
      fallbacks.push(...redistributed.fallbacks);

      if (redistributed.totalAdjusted < deficit) {
        warnings.push(
          `Could not fully compensate for ${shortfall.difficulty} deficit. ` +
            `Short by ${deficit - redistributed.totalAdjusted} questions.`,
        );
      }
    }

    // Strategy 2: Ensure minimum viable quiz size
    const totalActual = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0,
    );
    const minViableSize = Math.max(
      3,
      Math.floor(config.targetQuestionCount * 0.5),
    );

    if (totalActual < minViableSize) {
      warnings.push(
        `Quiz size ${totalActual} is below minimum viable size ${minViableSize}. ` +
          `Consider increasing question pool or relaxing anti-repeat rules.`,
      );
    }

    // Strategy 3: Emergency mode - use any available questions
    if (totalActual < 3) {
      const emergency = this.emergencyDistribution(availableCounts);
      Object.assign(distribution, emergency.distribution);
      fallbacks.push(...emergency.fallbacks);
      warnings.push(
        'EMERGENCY MODE: Using minimal distribution due to severe question shortage',
      );
    }

    this.logger.warn(
      `Final distribution: Easy=${distribution[Difficulty.EASY]}, ` +
        `Medium=${distribution[Difficulty.MEDIUM]}, Hard=${distribution[Difficulty.HARD]}`,
    );

    return { distribution, fallbacks, warnings };
  }

  /**
   * Redistribute deficit questions to other difficulties
   */
  private redistributeDeficit(
    distribution: Record<Difficulty, number>,
    availableCounts: Record<Difficulty, number>,
    deficit: number,
  ): { fallbacks: string[]; totalAdjusted: number } {
    const fallbacks: string[] = [];
    let remaining = deficit;

    // Priority order for receiving extra questions: Easy -> Medium -> Hard
    const priorities = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

    for (const difficulty of priorities) {
      if (remaining <= 0) break;

      const current = distribution[difficulty];
      const available = availableCounts[difficulty] || 0;
      const canAdd = Math.min(remaining, available - current);

      if (canAdd > 0) {
        distribution[difficulty] += canAdd;
        remaining -= canAdd;
        fallbacks.push(
          `${difficulty}: increased by ${canAdd} to compensate for deficit`,
        );
      }
    }

    return {
      fallbacks,
      totalAdjusted: deficit - remaining,
    };
  }

  /**
   * Emergency distribution when question pool is extremely limited
   */
  private emergencyDistribution(availableCounts: Record<Difficulty, number>): {
    distribution: Record<Difficulty, number>;
    fallbacks: string[];
  } {
    const distribution = {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    };
    const fallbacks: string[] = [];

    // Use whatever is available, prioritizing easier questions
    const priorities = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];

    for (const difficulty of priorities) {
      const available = availableCounts[difficulty] || 0;
      if (available > 0) {
        distribution[difficulty] = Math.min(available, 3); // Max 3 per difficulty in emergency
        fallbacks.push(
          `Emergency: using ${distribution[difficulty]} ${difficulty} questions`,
        );
      }
    }

    return { distribution, fallbacks };
  }

  /**
   * Validate that a distribution is feasible
   */
  validateDistribution(
    distribution: Record<Difficulty, number>,
    availableCounts: Record<Difficulty, number>,
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (const difficulty of Object.values(Difficulty)) {
      const needed = distribution[difficulty];
      const available = availableCounts[difficulty] || 0;

      if (needed > available) {
        issues.push(
          `${String(difficulty)}: need ${needed} but only ${available} available`,
        );
      }

      if (needed < 0) {
        issues.push(
          `${String(difficulty)}: negative count ${needed} is invalid`,
        );
      }
    }

    const total = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (total === 0) {
      issues.push('Total question count cannot be zero');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get recommended distribution based on available questions
   */
  getRecommendedDistribution(
    availableCounts: Record<Difficulty, number>,
    targetTotal?: number,
  ): {
    distribution: Record<Difficulty, number>;
    efficiency: number;
    recommendations: string[];
  } {
    const total = targetTotal || 6;
    const target = this.getTargetDistribution(total);

    // Calculate efficiency score (0-1)
    let achievableQuestions = 0;
    for (const difficulty of Object.values(Difficulty)) {
      const targetCount = target[difficulty];
      const available = availableCounts[difficulty] || 0;
      achievableQuestions += Math.min(targetCount, available);
    }

    const efficiency = achievableQuestions / total;

    const recommendations: string[] = [];

    if (efficiency < 0.8) {
      recommendations.push(
        'Consider adding more questions to improve distribution flexibility',
      );
    }

    for (const difficulty of Object.values(Difficulty)) {
      const targetCount = target[difficulty];
      const available = availableCounts[difficulty] || 0;

      if (available < targetCount * 2) {
        recommendations.push(
          `Consider adding more ${String(difficulty)} questions (current: ${available}, recommended: ${targetCount * 2}+)`,
        );
      }
    }

    return {
      distribution: target,
      efficiency,
      recommendations,
    };
  }
}
