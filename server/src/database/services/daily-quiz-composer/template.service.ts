import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { Question as QuestionInterface } from '../../entities/questions/question.interface';
import { DailyQuiz } from '../../entities/daily-quiz.entity';
import { QuizTemplate, ThemePlan } from './interfaces/composer.interfaces';
import { Difficulty } from '../../enums/question.enums';
import { CdnService } from './cdn.service';

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

  constructor(
    private readonly configService: ConfigService,
    private readonly cdnService: CdnService,
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
  ) {}

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

    // Convert to sanitized questions (stripping answers)
    const templateQuestions = sortedQuestions.map((question, index) =>
      this.sanitizeQuestionForTemplate(question, index),
    );

    // Generate difficulty and theme breakdowns
    const difficultyBreakdown = this.calculateDifficultyBreakdown(questions);
    const themeBreakdown = this.calculateThemeBreakdown(questions);

    const template: QuizTemplate = {
      id: dailyQuiz.id,
      dropAtUTC: dailyQuiz.dropAtUTC.toISOString(),
      mode: themePlan.mode,
      themePlan: themePlan,
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
   * Sanitize a Question entity for template use (remove answers and map to client interface)
   */
  private sanitizeQuestionForTemplate(
    question: Question,
    orderIndex: number,
  ): QuestionInterface {
    // Map from entity structure to client interface structure
    const sanitized: QuestionInterface = {
      id: question.id,
      questionType: question.questionType,
      difficulty: question.difficulty,
      themes: question.themesJSON || [],
      subjects: question.subjectsJSON || [],
      prompt: question.promptJSON,
      choices: question.choicesJSON || undefined,
      mediaRefs: question.mediaJSON || undefined,
      orderIndex,
      // Explicitly exclude correctJSON and other sensitive fields
      // correct: undefined - don't include answer data
    };

    return sanitized;
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
    const cdnBaseUrl = this.getCdnBaseUrl();
    const dateStr = dailyQuiz.dropAtUTC.toISOString().split('T')[0]; // YYYY-MM-DD

    return `${cdnBaseUrl}/quiz/${dateStr}/v${version}.json`;
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
      if (question.mediaRefs) {
        mediaCount += question.mediaRefs.length;
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

  /**
   * Upload template to CDN and update database with URL
   */
  async uploadTemplate(
    dailyQuiz: DailyQuiz,
    template: QuizTemplate,
  ): Promise<{ templateUrl: string; version: number }> {
    try {
      // Generate template key for S3
      const templateKey = this.cdnService.generateTemplateKey(
        dailyQuiz.id,
        template.version,
      );

      // Format template for CDN delivery
      const templateJson = this.formatTemplateForCdn(template);

      this.logger.debug(`Uploading template to S3: ${templateKey}`);

      // Upload to S3/CloudFront
      const { templateUrl } = await this.cdnService.uploadTemplate(
        templateKey,
        templateJson,
      );

      // Update database with CDN URL
      await this.dailyQuizRepository.update(dailyQuiz.id, {
        templateCdnUrl: templateUrl,
        templateVersion: template.version,
      });

      this.logger.log(
        `Template uploaded successfully for quiz ${dailyQuiz.id}: ${templateUrl}`,
      );

      return {
        templateUrl,
        version: template.version,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload template for quiz ${dailyQuiz.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Format template for CDN delivery with client shuffle configuration
   */
  private formatTemplateForCdn(template: QuizTemplate) {
    return {
      dailyQuizId: template.id,
      version: template.version,
      questions: template.questions.map((q) => ({
        qid: q.id,
        type: q.questionType,
        payload: {
          prompt: q.prompt,

          choices: q.choices,

          media: q.mediaRefs,
          themes: q.themes,
          difficulty: q.difficulty,
        },
      })),
      clientShuffle: {
        algo: 'xorshift',
        fields: ['questions', 'choices'],
      },
      metadata: template.metadata,
    };
  }

  /**
   * Get CDN base URL from configuration
   */
  private getCdnBaseUrl(): string {
    return this.cdnService.getCdnBaseUrl();
  }

  /**
   * Build and upload template for a daily quiz
   */
  async buildAndUploadTemplate(
    dailyQuiz: DailyQuiz,
    questions: Question[],
    themePlan: ThemePlan,
  ): Promise<{ templateUrl: string; version: number }> {
    // Generate template
    const template = this.generateTemplate(dailyQuiz, questions, themePlan);

    // Validate template
    const validation = this.validateTemplate(template);
    if (!validation.isValid) {
      throw new Error(
        `Template validation failed: ${validation.issues.join(', ')}`,
      );
    }

    // Upload to CDN
    return this.uploadTemplate(dailyQuiz, template);
  }
}
