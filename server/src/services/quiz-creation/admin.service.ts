import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DailyQuizMode } from '../../database/services/daily-quiz-composer';
import { QuizCreationService } from './quiz-creation.service';
import { AdminCompositionService } from './admin-composition.service';
import { AdminMonitoringService } from './admin-monitoring.service';

// Re-export interfaces from child services for convenience
export type {
  ManualCompositionRequest,
  CompositionLogsQuery,
} from './admin-composition.service';
export type { QuizByDaysQuery } from './admin-monitoring.service';

export interface CustomQuizRequest {
  dropAtUTC: string;
  questionIds: string[];
  mode?: DailyQuizMode;
  replaceExisting?: boolean;
}

export interface UpdateQuizDropTimeRequest {
  quizId: string;
  newDropAtUTC: string;
}

export interface UpdateQuizQuestionsRequest {
  quizId: string;
  questionIds: string[];
}

export interface RegenerateTemplateRequest {
  quizId: string;
}

/**
 * 🔧 Admin Service
 *
 * Centralized service orchestrator for all admin operations related to daily quiz management.
 * This service delegates to specialized child services and provides additional methods
 * for comprehensive quiz management using the QuizCreationService.
 *
 * Architecture:
 * - AdminCompositionService: Manual composition, previews, health checks
 * - AdminMonitoringService: Quiz status, retrieval, cleanup
 * - QuizCreationService: Core quiz creation operations
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly compositionService: AdminCompositionService,
    private readonly monitoringService: AdminMonitoringService,
    private readonly quizCreationService: QuizCreationService,
  ) {}

  // ========== DELEGATED METHODS TO CHILD SERVICES ==========

  // Manual Composition Methods (delegated to AdminCompositionService)
  async composeDailyQuiz(request: any) {
    return this.compositionService.composeDailyQuiz(request);
  }

  async previewDailyQuiz(request: any) {
    return this.compositionService.previewDailyQuiz(request);
  }

  async getQuestionAvailability() {
    return this.compositionService.getQuestionAvailability();
  }

  async getCompositionHealth() {
    return this.compositionService.getCompositionHealth();
  }

  getCompositionOptions() {
    return this.compositionService.getCompositionOptions();
  }

  async getCompositionLogs(query: any) {
    return this.compositionService.getCompositionLogs(query);
  }

  // Monitoring Methods (delegated to AdminMonitoringService)
  async getQuizByDaysFromNow(query: any) {
    return this.monitoringService.getQuizByDaysFromNow(query);
  }

  async getQuizStatus() {
    return this.monitoringService.getQuizStatus();
  }

  async cleanupTodaysQuiz() {
    return this.monitoringService.cleanupTodaysQuiz();
  }

  // ========== NEW QUIZ MANAGEMENT METHODS (using QuizCreationService) ==========

  /**
   * 🎯 Create a custom quiz with specific questions
   * POST /admin/daily-quiz/create-custom
   */
  async createCustomQuiz(request: CustomQuizRequest) {
    try {
      const dropDate = new Date(request.dropAtUTC);
      if (isNaN(dropDate.getTime())) {
        throw new HttpException(
          'Invalid dropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Creating custom quiz for ${dropDate.toISOString()} with ${request.questionIds.length} questions`,
      );

      const result = await this.quizCreationService.createCompleteQuiz({
        dropAtUTC: dropDate,
        mode: request.mode || DailyQuizMode.MIX,
        questionIds: request.questionIds,
        replaceExisting: request.replaceExisting || false,
      });

      return {
        success: true,
        data: {
          quizId: result.quiz.id,
          dropTime: result.quiz.dropAtUTC.toISOString(),
          mode: result.quiz.mode,
          questionCount: result.questions.length,
          templateUrl: result.templateUrl,
          templateVersion: result.templateVersion,
          questions: result.questions.map((q) => ({
            id: q.id,
            themes: q.themesJSON,
            difficulty: q.difficulty,
            prompt:
              typeof q.promptJSON === 'object'
                ? q.promptJSON
                : { text: 'Question prompt' },
          })),
        },
        message: `Custom quiz created successfully for ${dropDate.toISOString()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create custom quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to create custom quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 🕒 Update quiz drop time
   * POST /admin/daily-quiz/update-drop-time
   */
  async updateQuizDropTime(request: UpdateQuizDropTimeRequest) {
    try {
      const newDropDate = new Date(request.newDropAtUTC);
      if (isNaN(newDropDate.getTime())) {
        throw new HttpException(
          'Invalid newDropAtUTC format. Use ISO 8601 format.',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Updating quiz ${request.quizId} drop time to ${newDropDate.toISOString()}`,
      );

      const updatedQuiz = await this.quizCreationService.updateQuizDropTime(
        request.quizId,
        newDropDate,
      );

      return {
        success: true,
        data: {
          quizId: updatedQuiz.id,
          oldDropTime: updatedQuiz.dropAtUTC.toISOString(), // This will be the new time after update
          newDropTime: newDropDate.toISOString(),
          mode: updatedQuiz.mode,
          templateCdnUrl: updatedQuiz.templateCdnUrl,
        },
        message: `Quiz drop time updated successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update quiz drop time: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        `Failed to update quiz drop time: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 📝 Update quiz questions
   * POST /admin/daily-quiz/update-questions
   */
  async updateQuizQuestions(request: UpdateQuizQuestionsRequest) {
    try {
      this.logger.log(
        `Updating quiz ${request.quizId} with ${request.questionIds.length} new questions`,
      );

      const questions = await this.quizCreationService.updateQuizQuestions(
        request.quizId,
        request.questionIds,
      );

      return {
        success: true,
        data: {
          quizId: request.quizId,
          questionCount: questions.length,
          questions: questions.map((q) => ({
            id: q.id,
            themes: q.themesJSON,
            difficulty: q.difficulty,
            prompt:
              typeof q.promptJSON === 'object'
                ? q.promptJSON
                : { text: 'Question prompt' },
          })),
          note: 'Template invalidated - use regenerate-template endpoint to recreate it',
        },
        message: `Quiz questions updated successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        `Failed to update quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 🎨 Regenerate quiz template
   * POST /admin/daily-quiz/regenerate-template
   */
  async regenerateTemplate(request: RegenerateTemplateRequest) {
    try {
      this.logger.log(`Regenerating template for quiz ${request.quizId}`);

      const { quiz, questions } = await this.quizCreationService.getQuizDetails(
        request.quizId,
      );

      const { templateUrl, version } =
        await this.quizCreationService.generateTemplate(quiz, questions);

      return {
        success: true,
        data: {
          quizId: quiz.id,
          templateUrl,
          templateVersion: version,
          questionsCount: questions.length,
        },
        message: `Template regenerated successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to regenerate template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        `Failed to regenerate template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 📋 Get quiz details with questions
   * GET /admin/daily-quiz/details/:quizId
   */
  async getQuizDetails(quizId: string) {
    try {
      this.logger.log(`Getting details for quiz ${quizId}`);

      const { quiz, questions } =
        await this.quizCreationService.getQuizDetails(quizId);

      return {
        success: true,
        data: {
          quiz: {
            id: quiz.id,
            dropAtUTC: quiz.dropAtUTC.toISOString(),
            mode: quiz.mode,
            themePlan: quiz.themePlanJSON,
            templateCdnUrl: quiz.templateCdnUrl,
            templateVersion: quiz.templateVersion,
            notificationSent: quiz.notificationSent,
            createdAt: quiz.createdAt.toISOString(),
            isReady: !!quiz.templateCdnUrl,
            status: quiz.templateCdnUrl ? 'ready' : 'pending_template',
          },
          questions: questions.map((q) => ({
            id: q.id,
            questionType: q.questionType,
            themes: q.themesJSON,
            difficulty: q.difficulty,
            prompt:
              typeof q.promptJSON === 'object'
                ? q.promptJSON
                : { text: 'Question prompt' },
            choicesJSON: q.choicesJSON,
            correctJSON: q.correctJSON,
            mediaJSON: q.mediaJSON,
            approved: q.approved,
            disabled: q.disabled,
            exposureCount: q.exposureCount,
            lastUsedAt: q.lastUsedAt?.toISOString(),
          })),
          summary: {
            questionsCount: questions.length,
            themeDistribution: questions.reduce(
              (acc, q) => {
                // Count all themes from the themes array
                q.themesJSON.forEach((theme) => {
                  acc[theme] = (acc[theme] || 0) + 1;
                });
                return acc;
              },
              {} as Record<string, number>,
            ),
            difficultyDistribution: questions.reduce(
              (acc, q) => {
                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                return acc;
              },
              {} as Record<string, number>,
            ),
          },
        },
        message: `Quiz details retrieved successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get quiz details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new HttpException(
        `Failed to get quiz details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * 🗑️ Delete a quiz (only if not yet dropped)
   * DELETE /admin/daily-quiz/:quizId
   */
  async deleteQuiz(quizId: string) {
    try {
      this.logger.log(`Attempting to delete quiz ${quizId}`);

      // Get quiz details first to check if deletion is allowed
      const { quiz } = await this.quizCreationService.getQuizDetails(quizId);

      // Check if quiz has already dropped
      const now = new Date();
      if (quiz.dropAtUTC <= now) {
        throw new HttpException(
          `Cannot delete quiz ${quizId} - it has already dropped`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Delete the quiz
      await this.quizCreationService.deleteExistingQuiz(quizId);

      return {
        success: true,
        data: {
          deletedQuizId: quizId,
          dropTime: quiz.dropAtUTC.toISOString(),
        },
        message: `Quiz deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
