import { DailyQuizMode } from '../../../enums/daily-quiz-mode.enum';
import { QuestionTheme } from '../../../enums/question-theme.enum';
import { Difficulty, QuestionType } from '../../../enums/question.enums';
import { Question } from '../../../entities/question.entity';
import { DailyQuiz } from '../../../entities/daily-quiz.entity';

/**
 * Configuration for daily quiz composition
 */
export interface ComposerConfig {
  /** Target number of questions per daily quiz */
  targetQuestionCount: number;
  /** Difficulty distribution target */
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  /** Anti-repeat relaxation schedule in days */
  antiRepeatDays: {
    strict: number; // 30 days - no repeats
    relaxed1: number; // 21 days - minimal repeats
    relaxed2: number; // 14 days - some repeats allowed
    relaxed3: number; // 10 days - more repeats allowed
    final: number; // 7 days - any question allowed
  };
  /** Maximum exposure bias threshold */
  maxExposureBias: number;
  /** Theme diversity requirements */
  themeDiversity: {
    minUniqueThemes: number;
    maxThemeOverlap: number;
  };
}

/**
 * Theme plan for quiz composition
 */
export interface ThemePlan {
  mode: DailyQuizMode;
  themes: QuestionTheme[];
  weights?: Record<string, number>;
  spotlight?: QuestionTheme;
  event?: string;
  subjectRestrictions?: string[];
}

/**
 * Question selection criteria with relaxation
 */
export interface SelectionCriteria {
  difficulty: Difficulty;
  excludeQuestionIds: string[];
  maxDaysSinceLastUsed: number;
  preferredThemes?: QuestionTheme[];
  subjectDiversity?: string[];
  maxExposureCount?: number;
}

/**
 * Result of question selection process
 */
export interface SelectionResult {
  questions: Question[];
  metadata: {
    relaxationLevel: number;
    averageExposureCount: number;
    themeDistribution: Record<string, number>;
    subjectDistribution: Record<string, number>;
    warnings: string[];
  };
}

/**
 * Template data for CDN generation
 */
export interface QuizTemplate {
  id: string;
  dropAtUTC: string;
  mode: DailyQuizMode;
  themePlan: ThemePlan;
  questions: TemplateQuestion[];
  version: number;
  metadata: {
    generatedAt: string;
    totalQuestions: number;
    difficultyBreakdown: Record<Difficulty, number>;
    themeBreakdown: Record<string, number>;
  };
}

/**
 * Template question (without answers)
 */
export interface TemplateQuestion {
  id: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  themes: QuestionTheme[];
  subjects: string[];
  prompt: any; // AnyPrompt but without type import complexity
  choices?: any[];
  media?: any[];
  orderIndex: number;
}

/**
 * Daily quiz composition result
 */
export interface CompositionResult {
  dailyQuiz: DailyQuiz;
  questions: Question[];
  template: QuizTemplate;
  compositionLog: CompositionLog;
}

/**
 * Detailed composition log for monitoring and debugging
 */
export interface CompositionLog {
  timestamp: Date;
  targetDate: Date;
  mode: DailyQuizMode;
  themePlan: ThemePlan;
  selectionProcess: {
    difficulty: Difficulty;
    attempted: number;
    selected: number;
    relaxationLevel: number;
    issues: string[];
  }[];
  finalSelection: {
    totalQuestions: number;
    difficultyActual: Record<Difficulty, number>;
    difficultyTarget: Record<Difficulty, number>;
    themeDistribution: Record<string, number>;
    averageExposure: number;
    oldestLastUsed: Date | null;
    newestLastUsed: Date | null;
  };
  warnings: string[];
  performance: {
    durationMs: number;
    dbQueries: number;
  };
}

/**
 * Anti-repeat calculation result
 */
export interface AntiRepeatInfo {
  daysSinceLastUsed: number | null;
  exposureCount: number;
  isEligible: boolean;
  relaxationLevel: number;
  reason?: string;
}
