import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Question } from '../../entities/question.entity';
import { DailyQuiz } from '../../entities/daily-quiz.entity';
import {
  QuizTemplate,
  TemplateQuestion,
  ThemePlan,
} from './interfaces/composer.interfaces';
import { Difficulty } from '../../enums/question.enums';
import { AnyPrompt } from '../../entities/prompts/any-prompt.type';
import { Choice } from '../../entities/choices/choice.type';
import { MediaRef } from '../../entities/media/media-ref.interface';

/**
 * Service for generating CDN-ready quiz templates
 *
 * Creates immutable, versioned JSON templates that contain:
 * - Quiz metadata (id, mode, themes, drop time)
 * - Questions without answers (prompts, choices, media)
 * - Proper ordering and versioning for cache busting
 *
 * Templates are designed for efficient CDN delivery and client-side consumption.
 */
@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate a complete quiz template from selected questions
   */
  generateTemplate(
    dailyQuiz: DailyQuiz,
    questions: Question[],
    themePlan: ThemePlan,
  ): QuizTemplate {
    this.logger.debug(`Generating template for daily quiz ${dailyQuiz.id}`);

    // Sort questions by difficulty for consistent ordering
    const sortedQuestions = this.sortQuestionsByDifficulty(questions);

    // Convert to template questions (stripping answers)
    const templateQuestions = sortedQuestions.map((question, index) =>
      this.convertToTemplateQuestion(question, index),
    );

    // Generate difficulty and theme breakdowns
    const difficultyBreakdown = this.calculateDifficultyBreakdown(questions);
    const themeBreakdown = this.calculateThemeBreakdown(questions);

    const template: QuizTemplate = {
      id: dailyQuiz.id,
      dropAtUTC: dailyQuiz.dropAtUTC.toISOString(),
      mode: themePlan.mode as unknown as QuizTemplate['mode'],
      themePlan: themePlan as unknown as QuizTemplate['themePlan'],
      questions: templateQuestions,
      version: dailyQuiz.templateVersion,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        difficultyBreakdown,
        themeBreakdown,
      },
    };

    this.logger.debug(
      `Generated template v${template.version} with ${template.questions.length} questions`,
    );

    return template;
  }

  /**
   * Sort questions by difficulty for consistent ordering
   * Order: Easy -> Medium -> Hard, with randomization within each difficulty
   */
  private sortQuestionsByDifficulty(questions: Question[]): Question[] {
    const difficultyOrder = {
      [Difficulty.EASY]: 1,
      [Difficulty.MEDIUM]: 2,
      [Difficulty.HARD]: 3,
    };

    return questions.slice().sort((a, b) => {
      const aDifficulty = difficultyOrder[a.difficulty];
      const bDifficulty = difficultyOrder[b.difficulty];

      if (aDifficulty !== bDifficulty) {
        return aDifficulty - bDifficulty;
      }

      // Within same difficulty, maintain random order by using question ID
      return a.id.localeCompare(b.id);
    });
  }

  /**
   * Convert a Question entity to a TemplateQuestion (without answers)
   */
  private convertToTemplateQuestion(
    question: Question,
    orderIndex: number,
  ): TemplateQuestion {
    return {
      id: question.id,
      questionType:
        question.questionType as unknown as TemplateQuestion['questionType'],
      difficulty:
        question.difficulty as unknown as TemplateQuestion['difficulty'],
      themes:
        (question.themesJSON as unknown as TemplateQuestion['themes']) || [],
      subjects:
        (question.subjectsJSON as unknown as TemplateQuestion['subjects']) ||
        [],
      prompt: this.sanitizePrompt(question.promptJSON),
      choices: this.sanitizeChoices(question.choicesJSON as Choice[]),
      media: this.sanitizeMedia(question.mediaJSON as MediaRef[]),
      orderIndex,
    };
  }

  /**
   * Sanitize prompt data for client consumption
   */
  private sanitizePrompt(promptJSON: AnyPrompt | null): AnyPrompt | null {
    if (!promptJSON) return null;

    // Remove any server-side specific fields
    const sanitized = { ...promptJSON };

    // Remove internal fields that shouldn't be exposed to clients
    delete (sanitized as any).internalNotes;
    delete (sanitized as any).adminComments;
    delete (sanitized as any).scoringHints;

    return sanitized;
  }

  /**
   * Sanitize choices data (remove correct answer indicators)
   */
  private sanitizeChoices(choicesJSON: Choice[] | null): Choice[] | undefined {
    if (!choicesJSON || !Array.isArray(choicesJSON)) return undefined;

    return choicesJSON.map((choice) => {
      // Create a copy using JSON serialization to handle union types safely
      const sanitized = JSON.parse(JSON.stringify(choice)) as Record<
        string,
        any
      >;

      // Remove fields that indicate correct answers
      delete sanitized.isCorrect;
      delete sanitized.correctness;
      delete sanitized.weight;
      delete sanitized.explanation;

      return sanitized as Choice;
    });
  }

  /**
   * Sanitize media references
   */
  private sanitizeMedia(mediaJSON: MediaRef[] | null): MediaRef[] | undefined {
    if (!mediaJSON || !Array.isArray(mediaJSON)) return undefined;

    return mediaJSON.map((media) => {
      const sanitized = { ...media };

      // Remove internal media processing fields
      delete (sanitized as any).internalPath;
      delete (sanitized as any).processingStatus;
      delete (sanitized as any).adminNotes;

      return sanitized;
    });
  }

  /**
   * Calculate difficulty breakdown for metadata
   */
  private calculateDifficultyBreakdown(
    questions: Question[],
  ): Record<Difficulty, number> {
    const breakdown = {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    };

    for (const question of questions) {
      breakdown[question.difficulty]++;
    }

    return breakdown;
  }

  /**
   * Calculate theme breakdown for metadata
   */
  private calculateThemeBreakdown(
    questions: Question[],
  ): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const question of questions) {
      const themes = question.themesJSON || [];
      for (const theme of themes) {
        breakdown[String(theme)] = (breakdown[String(theme)] || 0) + 1;
      }
    }

    return breakdown;
  }

  /**
   * Generate CDN URL for the template
   */
  generateTemplateCdnUrl(
    dailyQuiz: DailyQuiz,
    version: number = dailyQuiz.templateVersion,
  ): string {
    const cdnDomain =
      this.configService.get<string>('CDN_DOMAIN') ||
      'https://cdn.erasgames.com';
    const dateStr = dailyQuiz.dropAtUTC.toISOString().split('T')[0]; // YYYY-MM-DD

    return `${cdnDomain}/quiz/${dateStr}/v${version}.json`;
  }

  /**
   * Validate template structure before CDN upload
   */
  validateTemplate(template: QuizTemplate): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Basic structure validation
    if (!template.id) issues.push('Template missing ID');
    if (!template.dropAtUTC) issues.push('Template missing drop time');
    if (!template.questions || template.questions.length === 0) {
      issues.push('Template has no questions');
    }
    if (template.version < 1) issues.push('Template version must be >= 1');

    // Question validation
    for (let i = 0; i < template.questions.length; i++) {
      const question = template.questions[i];
      const prefix = `Question ${i + 1}`;

      if (!question.id) issues.push(`${prefix}: missing ID`);
      if (!question.questionType) issues.push(`${prefix}: missing type`);
      if (!question.difficulty) issues.push(`${prefix}: missing difficulty`);
      if (!question.prompt) issues.push(`${prefix}: missing prompt`);
      if (question.orderIndex !== i)
        issues.push(`${prefix}: incorrect order index`);

      // Check for leaked answer data
      const questionStr = JSON.stringify(question);
      if (
        questionStr.includes('isCorrect') ||
        questionStr.includes('correctness') ||
        questionStr.includes('explanation')
      ) {
        issues.push(`${prefix}: contains answer data that should be stripped`);
      }
    }

    // Metadata validation
    if (template.metadata.totalQuestions !== template.questions.length) {
      issues.push('Metadata total questions mismatch');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get template statistics for monitoring
   */
  getTemplateStats(template: QuizTemplate): {
    size: number;
    questionTypes: Record<string, number>;
    mediaCount: number;
    averageChoicesPerQuestion: number;
  } {
    const templateStr = JSON.stringify(template);
    const size = new Blob([templateStr]).size;

    const questionTypes: Record<string, number> = {};
    let totalChoices = 0;
    let mediaCount = 0;

    for (const question of template.questions) {
      // Count question types
      const type = String(question.questionType);
      questionTypes[type] = (questionTypes[type] || 0) + 1;

      // Count choices
      if (question.choices) {
        totalChoices += question.choices.length;
      }

      // Count media references
      if (question.media) {
        mediaCount += question.media.length;
      }
    }

    const averageChoicesPerQuestion =
      template.questions.length > 0
        ? totalChoices / template.questions.length
        : 0;

    return {
      size,
      questionTypes,
      mediaCount,
      averageChoicesPerQuestion,
    };
  }
}
