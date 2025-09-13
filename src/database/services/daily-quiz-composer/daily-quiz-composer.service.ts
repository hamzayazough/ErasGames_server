import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DailyQuiz } from '../../entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../entities/daily-quiz-question.entity';
import { Question } from '../../entities/question.entity';
import { DailyQuizMode } from '../../enums/daily-quiz-mode.enum';
import { QuestionTheme } from '../../enums/question-theme.enum';
import {
  ComposerConfig,
  ThemePlan,
  CompositionResult,
  CompositionLog,
} from './interfaces/composer.interfaces';
import { QuestionSelectorService } from './question-selector.service';
import { DifficultyDistributionService } from './difficulty-distribution.service';
import { AntiRepeatService } from './anti-repeat.service';
import { TemplateService } from './template.service';

/**
 * Main Daily Quiz Composer Service
 *
 * Orchestrates the entire daily quiz composition process:
 * 1. Generates theme plan based on mode and date
 * 2. Selects questions using anti-repeat and diversity logic
 * 3. Creates DailyQuiz and DailyQuizQuestion records
 * 4. Generates CDN template
 * 5. Updates question usage tracking
 * 6. Provides comprehensive logging
 */
@Injectable()
export class DailyQuizComposerService {
  private readonly logger = new Logger(DailyQuizComposerService.name);

