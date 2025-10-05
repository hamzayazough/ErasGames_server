// lib/services/admin-daily-quiz.service.ts
import { httpService } from "../http.service";
import type {
  ComposeDailyQuizRequest,
  ComposeDailyQuizResponse,
  QuestionAvailability,
  DailyQuiz,
  JobStatus,
  Question,
} from "../types/api.types";

export class AdminDailyQuizService {
  private readonly baseEndpoint = "/admin/daily-quiz";

  /**
   * Manually compose a daily quiz
   */
  async composeDailyQuiz(request: ComposeDailyQuizRequest) {
    return httpService.post<ComposeDailyQuizResponse>(
      `${this.baseEndpoint}/compose`,
      request
    );
  }

  /**
   * Preview quiz composition without creating records
   */
  async previewDailyQuiz(request: ComposeDailyQuizRequest) {
    return httpService.post<ComposeDailyQuizResponse>(
      `${this.baseEndpoint}/preview`,
      request
    );
  }

  /**
   * Get question availability statistics
   */
  async getQuestionAvailability() {
    return httpService.get<QuestionAvailability>(
      `${this.baseEndpoint}/availability`
    );
  }

  /**
   * Get composition health check
   */
  async getCompositionHealth() {
    return httpService.get(`${this.baseEndpoint}/health`);
  }

  /**
   * Get available themes and modes
   */
  async getCompositionOptions() {
    return httpService.get(`${this.baseEndpoint}/options`);
  }

  /**
   * Get recent composition logs
   */
  async getCompositionLogs(limit: number = 10, offset: number = 0) {
    return httpService.get(
      `${this.baseEndpoint}/logs?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Manually trigger daily composition job
   */
  async triggerDailyComposition(dropAtUTC: string) {
    return httpService.post(`${this.baseEndpoint}/jobs/trigger-composition`, {
      dropAtUTC,
    });
  }

  /**
   * Manually trigger template warmup job
   */
  async triggerTemplateWarmup(quizId: string) {
    return httpService.post(`${this.baseEndpoint}/jobs/trigger-warmup`, {
      quizId,
    });
  }

  /**
   * Get job status and scheduling information
   */
  async getJobStatus() {
    return httpService.get<JobStatus>(`${this.baseEndpoint}/jobs/status`);
  }

  /**
   * Test the complete daily quiz workflow
   */
  async testCompleteWorkflow(dropAtUTC: string, mode?: string) {
    return httpService.post(`${this.baseEndpoint}/jobs/test-workflow`, {
      dropAtUTC,
      mode,
    });
  }

  /**
   * Get quiz for a specific number of days from now
   * @param days - Number of days from today (0 = today, 1 = tomorrow, etc.)
   */
  async getQuizByDaysFromNow(days: number = 0) {
    return httpService.get<{
      success: boolean;
      data: DailyQuiz | null;
      message: string;
    }>(`${this.baseEndpoint}/by-days?days=${days}`);
  }

  /**
   * Get detailed quiz information by quiz ID
   * @param quizId - The ID of the quiz to retrieve
   */
  async getQuizDetails(quizId: string) {
    return httpService.get<{
      success: boolean;
      data: DailyQuiz;
      message: string;
    }>(`${this.baseEndpoint}/details?quizId=${quizId}`);
  }

  /**
   * Create a custom daily quiz with specific questions and drop time
   * @param request - Quiz creation parameters
   */
  async createCustomQuiz(request: {
    dropAtUTC: string;
    questionIds: string[];
    mode?: string;
    replaceExisting?: boolean;
  }) {
    return httpService.post<{
      success: boolean;
      data: DailyQuiz;
      message: string;
    }>(`${this.baseEndpoint}/create-custom`, request);
  }

  /**
   * Update the drop time of an existing quiz (must not have dropped yet)
   * @param request - Quiz ID and new drop time
   */
  async updateQuizDropTime(request: { quizId: string; newDropAtUTC: string }) {
    return httpService.patch<{
      success: boolean;
      data: DailyQuiz;
      message: string;
    }>(`${this.baseEndpoint}/update-drop-time`, request);
  }

  /**
   * Update the questions of an existing quiz (must not have dropped yet)
   * @param request - Quiz ID and new question IDs
   */
  async updateQuizQuestions(request: {
    quizId: string;
    questionIds: string[];
  }) {
    return httpService.patch<{
      success: boolean;
      data: DailyQuiz;
      message: string;
    }>(`${this.baseEndpoint}/update-questions`, request);
  }

  /**
   * Regenerate the CDN template for a quiz
   * @param request - Quiz ID to regenerate template for
   */
  async regenerateTemplate(request: { quizId: string }) {
    return httpService.post<{
      success: boolean;
      message: string;
    }>(`${this.baseEndpoint}/regenerate-template`, request);
  }

  /**
   * Delete a quiz (must not have dropped yet)
   * @param request - Quiz ID to delete
   */
  async deleteQuiz(request: { quizId: string }) {
    return httpService.delete<{
      success: boolean;
      message: string;
    }>(`${this.baseEndpoint}/delete`, request);
  }

  /**
   * Get all available questions for selection
   */
  async getAllQuestions() {
    return httpService.get<Question[]>(`/questions`);
  }
}

export const adminDailyQuizService = new AdminDailyQuizService();
