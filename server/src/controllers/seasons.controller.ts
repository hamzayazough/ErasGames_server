import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonService } from '../database/services/season.service';
import { FirebaseUser } from '../decorators/firebase-user.decorator';
import type { FirebaseUser as FirebaseUserType } from '../decorators/firebase-user.decorator';
import { Season } from '../database/entities/season.entity';
import { SeasonParticipation } from '../database/entities/season-participation.entity';
import { SeasonStatus } from '../database/enums/season-status.enum';
import { Attempt } from '../database/entities/attempt.entity';
import { SeasonLeaderboard } from '../database/services/season.service';

// Extended Request interface with Firebase user
interface AuthenticatedRequest extends Request {
  firebaseUser?: FirebaseUser;
}

/**
 * SeasonsController
 *
 * Public endpoints for users to access season information and leaderboards.
 */
@Controller('seasons')
export class SeasonsController {
  constructor(
    private readonly seasonService: SeasonService,
    @InjectRepository(Attempt)
    private readonly attemptRepository: Repository<Attempt>,
  ) {}

  /**
   * Calculate global stats for a user across all attempts
   */
  private async calculateGlobalStats(userId: string): Promise<{
    totalQuizzesEver: number;
    totalPointsEver: number;
  }> {
    try {
      const result:
        | { totalQuizzes?: string; totalPoints?: string }
        | undefined = await this.attemptRepository
        .createQueryBuilder('attempt')
        .select('COUNT(attempt.id)', 'totalQuizzes')
        .addSelect('COALESCE(SUM(attempt.score), 0)', 'totalPoints')
        .where('attempt.user_id = :userId', { userId })
        .andWhere('attempt.finish_at IS NOT NULL') // Only completed attempts
        .getRawOne();

      return {
        totalQuizzesEver: parseInt(result?.totalQuizzes || '0', 10),
        totalPointsEver: parseInt(result?.totalPoints || '0', 10),
      };
    } catch {
      // Return zero stats if query fails
      return {
        totalQuizzesEver: 0,
        totalPointsEver: 0,
      };
    }
  }

  /**
   * Get all seasons (public information)
   */
  @Get()
  async getAllSeasons(): Promise<Season[]> {
    return this.seasonService.getAllSeasons();
  }

  /**
   * Get current active season
   */
  @Get('current')
  async getCurrentSeason(): Promise<Season | null> {
    return this.seasonService.getCurrentSeason();
  }

  /**
   * Get specific season by ID
   */
  @Get(':id')
  async getSeasonById(@Param('id') id: string): Promise<Season> {
    return this.seasonService.getSeasonById(id);
  }

  /**
   * Get current season info with enhanced status handling
   */
  @Get('current/info')
  async getCurrentSeasonInfo(): Promise<{
    hasSeason: boolean;
    season?: any; // Using any to allow progress field
    status: 'no_seasons' | 'upcoming' | 'active' | 'ended';
    message: string;
    daysUntilStart?: number;
    daysRemaining?: number;
  }> {
    const currentSeason = await this.seasonService.getCurrentSeason();

    if (!currentSeason) {
      // Check if there are any upcoming seasons
      const allSeasons = await this.seasonService.getAllSeasons();
      const upcomingSeasons = allSeasons.filter(
        (s) => s.status === SeasonStatus.UPCOMING,
      );

      if (upcomingSeasons.length === 0) {
        return {
          hasSeason: false,
          status: 'no_seasons',
          message: 'No seasons available yet. Check back later!',
        };
      }

      // Find the next upcoming season
      const nextSeason = upcomingSeasons.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )[0];

      const today = new Date();
      const startDate = new Date(nextSeason.startDate);
      const daysUntilStart = Math.ceil(
        (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        hasSeason: true,
        season: nextSeason,
        status: 'upcoming',
        message: `${nextSeason.displayName} starts in ${daysUntilStart} days!`,
        daysUntilStart,
      };
    }

    return {
      hasSeason: true,
      season: {
        id: currentSeason.id,
        name: currentSeason.name,
        displayName: currentSeason.displayName,
        seasonNumber: currentSeason.seasonNumber,
        startDate: currentSeason.startDate,
        endDate: currentSeason.endDate,
        status: currentSeason.status,
        description: currentSeason.description,
        themeJSON: currentSeason.themeJSON,
        createdAt: currentSeason.createdAt,
        updatedAt: currentSeason.updatedAt,
        progress: currentSeason.progress, // Add progress from getter
      },
      status: 'active',
      message: `${currentSeason.displayName} is live!`,
      daysRemaining: currentSeason.daysRemaining ?? undefined,
    };
  }

