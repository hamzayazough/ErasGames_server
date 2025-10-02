import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SeasonService } from '../../database/services/season.service';
import type { CreateSeasonDto } from '../../database/services/season.service';
import { Season } from '../../database/entities/season.entity';
import { DailySeasonProgress } from '../../database/entities/daily-season-progress.entity';

/**
 * AdminSeasonsController
 *
 * Admin-only endpoints for season management, maintenance, and manual operations.
 */
@Controller('admin/seasons')
export class AdminSeasonsController {
  constructor(private readonly seasonService: SeasonService) {}

  /**
   * Create a new season (admin only)
   */
  @Post()
  // @UseGuards(AdminGuard) // Add admin guard when available
  async createSeason(
    @Body() createSeasonDto: CreateSeasonDto,
  ): Promise<Season> {
    return this.seasonService.createSeason(createSeasonDto);
  }

  /**
   * Create next season automatically (admin only)
   */
  @Post('create-next')
  // @UseGuards(AdminGuard) // Add admin guard when available
  async createNextSeason(): Promise<Season> {
    return this.seasonService.createNextSeason();
  }

  /**
   * Record quiz completion for current season (internal use - usually called by system)
   */
  @Post(':id/record-progress')
  // @UseGuards(AdminGuard) // Add admin guard when available
  async recordDailyProgress(
    @Param('id') seasonId: string,
    @Body()
    body: {
      userId: string;
      quizDate: string;
      dailyQuizId: string;
      attemptId: string;
      pointsEarned: number;
      isPerfectScore?: boolean;
    },
  ): Promise<DailySeasonProgress> {
    return this.seasonService.recordDailyProgress(
      seasonId,
      body.userId,
      body.quizDate,
      body.dailyQuizId,
      body.attemptId,
      body.pointsEarned,
      body.isPerfectScore || false,
    );
  }

  /**
   * Create leaderboard snapshot (admin only)
   */
  @Post(':id/snapshot')
  // @UseGuards(AdminGuard) // Add admin guard when available
  async createLeaderboardSnapshot(@Param('id') seasonId: string) {
    return this.seasonService.createLeaderboardSnapshot(seasonId);
  }

  /**
   * Manually trigger daily season maintenance
   */
  @Post('maintenance')
  // @UseGuards(AdminGuard) // Add admin guard when available
  async triggerMaintenance(): Promise<{ message: string }> {
    await this.seasonService.dailySeasonMaintenance();
    return { message: 'Season maintenance completed' };
  }

  /**
   * Get detailed season statistics (admin view)
   */
  @Get(':id/stats')
  // @UseGuards(AdminGuard) // Add admin guard when available
  async getSeasonStats(@Param('id') seasonId: string): Promise<{
    season: Season;
    totalParticipants: number;
    totalQuizzesDelivered: number;
    averageParticipationRate: number;
    topScore: number;
  }> {
    const season = await this.seasonService.getSeasonById(seasonId);
    const leaderboard = await this.seasonService.getSeasonLeaderboard(
      seasonId,
      1,
    );

    return {
      season,
      totalParticipants: leaderboard.totalParticipants,
      totalQuizzesDelivered: leaderboard.stats.totalQuizzesDelivered,
      averageParticipationRate: leaderboard.stats.averageParticipationRate,
      topScore: leaderboard.topPlayers[0]?.totalPoints || 0,
    };
  }
}
