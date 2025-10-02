import {httpService} from './http';

// Types for Seasons API responses
export interface Season {
  id: string;
  name: string;
  displayName: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  daysRemaining?: number;
  progress: number; // 0-100 percentage
  createdAt: string;
  updatedAt: string;
}

export interface SeasonInfo {
  hasSeason: boolean;
  season?: Season;
  status: 'no_seasons' | 'upcoming' | 'active' | 'ended';
  message: string;
  daysUntilStart?: number;
  daysRemaining?: number;
}

export interface TopPlayer {
  userId: string;
  handle: string;
  name?: string;
  country?: string;
  totalPoints: number;
  rank: number;
  currentStreak: number;
  perfectScores: number;
}

export interface SeasonLeaderboard {
  topPlayers: TopPlayer[];
  totalParticipants: number;
  userRank?: {
    userId: string;
    rank: number;
    totalPoints: number;
  };
  seasonId: string;
  seasonName: string;
  lastUpdated: string;
}

export interface SeasonTopPlayers {
  players: TopPlayer[];
  totalParticipants: number;
  seasonName: string;
}

export interface SeasonParticipation {
  id: string;
  seasonId: string;
  userId: string;
  totalPoints: number;
  currentRank?: number;
  totalQuizzesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  perfectScores: number;
  averagePointsPerQuiz: number;
  perfectScoreRate: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface MySeasonStats {
  hasStats: boolean;
  stats?: {
    season: {
      name: string;
      displayName: string;
      daysRemaining?: number;
      progress: number;
    };
    participation: {
      totalPoints: number;
      currentRank?: number;
      totalQuizzesCompleted: number;
      currentStreak: number;
      longestStreak: number;
      perfectScores: number;
      averagePointsPerQuiz: number;
      perfectScoreRate: number;
    };
  };
  globalStats: {
    totalQuizzesEver: number;
    totalPointsEver: number;
  };
  message: string;
}

export interface SeasonIntegrationTest {
  currentSeason: Season | null;
  message: string;
}

// Error response types
export interface SeasonErrorResponse {
  hasLeaderboard: false;
  message: string;
}

/**
 * Seasons API Service
 * Handles all season-related API calls
 */
export class SeasonsApiService {
  /**
   * Get all seasons (public information)
   */
  async getAllSeasons(): Promise<Season[]> {
    return httpService.get<Season[]>('/seasons');
  }

  /**
   * Get current active season
   */
  async getCurrentSeason(): Promise<Season | null> {
    return httpService.get<Season | null>('/seasons/current');
  }

  /**
   * Get specific season by ID
   */
  async getSeasonById(id: string): Promise<Season> {
    return httpService.get<Season>(`/seasons/${id}`);
  }

  /**
   * Get current season info with enhanced status handling
   */
  async getCurrentSeasonInfo(): Promise<SeasonInfo> {
    return httpService.get<SeasonInfo>('/seasons/current/info');
  }

  /**
   * Get current season leaderboard (with user ranking if authenticated)
   */
  async getCurrentSeasonLeaderboard(
    limit?: number,
  ): Promise<SeasonLeaderboard | SeasonErrorResponse> {
    const params = limit ? {limit: limit.toString()} : undefined;
    return httpService.get<SeasonLeaderboard | SeasonErrorResponse>(
      '/seasons/current/leaderboard',
      {params},
    );
  }

  /**
   * Get top players for current season (simplified endpoint)
   */
  async getCurrentSeasonTopPlayers(
    limit?: number,
  ): Promise<SeasonTopPlayers | SeasonErrorResponse> {
    const params = limit ? {limit: limit.toString()} : undefined;
    return httpService.get<SeasonTopPlayers | SeasonErrorResponse>(
      '/seasons/current/top-players',
      {params},
    );
  }

  /**
   * Get user's current season stats (requires authentication)
   */
  async getCurrentSeasonMyStats(): Promise<MySeasonStats> {
    return httpService.get<MySeasonStats>('/seasons/current/my-stats');
  }

  /**
   * Get season leaderboard by season ID
   */
  async getSeasonLeaderboard(
    seasonId: string,
    limit?: number,
    userId?: string,
  ): Promise<SeasonLeaderboard> {
    const params: Record<string, string> = {};
    if (limit) params.limit = limit.toString();
    if (userId) params.userId = userId;

    return httpService.get<SeasonLeaderboard>(
      `/seasons/${seasonId}/leaderboard`,
      {params: Object.keys(params).length > 0 ? params : undefined},
    );
  }

  /**
   * Get user's participation in a season
   */
  async getUserParticipation(
    seasonId: string,
    userId: string,
  ): Promise<SeasonParticipation> {
    return httpService.get<SeasonParticipation>(
      `/seasons/${seasonId}/participation/${userId}`,
    );
  }

  /**
   * Get user's participation in current season (requires authentication)
   */
  async getCurrentSeasonParticipation(): Promise<SeasonParticipation | null> {
    return httpService.get<SeasonParticipation | null>(
      '/seasons/current/participation',
    );
  }

  /**
   * Test endpoint to check season integration
   */
  async testSeasonIntegration(): Promise<SeasonIntegrationTest> {
    return httpService.get<SeasonIntegrationTest>('/seasons/test/integration');
  }

  /**
   * Type guard to check if response is an error response
   */
  isErrorResponse(
    response: SeasonLeaderboard | SeasonTopPlayers | SeasonErrorResponse,
  ): response is SeasonErrorResponse {
    return (response as SeasonErrorResponse).hasLeaderboard === false;
  }

  /**
   * Helper method to check if user is authenticated for protected endpoints
   */
  private async handleAuthenticatedRequest<T>(
    requestFn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (error?.status === 401) {
        throw new Error(
          'Authentication required. Please log in to access this feature.',
        );
      }
      throw error;
    }
  }

  /**
   * Get current season stats with authentication handling
   */
  async getCurrentSeasonMyStatsSecure(): Promise<MySeasonStats> {
    return this.handleAuthenticatedRequest(() =>
      this.getCurrentSeasonMyStats(),
    );
  }

  /**
   * Get current season participation with authentication handling
   */
  async getCurrentSeasonParticipationSecure(): Promise<SeasonParticipation | null> {
    return this.handleAuthenticatedRequest(() =>
      this.getCurrentSeasonParticipation(),
    );
  }
}

// Create and export singleton instance
export const seasonsApiService = new SeasonsApiService();

// Export individual functions for convenience
export const {
  getAllSeasons,
  getCurrentSeason,
  getSeasonById,
  getCurrentSeasonInfo,
  getCurrentSeasonLeaderboard,
  getCurrentSeasonTopPlayers,
  getCurrentSeasonMyStats,
  getSeasonLeaderboard,
  getUserParticipation,
  getCurrentSeasonParticipation,
  testSeasonIntegration,
  getCurrentSeasonMyStatsSecure,
  getCurrentSeasonParticipationSecure,
  isErrorResponse,
} = seasonsApiService;
