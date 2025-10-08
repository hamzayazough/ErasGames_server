// lib/services/admin-job.service.ts
import { httpService } from "../http.service";
import type { JobStatus } from "../types/api.types";

export class AdminJobService {
  private readonly baseEndpoint = "/admin/jobs";

  /**
   * Get status of scheduled jobs
   */
  async getJobStatus() {
    return httpService.get<JobStatus>(`${this.baseEndpoint}/status`);
  }

  /**
   * Manually trigger daily composition job
   */
  async triggerComposer(dropAtUTC: string) {
    return httpService.post(`${this.baseEndpoint}/composer/trigger`, {
      dropAtUTC,
    });
  }

  /**
   * Manually trigger template warmup job
   */
  async triggerTemplate(quizId: string) {
    return httpService.post(`${this.baseEndpoint}/template/trigger`, {
      quizId,
    });
  }

  /**
   * Run daily composition job immediately
   */
  async runComposerJob() {
    return httpService.post(`${this.baseEndpoint}/composer/run`);
  }

  /**
   * Run template warmup job immediately
   */
  async runTemplateJob() {
    return httpService.post(`${this.baseEndpoint}/template/run`);
  }
}

export const adminJobService = new AdminJobService();
