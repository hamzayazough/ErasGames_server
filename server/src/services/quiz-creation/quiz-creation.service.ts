import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyQuiz } from '../../database/entities/daily-quiz.entity';
import { DailyQuizQuestion } from '../../database/entities/daily-quiz-question.entity';
import { Question } from '../../database/entities/question.entity';
import {
  DailyQuizComposerService,
  TemplateService,
  DailyQuizMode,
} from '../../database/services/daily-quiz-composer';

export interface QuizCreationOptions {
  dropAtUTC: Date;
  mode?: DailyQuizMode;
  questionIds?: string[]; // For custom quiz creation
  replaceExisting?: boolean; // Whether to delete existing quiz first
  onTemplateReady?: (quiz: DailyQuiz) => void | Promise<void>; // Callback for notification scheduling
}

export interface QuizCreationResult {
  quiz: DailyQuiz;
  questions: Question[];
  templateUrl?: string;
  templateVersion?: string;
}

export interface ExistingQuizCheckResult {
  exists: boolean;
  quiz?: DailyQuiz;
}

/**
 * 🏗️ Quiz Creation Service
 *
 * Centralized service for all daily quiz creation operations.
 * Provides modular methods that can be reused across different contexts:
 * - Daily cron jobs
 * - Test endpoints
 * - Admin endpoints
 */
@Injectable()
export class QuizCreationService {
  private readonly logger = new Logger(QuizCreationService.name);

  constructor(
    @InjectRepository(DailyQuiz)
    private readonly dailyQuizRepository: Repository<DailyQuiz>,
    @InjectRepository(DailyQuizQuestion)
    private readonly dailyQuizQuestionRepository: Repository<DailyQuizQuestion>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly composerService: DailyQuizComposerService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * 🔍 Check if a quiz already exists for a given date
   */
  async checkExistingQuizForDate(date: Date): Promise<ExistingQuizCheckResult> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingQuiz = await this.dailyQuizRepository
      .createQueryBuilder('quiz')
      .where('quiz.dropAtUTC >= :start', { start: startOfDay })
      .andWhere('quiz.dropAtUTC <= :end', { end: endOfDay })
      .getOne();

    return {
      exists: !!existingQuiz,
      quiz: existingQuiz || undefined,
    };
  }

  /**
   * 🗑️ Delete an existing quiz and its questions
   */
  async deleteExistingQuiz(quizId: string): Promise<void> {
    this.logger.log(`Deleting existing quiz ${quizId} and its questions`);

    // Delete quiz questions first (foreign key constraint)
    await this.dailyQuizQuestionRepository.delete({
      dailyQuiz: { id: quizId },
    });

    // Delete the quiz
    await this.dailyQuizRepository.delete(quizId);

    this.logger.log(`✅ Successfully deleted quiz ${quizId}`);
  }

  /**
   * 🎯 Create a quiz using the composer service (automatic question selection)
   */
  async createQuizWithComposer(
    dropAtUTC: Date,
    mode: DailyQuizMode = DailyQuizMode.MIX,
  ): Promise<{ quiz: DailyQuiz; questions: Question[] }> {
    this.logger.log(
      `Creating quiz with composer for ${dropAtUTC.toISOString()}`,
    );

    const result = await this.composerService.composeDailyQuiz(dropAtUTC, mode);

    this.logger.log(
      `✅ Quiz created via composer: ${result.dailyQuiz.id} with ${result.questions.length} questions`,
    );

    return {
      quiz: result.dailyQuiz,
      questions: result.questions,
    };
  }

