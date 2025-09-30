import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  SeasonService,
  SeasonLeaderboard,
} from '../database/services/season.service';
import { Season } from '../database/entities/season.entity';
import { SeasonParticipation } from '../database/entities/season-participation.entity';

/**
 * SeasonsController
 *
 * Public endpoints for users to access season information and leaderboards.
 */
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonService: SeasonService) {}

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
   * Get season leaderboard
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
   * Get current season leaderboard (includes user's rank if userId provided)
   */
  @Get('current/leaderboard')
  async getCurrentSeasonLeaderboard(
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ): Promise<SeasonLeaderboard | null> {
    const currentSeason = await this.seasonService.getCurrentSeason();
    if (!currentSeason) {
      return null;
    }

    const limitNum = limit ? parseInt(limit, 10) : 100;

    if (limitNum < 1 || limitNum > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    return this.seasonService.getSeasonLeaderboard(
      currentSeason.id,
      limitNum,
      userId,
    );
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
   * Get user's participation in current season
   */
  @Get('current/participation/:userId')
  async getCurrentSeasonParticipation(
    @Param('userId') userId: string,
  ): Promise<SeasonParticipation | null> {
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
