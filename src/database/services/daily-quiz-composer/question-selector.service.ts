import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { Difficulty } from '../../enums/question.enums';
import { QuestionTheme } from '../../enums/question-theme.enum';
import {
  SelectionCriteria,
  SelectionResult,
  ThemePlan,
  ComposerConfig,
  DifficultyAvailabilityStats,
} from './interfaces/composer.interfaces';
import { AntiRepeatService } from './anti-repeat.service';
import { DifficultyDistributionService } from './difficulty-distribution.service';
import { DailyQuizMode } from 'src/database/enums/daily-quiz-mode.enum';

/**
 * Service for intelligent question selection with theme diversity and anti-repeat logic
 *
 * Implements the pickWithRelaxation() algorithm:
 * 1. Try strict anti-repeat rules (30 days)
 * 2. Progressively relax constraints (21→14→10→7 days)
 * 3. Ensure theme and subject diversity
 * 4. Apply exposure bias to prefer less-used questions
 */
@Injectable()
export class QuestionSelectorService {
  private readonly logger = new Logger(QuestionSelectorService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly antiRepeatService: AntiRepeatService,
    private readonly difficultyService: DifficultyDistributionService,
  ) {}

  /**
   * Main question selection method with progressive relaxation
   */
  async selectQuestionsForDailyQuiz(
    config: ComposerConfig,
    themePlan: ThemePlan,
  ): Promise<SelectionResult> {
    this.logger.log(`Starting question selection for ${themePlan.mode} quiz`);

    // Get target difficulty distribution
    const difficultyDistribution = this.difficultyService.getTargetDistribution(
      config.targetQuestionCount,
    );

    const selectedQuestions: Question[] = [];
    const selectionMetadata = {
      relaxationLevel: 0,
      averageExposureCount: 0,
      themeDistribution: {} as Record<string, number>,
      subjectDistribution: {} as Record<string, number>,
      warnings: [] as string[],
    };

    // Track used subjects for diversity
    const usedSubjects: string[] = [];
    const usedThemes: string[] = [];

    // Select questions for each difficulty level
    for (const difficulty of Object.values(Difficulty)) {
      const targetCount = difficultyDistribution[difficulty];
      if (targetCount === 0) continue;

      this.logger.debug(
        `Selecting ${targetCount} ${String(difficulty)} questions`,
      );

      const difficultyQuestions = await this.selectQuestionsForDifficulty(
        difficulty,
        targetCount,
        themePlan,
        config,
        usedSubjects,
        usedThemes,
        selectedQuestions.map((q) => q.id),
      );

      selectedQuestions.push(...difficultyQuestions.questions);
      selectionMetadata.warnings.push(...difficultyQuestions.warnings);

      // Update relaxation level to the highest used
      selectionMetadata.relaxationLevel = Math.max(
        selectionMetadata.relaxationLevel,
        difficultyQuestions.relaxationLevel,
      );

      // Update diversity tracking
      this.updateDiversityTracking(
        difficultyQuestions.questions,
        usedSubjects,
        usedThemes,
      );
    }

    // Calculate final metadata
    selectionMetadata.averageExposureCount =
      this.calculateAverageExposure(selectedQuestions);
    selectionMetadata.themeDistribution =
      this.calculateThemeDistribution(selectedQuestions);
    selectionMetadata.subjectDistribution =
      this.calculateSubjectDistribution(selectedQuestions);

    this.logger.log(
      `Selected ${selectedQuestions.length}/${config.targetQuestionCount} questions ` +
        `at relaxation level ${selectionMetadata.relaxationLevel}`,
    );

    return {
      questions: selectedQuestions,
      metadata: selectionMetadata,
    };
  }