  /**
   * 📝 Create a custom quiz with specific question IDs
   */
  async createCustomQuiz(
    dropAtUTC: Date,
    questionIds: string[],
    mode: DailyQuizMode = DailyQuizMode.MIX,
  ): Promise<{ quiz: DailyQuiz; questions: Question[] }> {
    this.logger.log(
      `Creating custom quiz for ${dropAtUTC.toISOString()} with questions: ${questionIds.join(', ')}`,
    );

    // Validate question count
    if (questionIds.length !== 6) {
      throw new Error(
        `Daily quiz requires exactly 6 questions, got ${questionIds.length}`,
      );
    }

    // Fetch and validate questions exist
    const questions = await this.questionRepository.findByIds(questionIds);
    if (questions.length !== questionIds.length) {
      const missingIds = questionIds.filter(
        (id) => !questions.some((q) => q.id === id),
      );
      throw new Error(`Questions not found: ${missingIds.join(', ')}`);
    }

    // Validate questions are approved and not disabled
    const invalidQuestions = questions.filter((q) => !q.approved || q.disabled);
    if (invalidQuestions.length > 0) {
      throw new Error(
        `Invalid questions (not approved or disabled): ${invalidQuestions.map((q) => q.id).join(', ')}`,
      );
    }

    // Create the daily quiz entity
    const quiz = this.dailyQuizRepository.create({
      dropAtUTC,
      mode,
      // Set default theme plan - in real implementation this might be customizable
      themePlanJSON: {
        background: 'default',
        accent: 'primary',
        difficulty: 'mixed',
      },
    });

    await this.dailyQuizRepository.save(quiz);

    // Create quiz-question relationships in specified order
    const quizQuestions = questionIds.map((questionId, index) => {
      return this.dailyQuizQuestionRepository.create({
        dailyQuiz: quiz,
        question: { id: questionId },
        order: index + 1,
      });
    });

    await this.dailyQuizQuestionRepository.save(quizQuestions);

    // Update exposure count for questions
    await this.questionRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        exposureCount: () => 'exposure_count + 1',
        lastUsedAt: new Date(),
      })
      .whereInIds(questionIds)
      .execute();

    this.logger.log(
      `✅ Custom quiz created: ${quiz.id} with ${questions.length} questions`,
    );

    return { quiz, questions };
  }

  /**
   * 🎨 Generate and upload template for a quiz
   */
  async generateTemplate(
    quiz: DailyQuiz,
    questions: Question[],
    onTemplateReady?: (quiz: DailyQuiz) => void | Promise<void>,
  ): Promise<{ templateUrl: string; version: string }> {
    this.logger.log(`Generating template for quiz ${quiz.id}`);

    const { templateUrl, version } =
      await this.templateService.buildAndUploadTemplate(
        quiz,
        questions,
        quiz.themePlanJSON as any,
      );

    // Update quiz with template URL
    await this.dailyQuizRepository.update(quiz.id, {
      templateCdnUrl: templateUrl,
    });

    this.logger.log(
      `✅ Template generated for quiz ${quiz.id}: ${templateUrl} (v${version})`,
    );

    // Call notification callback if provided (only after template is successfully generated)
    if (onTemplateReady) {
      try {
        await onTemplateReady(quiz);
        this.logger.log(`📱 Notification scheduled for quiz ${quiz.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to schedule notification for quiz ${quiz.id}:`,
          error,
        );
        // Don't throw error - template generation was successful
      }
    }

    return { templateUrl, version };
  }

  /**
   * 🔄 Update quiz drop time (only if quiz hasn't dropped yet)
   */
  async updateQuizDropTime(
    quizId: string,
    newDropTime: Date,
  ): Promise<DailyQuiz> {
    const quiz = await this.dailyQuizRepository.findOne({
      where: { id: quizId },
    });
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    // Check if quiz has already dropped
    const now = new Date();
    if (quiz.dropAtUTC <= now) {
      throw new Error(
        `Cannot update drop time for quiz ${quizId} - it has already dropped`,
      );
    }

    // Check if notification was already sent
    if (quiz.notificationSent) {
      throw new Error(
        `Cannot update drop time for quiz ${quizId} - notification already sent`,
      );
    }

    // Validate new drop time is in the future
    if (newDropTime <= now) {
      throw new Error('New drop time must be in the future');
    }

    // Check if another quiz exists for the new date
    const newDateCheck = await this.checkExistingQuizForDate(newDropTime);
    if (newDateCheck.exists && newDateCheck.quiz!.id !== quizId) {
      throw new Error(
        `Another quiz already exists for ${newDropTime.toDateString()}`,
      );
    }

    // Update the drop time
    await this.dailyQuizRepository.update(quizId, { dropAtUTC: newDropTime });

    const updatedQuiz = await this.dailyQuizRepository.findOne({
      where: { id: quizId },
    });
    this.logger.log(
      `✅ Updated quiz ${quizId} drop time to ${newDropTime.toISOString()}`,
    );

    return updatedQuiz!;
  }

  /**
   * 🔄 Update quiz questions (only if quiz hasn't dropped yet)
   */
  async updateQuizQuestions(
    quizId: string,
    newQuestionIds: string[],
  ): Promise<Question[]> {
    const quiz = await this.dailyQuizRepository.findOne({
      where: { id: quizId },
    });
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    // Check if quiz has already dropped
    const now = new Date();
    if (quiz.dropAtUTC <= now) {
      throw new Error(
        `Cannot update questions for quiz ${quizId} - it has already dropped`,
      );
    }

    // Validate question count
    if (newQuestionIds.length !== 6) {
      throw new Error(
        `Daily quiz requires exactly 6 questions, got ${newQuestionIds.length}`,
      );
    }

    // Fetch and validate questions
    const questions = await this.questionRepository.findByIds(newQuestionIds);
    if (questions.length !== newQuestionIds.length) {
      const missingIds = newQuestionIds.filter(
        (id) => !questions.some((q) => q.id === id),
      );
      throw new Error(`Questions not found: ${missingIds.join(', ')}`);
    }

    // Validate questions are approved and not disabled
    const invalidQuestions = questions.filter((q) => !q.approved || q.disabled);
    if (invalidQuestions.length > 0) {
      throw new Error(
        `Invalid questions (not approved or disabled): ${invalidQuestions.map((q) => q.id).join(', ')}`,
      );
    }

    // Delete existing quiz questions
    await this.dailyQuizQuestionRepository.delete({
      dailyQuiz: { id: quizId },
    });

    // Create new quiz-question relationships
    const quizQuestions = newQuestionIds.map((questionId, index) => {
      return this.dailyQuizQuestionRepository.create({
        dailyQuiz: quiz,
        question: { id: questionId },
        order: index + 1,
      });
    });

    await this.dailyQuizQuestionRepository.save(quizQuestions);

    // Update exposure count for new questions
    await this.questionRepository
      .createQueryBuilder()
      .update(Question)
      .set({
        exposureCount: () => 'exposure_count + 1',
        lastUsedAt: new Date(),
      })
      .whereInIds(newQuestionIds)
      .execute();

    // Invalidate template (it needs to be regenerated with new questions)
    await this.dailyQuizRepository.update(quizId, { templateCdnUrl: null });

    this.logger.log(
      `✅ Updated quiz ${quizId} with ${questions.length} new questions`,
    );

    return questions;
  }

  /**
   * 🏗️ Complete quiz creation process
   * Main orchestrator method that handles the full creation workflow
   */
  async createCompleteQuiz(
    options: QuizCreationOptions,
  ): Promise<QuizCreationResult> {
    const {
      dropAtUTC,
      mode = DailyQuizMode.MIX,
      questionIds,
      replaceExisting = false,
      onTemplateReady,
    } = options;

    this.logger.log(
      `Starting complete quiz creation for ${dropAtUTC.toISOString()}`,
    );

    // Step 1: Check for existing quiz
    const existingCheck = await this.checkExistingQuizForDate(dropAtUTC);
    if (existingCheck.exists) {
      if (replaceExisting) {
        await this.deleteExistingQuiz(existingCheck.quiz!.id);
      } else {
        throw new Error(`Quiz already exists for ${dropAtUTC.toDateString()}`);
      }
    }

    // Step 2: Create the quiz (custom or via composer)
    let quiz: DailyQuiz;
    let questions: Question[];

    if (questionIds && questionIds.length > 0) {
      const result = await this.createCustomQuiz(dropAtUTC, questionIds, mode);
      quiz = result.quiz;
      questions = result.questions;
    } else {
      const result = await this.createQuizWithComposer(dropAtUTC, mode);
      quiz = result.quiz;
      questions = result.questions;
    }

    // Step 3: Generate template
    const { templateUrl, version } = await this.generateTemplate(
      quiz,
      questions,
      onTemplateReady,
    );

    this.logger.log(
      `🚀 Complete quiz creation finished for ${quiz.id} with template ${templateUrl}`,
    );

    return {
      quiz,
      questions,
      templateUrl,
      templateVersion: version,
    };
  }

  /**
   * 📋 Get quiz details with questions
   */
  async getQuizDetails(quizId: string): Promise<{
    quiz: DailyQuiz;
    questions: Question[];
  }> {
    const quiz = await this.dailyQuizRepository.findOne({
      where: { id: quizId },
    });
    if (!quiz) {
      throw new Error(`Quiz not found: ${quizId}`);
    }

    const quizQuestions = await this.dailyQuizQuestionRepository.find({
      where: { dailyQuiz: { id: quizId } },
      relations: ['question'],
      order: { order: 'ASC' },
    });

    const questions = quizQuestions.map((qq) => qq.question);

    return { quiz, questions };
  }
}
