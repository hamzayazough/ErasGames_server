import {useState, useEffect, useCallback} from 'react';
import {
  seasonsApiService,
  SeasonInfo,
  SeasonLeaderboard,
  SeasonTopPlayers,
  SeasonErrorResponse,
  MySeasonStats,
} from '../../../core/api/seasons';

export interface LeaderboardState {
  seasonInfo: SeasonInfo | null;
  leaderboard: SeasonLeaderboard | SeasonTopPlayers | null;
  myStats: MySeasonStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export function useLeaderboard() {
  const [state, setState] = useState<LeaderboardState>({
    seasonInfo: null,
    leaderboard: null,
    myStats: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  const fetchLeaderboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setState(prev => ({...prev, isRefreshing: true, error: null}));
      } else {
        setState(prev => ({...prev, isLoading: true, error: null}));
      }

      // Fetch season info first
      const seasonInfo = await seasonsApiService.getCurrentSeasonInfo();

      let leaderboard: SeasonLeaderboard | SeasonTopPlayers | null = null;
      let myStats: MySeasonStats | null = null;

      // Only fetch leaderboard if there's an active season
      if (seasonInfo.hasSeason && seasonInfo.status === 'active') {
        try {
          // Fetch current season leaderboard
          const leaderboardResponse =
            await seasonsApiService.getCurrentSeasonLeaderboard(50);

          if (!seasonsApiService.isErrorResponse(leaderboardResponse)) {
            leaderboard = leaderboardResponse;
          }
        } catch (leaderboardError) {
          console.log('Could not fetch leaderboard:', leaderboardError);
          // Don't fail the whole request if leaderboard fails
        }

        try {
          // Try to fetch user's stats (requires authentication)
          myStats = await seasonsApiService.getCurrentSeasonMyStatsSecure();
        } catch (statsError) {
          console.log(
            'Could not fetch user stats (likely not authenticated):',
            statsError,
          );
          // Don't fail if user is not authenticated
        }
      }

      setState(prev => ({
        ...prev,
        seasonInfo,
        leaderboard,
        myStats,
        isLoading: false,
        isRefreshing: false,
        error: null,
      }));
    } catch (error: any) {
      console.error('Failed to fetch leaderboard data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error.message || 'Failed to load leaderboard data',
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchLeaderboardData(true);
  }, [fetchLeaderboardData]);

  // Initial load
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  return {
    ...state,
    refresh,
    refetch: fetchLeaderboardData,
  };
}

// Helper hook for just the top players (simpler)
export function useTopPlayers(limit = 10) {
  const [players, setPlayers] = useState<SeasonTopPlayers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopPlayers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await seasonsApiService.getCurrentSeasonTopPlayers(
        limit,
      );

      if (seasonsApiService.isErrorResponse(response)) {
        setError(response.message);
        setPlayers(null);
      } else {
        setPlayers(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load top players');
      setPlayers(null);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTopPlayers();
  }, [fetchTopPlayers]);

  return {
    players,
    isLoading,
    error,
    refetch: fetchTopPlayers,
  };
}
