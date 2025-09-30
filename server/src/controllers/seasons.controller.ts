import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SeasonService,
  SeasonLeaderboard,
} from '../database/services/season.service';
import { Season } from '../database/entities/season.entity';
import { SeasonParticipation } from '../database/entities/season-participation.entity';
import { SeasonStatus } from '../database/enums/season-status.enum';
import { Attempt } from '../database/entities/attempt.entity';

// Extended Request interface with Firebase user
interface AuthenticatedRequest extends Request {
  firebaseUser?: {
    uid: string;
    email?: string;
    name?: string;
  };
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
    season?: Season;
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
      season: currentSeason,
      status: 'active',
      message: `${currentSeason.displayName} is live!`,
      daysRemaining: currentSeason.daysRemaining ?? undefined,
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
  async getCurrentSeasonMyStats(@Req() req: AuthenticatedRequest): Promise<{
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
    // Get authenticated user ID from Firebase middleware
    const firebaseUser = req.firebaseUser;
    if (!firebaseUser) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

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
    @Req() req: AuthenticatedRequest,
  ): Promise<SeasonParticipation | null> {
    // Get authenticated user ID from Firebase middleware
    const firebaseUser = req.firebaseUser;
    if (!firebaseUser) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

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
