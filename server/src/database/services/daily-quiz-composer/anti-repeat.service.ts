import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { Difficulty } from '../../enums/question.enums';
import {
  AntiRepeatInfo,
  SelectionCriteria,
} from './interfaces/composer.interfaces';

/**
 * Service for managing anti-repeat logic with progressive relaxation
 *
 * Implements the 30→21→14→10→7 day relaxation schedule:
 * - Day 30+: Strict anti-repeat, no questions used in last 30 days
 * - Day 21-29: Relaxed level 1, minimal repeats allowed
 * - Day 14-20: Relaxed level 2, some repeats allowed
 * - Day 10-13: Relaxed level 3, more repeats allowed
 * - Day 7-9: Final relaxation, any question allowed
 * - Day <7: Emergency fallback, prefer least recently used
 */
@Injectable()
export class AntiRepeatService {
  private readonly logger = new Logger(AntiRepeatService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  /**
   * Calculate anti-repeat eligibility for a question
   */
  calculateAntiRepeatInfo(
    question: Question,
    targetDate: Date,
    relaxationLevel: number = 0,
  ): AntiRepeatInfo {
    const now = targetDate;
    const lastUsed = question.lastUsedAt;

    let daysSinceLastUsed: number | null = null;
    if (lastUsed) {
      const diffMs = now.getTime() - lastUsed.getTime();
      daysSinceLastUsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    const exposureCount = question.exposureCount || 0;

    // Progressive relaxation thresholds
    const thresholds = [30, 21, 14, 10, 7];
    const currentThreshold = thresholds[relaxationLevel] || 0;

    let isEligible = true;
    let reason: string | undefined;

    if (daysSinceLastUsed !== null && daysSinceLastUsed < currentThreshold) {
      isEligible = false;
      reason = `Used ${daysSinceLastUsed} days ago, threshold is ${currentThreshold} days`;
    }

    // Apply exposure bias - prefer questions with lower exposure counts
    if (isEligible && relaxationLevel === 0 && exposureCount > 10) {
      // At strict level, heavily penalize overexposed questions
      isEligible = false;
      reason = `Overexposed (${exposureCount} times), prefer less exposed questions`;
    }

    return {
      daysSinceLastUsed,
      exposureCount,
      isEligible,
      relaxationLevel,
      reason,
    };
  }

  /**
   * Get questions eligible under current anti-repeat rules
   */
  async getEligibleQuestions(
    criteria: SelectionCriteria,
    relaxationLevel: number = 0,
  ): Promise<Question[]> {
    const thresholds = [30, 21, 14, 10, 7];
    const dayThreshold = thresholds[relaxationLevel] || 0;

    // Build base query
    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .where('question.approved = :approved', { approved: true })
      .andWhere('question.disabled = :disabled', { disabled: false })
      .andWhere('question.difficulty = :difficulty', {
        difficulty: criteria.difficulty as unknown as string,
      });

    // Exclude specific questions
    if (criteria.excludeQuestionIds.length > 0) {
      queryBuilder.andWhere('question.id NOT IN (:...excludeIds)', {
        excludeIds: criteria.excludeQuestionIds as unknown as string[],
      });
    }

    // Apply anti-repeat logic based on relaxation level
    if (dayThreshold > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayThreshold);

      queryBuilder.andWhere(
        '(question.lastUsedAt IS NULL OR question.lastUsedAt < :cutoffDate)',
        { cutoffDate },
      );
    }

    // Apply exposure bias at strict levels
    if (relaxationLevel === 0 && criteria.maxExposureCount) {
      queryBuilder.andWhere('question.exposureCount <= :maxExposure', {
        maxExposure: criteria.maxExposureCount as unknown as number,
      });
    }

    // Theme preferences
    if (criteria.preferredThemes && criteria.preferredThemes.length > 0) {
      queryBuilder.andWhere('question.themes_json::jsonb ?| :themes', {
        themes: criteria.preferredThemes,
      });
    }

    // Subject diversity
    if (criteria.subjectDiversity && criteria.subjectDiversity.length > 0) {
      queryBuilder.andWhere(
        'NOT (question.subjects_json::jsonb ?| :subjects)',
        { subjects: criteria.subjectDiversity },
      );
    }

    // Order by anti-repeat priority
    queryBuilder
      .addOrderBy('question.exposureCount', 'ASC') // Prefer less exposed
      .addOrderBy('question.lastUsedAt', 'ASC', 'NULLS FIRST') // Prefer older or never used
      .addOrderBy('RANDOM()'); // Final randomization

    const questions = await queryBuilder.getMany();

    this.logger.debug(
      `Found ${questions.length} eligible questions for difficulty ${criteria.difficulty} ` +
        `at relaxation level ${relaxationLevel} (${dayThreshold} day threshold)`,
    );

    return questions;
  }

  /**
   * Update question usage tracking after selection
   */
  async updateQuestionUsage(
    questionIds: string[],
    usedAt: Date,
  ): Promise<void> {
    if (questionIds.length === 0) return;

    await this.questionRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        lastUsedAt: usedAt,
        exposureCount: () => 'exposure_count + 1',
      })
      .where('id IN (:...ids)', { ids: questionIds })
      .execute();

    this.logger.debug(
      `Updated usage tracking for ${questionIds.length} questions`,
    );
  }

  /**
   * Get statistics about question availability for debugging
   */
  async getAvailabilityStats(difficulty: Difficulty): Promise<{
    total: number;
    available: { [relaxationLevel: number]: number };
    averageExposure: number;
    oldestLastUsed: Date | null;
  }> {
    const totalQuery = (await this.questionRepository
      .createQueryBuilder('question')
      .select('COUNT(*)', 'total')
      .addSelect('AVG(question.exposureCount)', 'avgExposure')
      .addSelect('MIN(question.lastUsedAt)', 'oldestLastUsed')
      .where('question.approved = :approved', { approved: true })
      .andWhere('question.disabled = :disabled', { disabled: false })
      .andWhere('question.difficulty = :difficulty', {
        difficulty: difficulty as unknown as string,
      })
      .getRawOne()) as {
      total: string;
      avgExposure: string;
      oldestLastUsed: Date | null;
    };

    const total = parseInt(totalQuery.total) || 0;
    const averageExposure = parseFloat(totalQuery.avgExposure) || 0;
    const oldestLastUsed = totalQuery.oldestLastUsed;

    // Check availability at each relaxation level
    const available: { [relaxationLevel: number]: number } = {};
    const thresholds = [30, 21, 14, 10, 7];

    for (let level = 0; level < thresholds.length; level++) {
      const dayThreshold = thresholds[level];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayThreshold);

      const count = await this.questionRepository
        .createQueryBuilder('question')
        .where('question.approved = :approved', { approved: true })
        .andWhere('question.disabled = :disabled', { disabled: false })
        .andWhere('question.difficulty = :difficulty', {
          difficulty: difficulty as unknown as string,
        })
        .andWhere(
          '(question.lastUsedAt IS NULL OR question.lastUsedAt < :cutoffDate)',
          { cutoffDate },
        )
        .getCount();

      available[level] = count;
    }

    return {
      total,
      available,
      averageExposure,
      oldestLastUsed,
    };
  }
}
