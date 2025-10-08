// lib/services/admin-seasons.service.ts
import { httpService } from "../http.service";
import type { Season, CreateSeasonDto, SeasonStats } from "../types/api.types";

export class AdminSeasonsService {
  private readonly baseEndpoint = "/admin/seasons";

  /**
   * Create a new season
   */
  async createSeason(createSeasonDto: CreateSeasonDto) {
    return httpService.post<Season>(this.baseEndpoint, createSeasonDto);
  }

  /**
   * Create next season automatically
   */
  async createNextSeason() {
    return httpService.post<Season>(`${this.baseEndpoint}/create-next`);
  }

  /**
   * Record quiz completion for current season
   */
  async recordDailyProgress(
    seasonId: string,
    data: {
      userId: string;
      quizDate: string;
      dailyQuizId: string;
      attemptId: string;
      pointsEarned: number;
      isPerfectScore?: boolean;
    }
  ) {
    return httpService.post(
      `${this.baseEndpoint}/${seasonId}/record-progress`,
      data
    );
  }

  /**
   * Create leaderboard snapshot
   */
  async createLeaderboardSnapshot(seasonId: string) {
    return httpService.post(`${this.baseEndpoint}/${seasonId}/snapshot`);
  }

  /**
   * Manually trigger daily season maintenance
   */
  async triggerMaintenance() {
    return httpService.post(`${this.baseEndpoint}/maintenance`);
  }

  /**
   * Get detailed season statistics
   */
  async getSeasonStats(seasonId: string) {
    return httpService.get<SeasonStats>(
      `${this.baseEndpoint}/${seasonId}/stats`
    );
  }
}

export const adminSeasonsService = new AdminSeasonsService();