  private readonly defaultConfig: ComposerConfig = {
    targetQuestionCount: 6,
    difficultyDistribution: {
      easy: 3,
      medium: 2,
      hard: 1,
    },
    antiRepeatDays: {
      strict: 30,
      relaxed1: 21,
      relaxed2: 14,
      relaxed3: 10,
      final: 7,
    },
    maxExposureBias: 10,
    themeDiversity: {
      minUniqueThemes: 3,
      maxThemeOverlap: 2,
    },
  };

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly questionSelectorService: QuestionSelectorService,
    private readonly difficultyService: DifficultyDistributionService,
    private readonly antiRepeatService: AntiRepeatService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * Compose a complete daily quiz for a specific drop time
   */
  async composeDailyQuiz(
    dropAtUTC: Date,
    mode: DailyQuizMode = DailyQuizMode.MIX,
    customConfig?: Partial<ComposerConfig>,
  ): Promise<CompositionResult> {
    const startTime = Date.now();
    const config = { ...this.defaultConfig, ...customConfig };

    this.logger.log(
      `Starting daily quiz composition for ${dropAtUTC.toISOString()}`,
    );

    let compositionLog: CompositionLog;
    let dbQueries = 0;

    try {
      // Check if quiz already exists for this drop time
      const existingQuiz = await this.dailyQuizRepository.findOne({
        where: { dropAtUTC },
      });
      dbQueries++;

      if (existingQuiz) {
        throw new Error(
          `Daily quiz already exists for ${dropAtUTC.toISOString()}`,
        );
      }

      // Generate theme plan based on mode and date
      const themePlan = this.generateThemePlan(mode, dropAtUTC);

      // Get question availability stats for logging
      const availabilityStats =
        await this.questionSelectorService.getQuestionAvailability();
      dbQueries += Object.keys(availabilityStats).length;

      // Select questions using progressive relaxation
      const selectionResult =
        await this.questionSelectorService.selectQuestionsForDailyQuiz(
          config,
          themePlan,
          dropAtUTC,
        );
      dbQueries += 5; // Estimated queries for selection process

      if (selectionResult.questions.length === 0) {
        throw new Error('No questions could be selected for daily quiz');
      }

      // Create quiz and questions in a transaction
      const { dailyQuiz, quizQuestions } = await this.dataSource.transaction(
        async (transactionalEntityManager) => {
          // Create the daily quiz record
          const quiz = await this.createDailyQuizRecord(
            dropAtUTC,
            mode,
            themePlan,
            transactionalEntityManager,
          );

          // Create daily quiz question associations
          const questions = await this.createDailyQuizQuestions(
            quiz,
            selectionResult.questions,
            transactionalEntityManager,
          );

          return { dailyQuiz: quiz, quizQuestions: questions };
        },
      );
      dbQueries += 2; // Quiz creation + batch question insert

      // Generate CDN template
      const template = this.templateService.generateTemplate(
        dailyQuiz,
        selectionResult.questions,
        themePlan,
      );

      // Update template CDN URL in quiz record
      const cdnUrl = this.templateService.generateTemplateCdnUrl(dailyQuiz);
      await this.dailyQuizRepository.update(dailyQuiz.id, {
        templateCdnUrl: cdnUrl,
      });
      dbQueries++;

      // Update question usage tracking
      await this.antiRepeatService.updateQuestionUsage(
        selectionResult.questions.map((q) => q.id),
        dropAtUTC,
      );
      dbQueries++;

      // Build comprehensive composition log
      compositionLog = this.buildCompositionLog(
        dropAtUTC,
        mode,
        themePlan,
        config,
        selectionResult,
        availabilityStats,
        Date.now() - startTime,
        dbQueries,
      );

      this.logger.log(
        `Successfully composed daily quiz ${dailyQuiz.id} with ${selectionResult.questions.length} questions ` +
          `(relaxation level: ${selectionResult.metadata.relaxationLevel})`,
      );

      return {
        dailyQuiz,
        questions: selectionResult.questions,
        template,
        compositionLog,
      };
    } catch (error) {
      this.logger.error(
        `Failed to compose daily quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Build error composition log
      compositionLog = this.buildErrorCompositionLog(
        dropAtUTC,
        mode,
        config,
        error as Error,
        Date.now() - startTime,
        dbQueries,
      );

      throw error;
    }
  }

  /**
   * Generate theme plan based on quiz mode and date
   */
  private generateThemePlan(mode: DailyQuizMode, dropDate: Date): ThemePlan {
    const dayOfYear = this.getDayOfYear(dropDate);
    const dayOfWeek = dropDate.getDay();

    switch (mode) {
      case DailyQuizMode.MIX:
        return this.generateMixThemePlan(dayOfWeek, dayOfYear);

      case DailyQuizMode.SPOTLIGHT:
        return this.generateSpotlightThemePlan(dayOfYear);

      case DailyQuizMode.EVENT:
        return this.generateEventThemePlan(dropDate);

      default:
        return this.generateMixThemePlan(dayOfWeek, dayOfYear);
    }
  }

  /**
   * Generate mix mode theme plan (default)
   */
  private generateMixThemePlan(
    dayOfWeek: number,
    dayOfYear: number,
  ): ThemePlan {
    // Rotate through different theme combinations based on day
    const themeRotations = [
      [QuestionTheme.Lyrics, QuestionTheme.Albums, QuestionTheme.Timeline],
      [QuestionTheme.Audio, QuestionTheme.Songs, QuestionTheme.Career],
      [QuestionTheme.Aesthetic, QuestionTheme.Outfits, QuestionTheme.Tours],
      [QuestionTheme.Charts, QuestionTheme.Popularity, QuestionTheme.Events],
      [QuestionTheme.Trivia, QuestionTheme.Inspiration, QuestionTheme.Mood],
      [QuestionTheme.Mashups, QuestionTheme.Tracklist, QuestionTheme.Speed],
      [QuestionTheme.Visuals, QuestionTheme.Audio, QuestionTheme.Albums],
    ];

    const themes = themeRotations[dayOfWeek];

    return {
      mode: DailyQuizMode.MIX,
      themes,
      weights: {
        [themes[0]]: 2,
        [themes[1]]: 2,
        [themes[2]]: 2,
      },
    };
  }

  /**
   * Generate spotlight mode theme plan (focused on one theme)
   */
  private generateSpotlightThemePlan(dayOfYear: number): ThemePlan {
    const spotlightThemes = Object.values(QuestionTheme);
    const spotlightTheme = spotlightThemes[dayOfYear % spotlightThemes.length];

    return {
      mode: DailyQuizMode.SPOTLIGHT,
      themes: [spotlightTheme],
      spotlight: spotlightTheme,
      weights: {
        [spotlightTheme]: 6,
      },
    };
  }

  /**
   * Generate event mode theme plan (special occasions)
   */
  private generateEventThemePlan(dropDate: Date): ThemePlan {
    // Check for special dates/events
    const month = dropDate.getMonth() + 1; // 1-based
    const day = dropDate.getDate();

    // Taylor Swift's birthday (December 13)
    if (month === 12 && day === 13) {
      return {
        mode: DailyQuizMode.EVENT,
        themes: [
          QuestionTheme.Career,
          QuestionTheme.Timeline,
          QuestionTheme.Trivia,
        ],
        event: "Taylor Swift's Birthday",
        weights: {
          [QuestionTheme.Career]: 3,
          [QuestionTheme.Timeline]: 2,
          [QuestionTheme.Trivia]: 1,
        },
      };
    }

    // Album anniversaries, tour dates, etc. could be added here
    // For now, fall back to mix mode
    return this.generateMixThemePlan(
      dropDate.getDay(),
      this.getDayOfYear(dropDate),
    );
  }

  /**
   * Create the daily quiz database record
   */
  private async createDailyQuizRecord(
    dropAtUTC: Date,
    mode: DailyQuizMode,
    themePlan: ThemePlan,
    entityManager: any,
  ): Promise<DailyQuiz> {
    const quiz = entityManager.create(DailyQuiz, {
      dropAtUTC,
      mode,
      themePlanJSON: themePlan,
      templateVersion: 1,
      templateCdnUrl: '', // Will be updated after template generation
    });

    return await entityManager.save(quiz);
  }

  /**
   * Create daily quiz question association records
   */
  private async createDailyQuizQuestions(
    dailyQuiz: DailyQuiz,
    questions: Question[],
    entityManager: any,
  ): Promise<DailyQuizQuestion[]> {
    const quizQuestions = questions.map((question) => {
      return entityManager.create(DailyQuizQuestion, {
        dailyQuiz,
        question,
        difficulty: question.difficulty,
        questionType: question.questionType,
      });
    });

    return await entityManager.save(DailyQuizQuestion, quizQuestions);
  }

  /**
   * Build comprehensive composition log
   */
  private buildCompositionLog(
    targetDate: Date,
    mode: DailyQuizMode,
    themePlan: ThemePlan,
    config: ComposerConfig,
    selectionResult: any,
    availabilityStats: any,
    durationMs: number,
    dbQueries: number,
  ): CompositionLog {
    return {
      timestamp: new Date(),
      targetDate,
      mode,
      themePlan,
      selectionProcess: this.buildSelectionProcessLog(selectionResult, config),
      finalSelection: {
        totalQuestions: selectionResult.questions.length,
        difficultyActual: this.calculateActualDifficulty(
          selectionResult.questions,
        ),
        difficultyTarget: config.difficultyDistribution,
        themeDistribution: selectionResult.metadata.themeDistribution,
        averageExposure: selectionResult.metadata.averageExposureCount,
        oldestLastUsed: this.findOldestLastUsed(selectionResult.questions),
        newestLastUsed: this.findNewestLastUsed(selectionResult.questions),
      },
      warnings: selectionResult.metadata.warnings,
      performance: {
        durationMs,
        dbQueries,
      },
    };
  }

  /**
   * Build error composition log
   */
  private buildErrorCompositionLog(
    targetDate: Date,
    mode: DailyQuizMode,
    config: ComposerConfig,
    error: Error,
    durationMs: number,
    dbQueries: number,
  ): CompositionLog {
    return {
      timestamp: new Date(),
      targetDate,
      mode,
      themePlan: { mode, themes: [] },
      selectionProcess: [
        {
          difficulty: 'easy' as any,
          attempted: 0,
          selected: 0,
          relaxationLevel: 0,
          issues: [error.message],
        },
      ],
      finalSelection: {
        totalQuestions: 0,
        difficultyActual: { easy: 0, medium: 0, hard: 0 },
        difficultyTarget: config.difficultyDistribution,
        themeDistribution: {},
        averageExposure: 0,
        oldestLastUsed: null,
        newestLastUsed: null,
      },
      warnings: [error.message],
      performance: {
        durationMs,
        dbQueries,
      },
    };
  }

  /**
   * Helper methods for log building
   */
  private buildSelectionProcessLog(
    selectionResult: any,
    config: ComposerConfig,
  ): any[] {
    return Object.values(config.difficultyDistribution).map(
      (targetCount, index) => ({
        difficulty: ['easy', 'medium', 'hard'][index],
        attempted: targetCount,
        selected: Math.min(targetCount, selectionResult.questions.length),
        relaxationLevel: selectionResult.metadata.relaxationLevel,
        issues: selectionResult.metadata.warnings,
      }),
    );
  }

  private calculateActualDifficulty(
    questions: Question[],
  ): Record<string, number> {
    const actual = { easy: 0, medium: 0, hard: 0 };
    for (const question of questions) {
      const difficulty = String(question.difficulty);
      if (difficulty in actual) {
        (actual as any)[difficulty]++;
      }
    }
    return actual;
  }

  private findOldestLastUsed(questions: Question[]): Date | null {
    let oldest: Date | null = null;
    for (const question of questions) {
      const lastUsed = question.lastUsedAt;
      if (lastUsed && (!oldest || lastUsed < oldest)) {
        oldest = lastUsed;
      }
    }
    return oldest;
  }

  private findNewestLastUsed(questions: Question[]): Date | null {
    let newest: Date | null = null;
    for (const question of questions) {
      const lastUsed = question.lastUsedAt;
      if (lastUsed && (!newest || lastUsed > newest)) {
        newest = lastUsed;
      }
    }
    return newest;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get composition statistics for monitoring
   */
  async getCompositionStats(): Promise<{
    totalQuizzes: number;
    averageRelaxationLevel: number;
    themeDistribution: Record<string, number>;
    recentWarnings: string[];
  }> {
    // This would typically query composition logs from a separate table
    // For now, return basic stats from daily_quiz table
    const totalQuizzes = await this.dailyQuizRepository.count();

    return {
      totalQuizzes,
      averageRelaxationLevel: 0, // Would be calculated from logs
      themeDistribution: {}, // Would be calculated from logs
      recentWarnings: [], // Would be from recent composition logs
    };
  }

  /**
   * Validate quiz composition before finalization
   */
  private validateComposition(
    questions: Question[],
    config: ComposerConfig,
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (questions.length === 0) {
      issues.push('No questions selected');
    }

    if (questions.length < config.targetQuestionCount * 0.5) {
      issues.push(
        `Too few questions: ${questions.length}/${config.targetQuestionCount}`,
      );
    }

    // Check for duplicate questions
    const ids = questions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      issues.push('Duplicate questions detected');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