  /**
   * Select questions for a specific difficulty with progressive relaxation
   */
  private async selectQuestionsForDifficulty(
    difficulty: Difficulty,
    targetCount: number,
    themePlan: ThemePlan,
    config: ComposerConfig,
    usedSubjects: string[],
    usedThemes: string[],
    excludeQuestionIds: string[],
  ): Promise<{
    questions: Question[];
    relaxationLevel: number;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const selectedQuestions: Question[] = [];
    let relaxationLevel = 0;

    // Progressive relaxation: try each level until we get enough questions
    const maxRelaxationLevels = 5; // 30→21→14→10→7 days

    for (
      let level = 0;
      level < maxRelaxationLevels && selectedQuestions.length < targetCount;
      level++
    ) {
      this.logger.debug(
        `Trying relaxation level ${level} for ${String(difficulty)} questions ` +
          `(need ${targetCount - selectedQuestions.length} more)`,
      );

      const criteria: SelectionCriteria = {
        difficulty,
        excludeQuestionIds: [
          ...excludeQuestionIds,
          ...selectedQuestions.map((q) => q.id),
        ],
        maxDaysSinceLastUsed: this.getRelaxationDays(level),
        preferredThemes: this.getPreferredThemes(themePlan),
        subjectDiversity: [...usedSubjects],
        maxExposureCount: level === 0 ? config.maxExposureBias : undefined,
      };

      const candidates = await this.antiRepeatService.getEligibleQuestions(
        criteria,
        level,
      );

      if (candidates.length === 0) {
        warnings.push(
          `No eligible ${String(difficulty)} questions at relaxation level ${level}`,
        );
        continue;
      }

      // Apply theme and diversity filtering
      const filteredCandidates = this.applyThemeAndDiversityFiltering(
        candidates,
        themePlan,
        usedThemes,
        usedSubjects,
        config,
      );

      if (filteredCandidates.length === 0) {
        warnings.push(
          `No ${String(difficulty)} questions passed theme/diversity filtering at level ${level}`,
        );
        continue;
      }

      // Select from filtered candidates
      const needed = targetCount - selectedQuestions.length;
      const toSelect = Math.min(needed, filteredCandidates.length);

      // Prefer questions with lower exposure counts
      const sortedCandidates = filteredCandidates.sort((a, b) => {
        const aExposure = a.exposureCount || 0;
        const bExposure = b.exposureCount || 0;
        return aExposure - bExposure;
      });

      const newSelections = sortedCandidates.slice(0, toSelect);
      selectedQuestions.push(...newSelections);
      relaxationLevel = level;

      this.logger.debug(
        `Selected ${newSelections.length} ${String(difficulty)} questions at level ${level}`,
      );

      if (selectedQuestions.length >= targetCount) break;
    }

    // Final fallback: emergency selection if still insufficient
    if (selectedQuestions.length < targetCount) {
      warnings.push(
        `Emergency fallback: only found ${selectedQuestions.length}/${targetCount} ` +
          `${String(difficulty)} questions after all relaxation levels`,
      );

      const emergency = await this.emergencyQuestionSelection(
        difficulty,
        targetCount - selectedQuestions.length,
        excludeQuestionIds,
        selectedQuestions.map((q) => q.id),
      );

      selectedQuestions.push(...emergency);
      relaxationLevel = maxRelaxationLevels;
    }

    return {
      questions: selectedQuestions,
      relaxationLevel,
      warnings,
    };
  }

  /**
   * Get relaxation threshold in days for a given level
   */
  private getRelaxationDays(level: number): number {
    const thresholds = [30, 21, 14, 10, 7];
    return thresholds[level] || 0;
  }

  /**
   * Extract preferred themes from theme plan
   */
  private getPreferredThemes(themePlan: ThemePlan): QuestionTheme[] {
    if (themePlan.spotlight) {
      return [themePlan.spotlight];
    }
    return themePlan.themes || [];
  }

  /**
   * Apply theme and diversity filtering to candidate questions
   */
  private applyThemeAndDiversityFiltering(
    candidates: Question[],
    themePlan: ThemePlan,
    usedThemes: string[],
    usedSubjects: string[],
    config: ComposerConfig,
  ): Question[] {
    let filtered = candidates;

    // Theme filtering based on quiz mode
    if (themePlan.mode === DailyQuizMode.SPOTLIGHT && themePlan.spotlight) {
      // Spotlight mode: strongly prefer the spotlight theme
      const spotlightQuestions = filtered.filter((q) =>
        (q.themesJSON as unknown as QuestionTheme[])?.includes(
          themePlan.spotlight as QuestionTheme,
        ),
      );

      if (spotlightQuestions.length > 0) {
        filtered = spotlightQuestions;
      }
    } else if (themePlan.themes && themePlan.themes.length > 0) {
      // Mix/Event mode: prefer questions matching any preferred theme
      const preferredThemeQuestions = filtered.filter((q) => {
        const questionThemes =
          (q.themesJSON as unknown as QuestionTheme[]) || [];
        return questionThemes.some((theme) =>
          themePlan.themes?.includes(theme),
        );
      });

      // Use preferred themes if available, otherwise use all candidates
      if (preferredThemeQuestions.length > 0) {
        filtered = preferredThemeQuestions;
      }
    }

    // Subject diversity filtering
    if (config.themeDiversity.minUniqueThemes > 0) {
      // Prefer questions that introduce new themes
      const newThemeQuestions = filtered.filter((q) => {
        const questionThemes = (q.themesJSON as unknown as string[]) || [];
        return questionThemes.some((theme) => !usedThemes.includes(theme));
      });

      if (
        newThemeQuestions.length > 0 &&
        usedThemes.length >= config.themeDiversity.minUniqueThemes
      ) {
        filtered = newThemeQuestions;
      }
    }

    // Subject overlap filtering
    if (config.themeDiversity.maxThemeOverlap > 0) {
      // Avoid questions with too many overlapping subjects
      filtered = filtered.filter((q) => {
        const questionSubjects = (q.subjectsJSON as unknown as string[]) || [];
        const overlapCount = questionSubjects.filter((subject) =>
          usedSubjects.includes(subject),
        ).length;

        return overlapCount <= config.themeDiversity.maxThemeOverlap;
      });
    }

    return filtered;
  }

