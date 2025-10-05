// lib/services/admin-daily-quiz.service.ts
import { httpService } from "../http.service";
import type {
  ComposeDailyQuizRequest,
  ComposeDailyQuizResponse,
  QuestionAvailability,
  DailyQuiz,
  JobStatus,
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
}

export const adminDailyQuizService = new AdminDailyQuizService();
