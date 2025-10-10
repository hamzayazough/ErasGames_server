import {useState, useEffect, useCallback, useRef} from 'react';
import {
  seasonsApiService,
  SeasonInfo,
  SeasonLeaderboard,
  SeasonTopPlayers,
  SeasonLeaderboardAroundUser,
  PaginatedTopPlayers,
  SeasonErrorResponse,
  MySeasonStats,
} from '../../../core/api/seasons';

export type LeaderboardMode = 'around-me' | 'top-players';

export interface LeaderboardState {
  seasonInfo: SeasonInfo | null;
  leaderboard:
    | SeasonLeaderboard
    | SeasonTopPlayers
    | SeasonLeaderboardAroundUser
    | PaginatedTopPlayers
    | null;
  myStats: MySeasonStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  mode: LeaderboardMode;
  hasMore: boolean;
  nextOffset?: number;
}

export function useLeaderboard(initialMode: LeaderboardMode = 'around-me') {
  const [state, setState] = useState<LeaderboardState>({
    seasonInfo: null,
    leaderboard: null,
    myStats: null,
    isLoading: true,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    mode: initialMode,
    hasMore: false,
    nextOffset: undefined,
  });

  const fetchLeaderboardData = async (
    isRefresh = false,
    mode?: LeaderboardMode,
    loadMore = false,
  ) => {
    try {
      const actualMode = mode || state.mode;

      if (isRefresh) {
        setState(prev => ({...prev, isRefreshing: true, error: null}));
      } else if (loadMore) {
        setState(prev => ({...prev, isLoadingMore: true, error: null}));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          mode: actualMode,
        }));
      }

      // Fetch season info first
      const seasonInfo = await seasonsApiService.getCurrentSeasonInfo();

      let leaderboard:
        | SeasonLeaderboard
        | SeasonTopPlayers
        | SeasonLeaderboardAroundUser
        | PaginatedTopPlayers
        | null = null;
      let myStats: MySeasonStats | null = null;
      let hasMore = false;
      let nextOffset: number | undefined;

      // Only fetch leaderboard if there's an active season
      if (seasonInfo.hasSeason && seasonInfo.status === 'active') {
        try {
          if (actualMode === 'around-me') {
            // Fetch leaderboard around user's position
            const leaderboardResponse =
              await seasonsApiService.getCurrentSeasonLeaderboardAroundMe(
                20,
                20,
              );

            if (!seasonsApiService.isErrorResponse(leaderboardResponse)) {
              leaderboard = leaderboardResponse;
            }
          } else {
            // Fetch top players with pagination
            const offset = loadMore && state.nextOffset ? state.nextOffset : 0;
            const leaderboardResponse =
              await seasonsApiService.getCurrentSeasonTopPaginated(offset, 50);

            if (!seasonsApiService.isErrorResponse(leaderboardResponse)) {
              if (
                loadMore &&
                state.leaderboard &&
                'players' in state.leaderboard &&
                'players' in leaderboardResponse
              ) {
                // Append new players to existing list
                const existingPlayers = state.leaderboard.players;
                const newPlayers = leaderboardResponse.players;
                leaderboard = {
                  ...leaderboardResponse,
                  players: [...existingPlayers, ...newPlayers],
                };
              } else {
                leaderboard = leaderboardResponse;
              }
              hasMore = leaderboardResponse.hasMore;
              nextOffset = leaderboardResponse.nextOffset;
            }
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
        isLoadingMore: false,
        error: null,
        mode: actualMode,
        hasMore,
        nextOffset,
      }));
    } catch (error: any) {
      console.error('Failed to fetch leaderboard data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        error: error.message || 'Failed to load leaderboard data',
      }));
    }
  };

  const switchMode = useCallback((newMode: LeaderboardMode) => {
    fetchLeaderboardData(false, newMode);
  }, []);

  const loadMore = useCallback(() => {
    fetchLeaderboardData(false, undefined, true);
  }, []);

  const refresh = useCallback(() => {
    fetchLeaderboardData(true);
  }, []);

  // Initial load
  useEffect(() => {
    fetchLeaderboardData();
  }, []); // Empty dependency array for initial load only

  return {
    ...state,
    switchMode,
    loadMore,
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