  /**
   * Emergency question selection when all other methods fail
   */
  private async emergencyQuestionSelection(
    difficulty: Difficulty,
    count: number,
    excludeQuestionIds: string[],
    alreadySelectedIds: string[],
  ): Promise<Question[]> {
    this.logger.warn(
      `Emergency selection: need ${count} ${String(difficulty)} questions`,
    );

    const allExcluded = [...excludeQuestionIds, ...alreadySelectedIds];

    const emergencyQuestions = await this.questionRepository
      .createQueryBuilder('question')
      .where('question.approved = :approved', { approved: true })
      .andWhere('question.disabled = :disabled', { disabled: false })
      .andWhere('question.difficulty = :difficulty', {
        difficulty: difficulty as unknown as string,
      })
      .andWhere('question.id NOT IN (:...excludeIds)', {
        excludeIds: allExcluded,
      })
      .orderBy('question.exposureCount', 'ASC')
      .addOrderBy('question.lastUsedAt', 'ASC', 'NULLS FIRST')
      .limit(count)
      .getMany();

    this.logger.warn(
      `Emergency selection found ${emergencyQuestions.length}/${count} questions`,
    );

    return emergencyQuestions;
  }

  /**
   * Update diversity tracking arrays
   */
  private updateDiversityTracking(
    questions: Question[],
    usedSubjects: string[],
    usedThemes: string[],
  ): void {
    for (const question of questions) {
      const themes = (question.themesJSON as unknown as string[]) || [];
      const subjects = (question.subjectsJSON as unknown as string[]) || [];

      for (const theme of themes) {
        if (!usedThemes.includes(theme)) {
          usedThemes.push(theme);
        }
      }

      for (const subject of subjects) {
        if (!usedSubjects.includes(subject)) {
          usedSubjects.push(subject);
        }
      }
    }
  }

  /**
   * Calculate average exposure count of selected questions
   */
  private calculateAverageExposure(questions: Question[]): number {
    if (questions.length === 0) return 0;

    const totalExposure = questions.reduce((sum, q) => {
      return sum + (q.exposureCount || 0);
    }, 0);

    return totalExposure / questions.length;
  }

  /**
   * Calculate theme distribution of selected questions
   */
  private calculateThemeDistribution(
    questions: Question[],
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const question of questions) {
      const themes = (question.themesJSON as unknown as string[]) || [];
      for (const theme of themes) {
        distribution[theme] = (distribution[theme] || 0) + 1;
      }
    }

    return distribution;
  }

  /**
   * Calculate subject distribution of selected questions
   */
  private calculateSubjectDistribution(
    questions: Question[],
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const question of questions) {
      const subjects = (question.subjectsJSON as unknown as string[]) || [];
      for (const subject of subjects) {
        distribution[subject] = (distribution[subject] || 0) + 1;
      }
    }

    return distribution;
  }

  /**
   * Get availability statistics for all difficulties
   */
  async getQuestionAvailability(): Promise<DifficultyAvailabilityStats> {
    const stats = {} as DifficultyAvailabilityStats;

    for (const difficulty of Object.values(Difficulty)) {
      stats[difficulty] =
        await this.antiRepeatService.getAvailabilityStats(difficulty);
    }

    return stats;
  }
}