  /**
   * Get current season leaderboard around user's position
   */
  @Get('current/leaderboard/around-me')
  async getCurrentSeasonLeaderboardAroundMe(
    @Query('above') above?: string,
    @Query('below') below?: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<
    | {
        userRank: number;
        userTotalPoints: number;
        players: Array<{
          userId: string;
          handle: string;
          name?: string;
          country?: string;
          totalPoints: number;
          rank: number;
          currentStreak: number;
          perfectScores: number;
          isCurrentUser: boolean;
        }>;
        totalParticipants: number;
        seasonName: string;
      }
    | { hasLeaderboard: false; message: string }
  > {
    // Add safety check
    if (!req?.firebaseUser?.uid) {
      console.error('❌ No authenticated user found');
      return {
        hasLeaderboard: false,
        message:
          'Authentication required. Please log in to view your position.',
      };
    }
    const currentSeason = await this.seasonService.getCurrentSeason();

    if (!currentSeason) {
      return {
        hasLeaderboard: false,
        message: 'No active season currently running',
      };
    }

    const positionsAbove = above ? parseInt(above, 10) : 20;
    const positionsBelow = below ? parseInt(below, 10) : 20;

    if (positionsAbove < 0 || positionsAbove > 100) {
      throw new BadRequestException('Above must be between 0 and 100');
    }

    if (positionsBelow < 0 || positionsBelow > 100) {
      throw new BadRequestException('Below must be between 0 and 100');
    }

    try {
      const context = await this.seasonService.getRankingContext(
        currentSeason.id,
        req.firebaseUser.uid,
        positionsAbove,
        positionsBelow,
      );

      // Get additional data for players
      const enhancedPlayers = await Promise.all(
        context.players.map(async (player) => {
          const participation = await this.seasonService.getUserParticipation(
            currentSeason.id,
            player.userId,
          );
          return {
            ...player,
            name: player.name ?? undefined,
            country: player.country ?? undefined,
            currentStreak: participation?.currentStreak || 0,
            perfectScores: participation?.perfectScores || 0,
          };
        }),
      );

      const totalParticipants = await this.seasonService.getTotalParticipants(
        currentSeason.id,
      );

      return {
        userRank: context.userRank,
        userTotalPoints: context.userTotalPoints,
        players: enhancedPlayers,
        totalParticipants,
        seasonName: currentSeason.displayName,
      };
    } catch (error) {
      return {
        hasLeaderboard: false,
        message: `Failed to get your position ${error instanceof Error ? error.message : ''}`,
      };
    }
  }

  /**
   * Get paginated top players for current season
   */
  @Get('current/leaderboard/top')
  async getCurrentSeasonTopPaginated(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ): Promise<
    | {
        players: Array<{
          userId: string;
          handle: string;
          name?: string;
          country?: string;
          totalPoints: number;
          rank: number;
          currentStreak: number;
          perfectScores: number;
        }>;
        totalParticipants: number;
        seasonName: string;
        hasMore: boolean;
        nextOffset?: number;
      }
    | { hasLeaderboard: false; message: string }
  > {
    const currentSeason = await this.seasonService.getCurrentSeason();

    if (!currentSeason) {
      return {
        hasLeaderboard: false,
        message: 'No active season currently running',
      };
    }

    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    if (offsetNum < 0) {
      throw new BadRequestException('Offset must be non-negative');
    }

    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const paginatedLeaderboard =
      await this.seasonService.getPaginatedLeaderboard(
        currentSeason.id,
        offsetNum,
        limitNum,
      );

    return {
      players: paginatedLeaderboard.players.map((p) => ({
        userId: p.userId,
        handle: p.handle,
        name: p.name ?? undefined,
        country: p.country ?? undefined,
        totalPoints: p.totalPoints,
        rank: p.rank,
        currentStreak: p.currentStreak,
        perfectScores: p.perfectScores,
      })),
      totalParticipants: paginatedLeaderboard.totalParticipants,
      seasonName: currentSeason.displayName,
      hasMore: paginatedLeaderboard.hasMore,
      nextOffset: paginatedLeaderboard.hasMore
        ? offsetNum + limitNum
        : undefined,
    };
  }

  /**
   * Get current season leaderboard (with user ranking if authenticated)
   */
  @Get('current/leaderboard')
  async getCurrentSeasonLeaderboard(
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ): Promise<SeasonLeaderboard | { hasLeaderboard: false; message: string }> {
    const currentSeason = await this.seasonService.getCurrentSeason();

    if (!currentSeason) {
      return {
        hasLeaderboard: false,
        message: 'No active season currently running',
      };
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;

    if (limitNum < 1 || limitNum > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    // Include authenticated user's ranking if available
    const userId = req?.firebaseUser?.uid;

    return this.seasonService.getSeasonLeaderboard(
      currentSeason.id,
      limitNum,
      userId,
    );
  }

  /**
   * Get top players for current season (simplified endpoint)
   */
  @Get('current/top-players')
  async getCurrentSeasonTopPlayers(@Query('limit') limit?: string): Promise<
    | {
        players: Array<{
          userId: string;
          handle: string;
          country?: string;
          totalPoints: number;
          rank: number;
          currentStreak: number;
          perfectScores: number;
        }>;
        totalParticipants: number;
        seasonName: string;
      }
    | { hasLeaderboard: false; message: string }
  > {
    const currentSeason = await this.seasonService.getCurrentSeason();

    if (!currentSeason) {
      return {
        hasLeaderboard: false,
        message: 'No active season currently running',
      };
    }

    const limitNum = limit ? parseInt(limit, 10) : 10;
    const leaderboard = await this.seasonService.getSeasonLeaderboard(
      currentSeason.id,
      limitNum,
    );

    return {
      players: leaderboard.topPlayers.map((p) => ({
        userId: p.userId,
        handle: p.handle,
        name: p.name ?? undefined,
        country: p.country ?? undefined,
        totalPoints: p.totalPoints,
        rank: p.rank,
        currentStreak: p.currentStreak,
        perfectScores: p.perfectScores,
      })),
      totalParticipants: leaderboard.totalParticipants,
      seasonName: currentSeason.displayName,
    };
  }

  /**
   * Get user's current season stats (requires authentication)
   */
  @Get('current/my-stats')
  async getCurrentSeasonMyStats(
    @FirebaseUser() firebaseUser: FirebaseUserType,
  ): Promise<{
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
  }> {
    const userId = firebaseUser.uid;
    const currentSeason = await this.seasonService.getCurrentSeason();

    if (!currentSeason) {
      // Calculate global stats when no season is active
      const globalStats = await this.calculateGlobalStats(userId);

      return {
        hasStats: false,
        globalStats,
        message: 'No active season. Here are your all-time stats.',
      };
    }

    try {
      const participation = await this.seasonService.getOrCreateParticipation(
        currentSeason.id,
        userId,
      );

      // Also include global stats for comprehensive user data
      const globalStats = await this.calculateGlobalStats(userId);

      return {
        hasStats: true,
        stats: {
          season: {
            name: currentSeason.name,
            displayName: currentSeason.displayName,
            daysRemaining: currentSeason.daysRemaining ?? undefined,
            progress: currentSeason.progress,
          },
          participation: {
            totalPoints: participation.totalPoints,
            currentRank: participation.currentRank ?? undefined,
            totalQuizzesCompleted: participation.totalQuizzesCompleted,
            currentStreak: participation.currentStreak,
            longestStreak: participation.longestStreak,
            perfectScores: participation.perfectScores,
            averagePointsPerQuiz: participation.averagePointsPerQuiz,
            perfectScoreRate: participation.perfectScoreRate,
          },
        },
        globalStats,
        message: `Your progress in ${currentSeason.displayName}`,
      };
    } catch {
      // Still provide global stats even if season participation fails
      const globalStats = await this.calculateGlobalStats(userId);

      return {
        hasStats: false,
        globalStats,
        message:
          'Could not retrieve your season stats, but here are your global stats.',
      };
    }
  }

  /**
   * Get season leaderboard by season ID
   */
  @Get(':id/leaderboard')
  async getSeasonLeaderboard(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ): Promise<SeasonLeaderboard> {
    const limitNum = limit ? parseInt(limit, 10) : 100;

    if (limitNum < 1 || limitNum > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    return this.seasonService.getSeasonLeaderboard(id, limitNum, userId);
  }

  /**
   * Get user's participation in a season
   */
  @Get(':id/participation/:userId')
  async getUserParticipation(
    @Param('id') seasonId: string,
    @Param('userId') userId: string,
  ): Promise<SeasonParticipation> {
    return this.seasonService.getOrCreateParticipation(seasonId, userId);
  }

  /**
   * Get user's participation in current season (requires authentication)
   */
  @Get('current/participation')
  async getCurrentSeasonParticipation(
    @FirebaseUser() firebaseUser: FirebaseUserType,
  ): Promise<SeasonParticipation | null> {
    const userId = firebaseUser.uid;
    const currentSeason = await this.seasonService.getCurrentSeason();
    if (!currentSeason) {
      return null;
    }

    return this.seasonService.getOrCreateParticipation(
      currentSeason.id,
      userId,
    );
  }

  /**
   * Test endpoint to check season integration
   */
  @Get('test/integration')
  async testSeasonIntegration(): Promise<{
    currentSeason: any;
    message: string;
  }> {
    const currentSeason = await this.seasonService.getCurrentSeason();
    return {
      currentSeason,
      message: currentSeason
        ? `Season system is active: ${currentSeason.name}`
        : 'No active season found - you may need to create one',
    };
  }
}
