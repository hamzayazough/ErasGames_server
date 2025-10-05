// lib/types/api.types.ts

// Common types
export interface User {
  id: string;
  email?: string;
  name?: string;
  handle?: string;
  role: string;
  status: string;
}

export interface Question {
  id: string;
  questionType: string;
  difficulty: string;
  themesJSON: string[];
  subjectsJSON: string[];
  promptJSON: {
    task: string;
    [key: string]: unknown;
  };
  choicesJSON: Array<{
    id: string;
    text: string;
    [key: string]: unknown;
  }> | null;
  correctJSON: {
    [key: string]: unknown;
  } | null;
  mediaJSON?: Array<{
    type: string;
    url: string;
    [key: string]: unknown;
  }> | null;
  approved: boolean;
  disabled: boolean;
  exposureCount: number;
  lastUsedAt: string | null;
  updatedAt: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalQuizzes: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyQuiz {
  id: string;
  dropAtUTC: string;
  mode: string;
  templateCdnUrl?: string;
  createdAt: string;
  questions: Question[];
}

// Admin Daily Quiz types
export interface ComposerConfig {
  maxExposure?: number;
  themeWeights?: Record<string, number>;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface ComposeDailyQuizRequest {
  dropAtUTC: string;
  mode?: string;
  config?: Partial<ComposerConfig>;
}

export interface ComposeDailyQuizResponse {
  quizId: string;
  questionCount: number;
  template: {
    version: string;
    cdnUrl?: string;
    size: number;
  };
  composition: {
    relaxationLevel: number;
    themeDistribution: Record<string, number>;
    difficultyActual: Record<string, number>;
    warnings: string[];
    performanceMs: number;
  };
}

export interface QuestionAvailability {
  totalQuestions: number;
  byDifficulty: Record<string, number>;
  byTheme: Record<string, number>;
  byType: Record<string, number>;
}

// Job types
export interface JobStatus {
  dailyComposition: {
    isRunning: boolean;
    nextRun?: string;
    lastRun?: string;
    status: string;
  };
  templateWarmup: {
    isRunning: boolean;
    lastRun?: string;
    status: string;
  };
}

// Season types
export interface CreateSeasonDto {
  name: string;
  startDate: string;
  endDate: string;
  totalQuizzes: number;
}

export interface SeasonStats {
  season: Season;
  totalParticipants: number;
  totalQuizzesDelivered: number;
  averageParticipationRate: number;
  topScore: number;
}

// Question creation types
export interface QuestionCreationDto {
  questionType: string;
  difficulty: string;
  themes: string[];
  subjects: string[];
  prompt: {
    task: string;
    [key: string]: unknown;
  };
  choices?: Array<{
    id: string;
    text: string;
  }>;
  mediaRefs?: Array<{
    type: string;
    url: string;
  }>;
  correct?: {
    [key: string]: unknown;
  };
}

export interface QuestionStats {
  total: number;
  approved: number;
  pending: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
}

// Daily Quiz types
export interface DailyQuiz {
  id: string;
  dropAtUTC: string;
  mode: string;
  themePlan: Record<string, unknown>;
  questionCount: number;
  templateCdnUrl: string;
  templateVersion: number;
  notificationSent: boolean;
  createdAt: string;
  isReady: boolean;
  status: "ready" | "pending_template";
}

export interface ComposeDailyQuizRequest {
  dropAtUTC: string;
  mode?: string;
  config?: Record<string, unknown>;
}

export interface ComposeDailyQuizResponse {
  success: boolean;
  data?: {
    quizId: string;
    questionCount: number;
    template: {
      version: number;
      cdnUrl: string;
      size: number;
    };
    composition: {
      relaxationLevel: number;
      themeDistribution: Record<string, number>;
      difficultyActual: Record<string, number>;
      warnings: string[];
      performanceMs: number;
    };
  };
  message: string;
}

export interface QuestionAvailability {
  success: boolean;
  data: {
    totalQuizzes: number;
    averageRelaxationLevel: number;
    themeDistribution: Record<string, number>;
    recentWarnings: string[];
    byDifficulty: Record<string, number>;
  };
  message: string;
}

export interface JobStatus {
  success: boolean;
  data: {
    composer: {
      lastRun: string | null;
      nextRun: string;
      status: string;
    };
    template: {
      lastRun: string | null;
      nextRun: string;
      status: string;
    };
  };
  message: string;
}
