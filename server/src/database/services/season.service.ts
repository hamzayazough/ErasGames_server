import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  MoreThan,
  LessThan,
  LessThanOrEqual,
  Between,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Season } from '../entities/season.entity';
import { SeasonParticipation } from '../entities/season-participation.entity';
import { DailySeasonProgress } from '../entities/daily-season-progress.entity';
import {
  SeasonLeaderboardSnapshot,
  TopPlayer,
  SeasonStats,
} from '../entities/season-leaderboard-snapshot.entity';
import { SeasonStatus } from '../enums/season-status.enum';
import { User } from '../entities/user.entity';
import { Attempt } from '../entities/attempt.entity';
import { DailyQuiz } from '../entities/daily-quiz.entity';

export interface CreateSeasonDto {
  name: string;
  displayName: string;
  startDate: string;
  endDate: string;
  description?: string;
  themeJSON?: Record<string, any>;
}

export interface SeasonLeaderboard {
  season: Season;
  topPlayers: TopPlayer[];
  userRank?: { rank: number; totalPoints: number; user: Partial<User> };
  stats: SeasonStats;
  totalParticipants: number;
}

/**
 * SeasonService
 *
 * Manages seasons, user participation, daily progress tracking, and leaderboards.
 * Handles automatic season transitions and leaderboard calculations.
 */
@Injectable()
export class SeasonService {
  private readonly logger = new Logger(SeasonService.name);

  constructor(
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(SeasonParticipation)
    private participationRepository: Repository<SeasonParticipation>,
    @InjectRepository(DailySeasonProgress)
    private progressRepository: Repository<DailySeasonProgress>,
    @InjectRepository(SeasonLeaderboardSnapshot)
    private snapshotRepository: Repository<SeasonLeaderboardSnapshot>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Attempt)
    private attemptRepository: Repository<Attempt>,
    @InjectRepository(DailyQuiz)
    private dailyQuizRepository: Repository<DailyQuiz>,
  ) {}

  // ===============================================
  // SEASON MANAGEMENT
  // ===============================================

  /**
   * Get the current active season
   */
  async getCurrentSeason(): Promise<Season | null> {
    const today = new Date().toISOString().split('T')[0];

    return this.seasonRepository.findOne({
      where: {
        status: SeasonStatus.ACTIVE,
        startDate: LessThanOrEqual(today),
        endDate: MoreThan(today),
      },
      order: { seasonNumber: 'DESC' },
    });
  }

  /**
   * Get all seasons
   */
  async getAllSeasons(): Promise<Season[]> {
    return this.seasonRepository.find({
      order: { seasonNumber: 'ASC' },
    });
  }

  /**
   * Get season by ID
   */
  async getSeasonById(id: string): Promise<Season> {
    const season = await this.seasonRepository.findOne({ where: { id } });
    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }
    return season;
  }

  /**
   * Create a new season
   */
  async createSeason(dto: CreateSeasonDto): Promise<Season> {
    // Get the next season number
    const lastSeason = await this.seasonRepository.findOne({
      order: { seasonNumber: 'DESC' },
    });
    const seasonNumber = (lastSeason?.seasonNumber || 0) + 1;

    // Determine initial status based on start date
    const today = new Date().toISOString().split('T')[0];
    let status = SeasonStatus.UPCOMING;
    if (dto.startDate <= today && dto.endDate >= today) {
      status = SeasonStatus.ACTIVE;
    } else if (dto.endDate < today) {
      status = SeasonStatus.COMPLETED;
    }

    const season = this.seasonRepository.create({
      ...dto,
      seasonNumber,
      status,
      themeJSON: dto.themeJSON || {},
    });

    return this.seasonRepository.save(season);
  }

  /**
   * Create the next season automatically (4 months after the last one)
   */
  async createNextSeason(): Promise<Season> {
    const lastSeason = await this.seasonRepository.findOne({
      order: { seasonNumber: 'DESC' },
    });

    let startDate: Date;
    if (lastSeason) {
      startDate = new Date(lastSeason.endDate);
      startDate.setDate(startDate.getDate() + 1); // Day after last season ends
    } else {
      startDate = new Date('2025-11-01'); // First season starts Nov 1, 2025
    } // Calculate end date (4 months later)
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 4);
    endDate.setDate(endDate.getDate() - 1); // Last day of the 4th month

    const seasonNumber = (lastSeason?.seasonNumber || 0) + 1;
    const name = `Season ${seasonNumber}`;
    const displayName = `Season ${seasonNumber} - ${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

    return this.createSeason({
      name,
      displayName,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      description: `Automatically created season covering 4 months of daily quizzes`,
    });
  }

  // ===============================================
  // USER PARTICIPATION
  // ===============================================

  /**
   * Get or create user's participation in a season
   */
  async getOrCreateParticipation(
    seasonId: string,
    userId: string,
  ): Promise<SeasonParticipation> {
    let participation = await this.participationRepository.findOne({
      where: { season: { id: seasonId }, user: { id: userId } },
      relations: ['season', 'user'],
    });

    if (!participation) {
      const season = await this.getSeasonById(seasonId);
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      participation = this.participationRepository.create({
        season,
        user,
        joinedAt: new Date(),
        isActive: true,
      });

      participation = await this.participationRepository.save(participation);
    }

    return participation;
  }

  /**
   * Update user's participation stats after completing a quiz
   */
  async updateParticipationStats(
    seasonId: string,
    userId: string,
    pointsEarned: number,
    isPerfectScore: boolean = false,
  ): Promise<void> {
    const participation = await this.getOrCreateParticipation(seasonId, userId);

    // Calculate new streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const recentProgress = await this.progressRepository.find({
      where: {
        season: { id: seasonId },
        user: { id: userId },
        quizDate: MoreThan(yesterdayStr),
        pointsEarned: MoreThan(0),
      },
      order: { quizDate: 'DESC' },
    });
    const newStreak =
      recentProgress.length > 0 ? recentProgress[0].streakDay + 1 : 1;

    // Update participation stats
    participation.totalPoints += pointsEarned;
    participation.totalQuizzesCompleted += 1;
    if (isPerfectScore) {
      participation.perfectScores += 1;
    }
    participation.currentStreak = newStreak;
    participation.longestStreak = Math.max(
      participation.longestStreak,
      newStreak,
    );
    participation.lastActivityAt = new Date();

    await this.participationRepository.save(participation);
  }

  /**
   * Record daily progress for a user
   */
  async recordDailyProgress(
    seasonId: string,
    userId: string,
    quizDate: string,
    dailyQuizId: string,
    attemptId: string,
    pointsEarned: number,
    isPerfectScore: boolean = false,
  ): Promise<DailySeasonProgress> {
    const season = await this.getSeasonById(seasonId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Calculate streak day
    const yesterday = new Date(quizDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayProgress = await this.progressRepository.findOne({
      where: {
        season: { id: seasonId },
        user: { id: userId },
        quizDate: yesterdayStr,
        pointsEarned: MoreThan(0),
      },
    });

    const streakDay = yesterdayProgress ? yesterdayProgress.streakDay + 1 : 1;

    // Create or update progress record
    let progress = await this.progressRepository.findOne({
      where: {
        season: { id: seasonId },
        user: { id: userId },
        quizDate,
      },
    });

    if (progress) {
      progress.pointsEarned = pointsEarned;
      progress.isPerfectScore = isPerfectScore;
      progress.streakDay = streakDay;
      progress.completedAt = new Date();
    } else {
      progress = this.progressRepository.create({
        season,
        user,
        quizDate,
        dailyQuiz: { id: dailyQuizId } as DailyQuiz,
        attempt: { id: attemptId } as Attempt,
        pointsEarned,
        isPerfectScore,
        streakDay,
        completedAt: new Date(),
      });
    }

    progress = await this.progressRepository.save(progress);

    // Update overall participation stats
    await this.updateParticipationStats(
      seasonId,
      userId,
      pointsEarned,
      isPerfectScore,
    );

    return progress;
  }

  // ===============================================
  // LEADERBOARDS
  // ===============================================

  /**
   * Get current season leaderboard
   */
  async getSeasonLeaderboard(
    seasonId: string,
    limit: number = 100,
    userId?: string,
  ): Promise<SeasonLeaderboard> {
    const season = await this.getSeasonById(seasonId);

    // Get top players
    const topParticipations = await this.participationRepository.find({
      where: { season: { id: seasonId }, isActive: true },
      relations: ['user'],
      order: { totalPoints: 'DESC' },
      take: limit,
    });

    const topPlayers: TopPlayer[] = topParticipations.map((p, index) => ({
      userId: p.user.id,
      handle: p.user.handle || 'Anonymous',
      name: p.user.name,
      country: p.user.country,
      totalPoints: p.totalPoints,
      rank: index + 1,
      totalQuizzesCompleted: p.totalQuizzesCompleted,
      currentStreak: p.currentStreak,
      longestStreak: p.longestStreak,
      perfectScores: p.perfectScores,
      averagePointsPerQuiz: p.averagePointsPerQuiz,
      perfectScoreRate: p.perfectScoreRate,
      lastActivityAt: p.lastActivityAt?.toISOString() || '',
      daysActive: p.participationDays,
    }));

    // Get user's rank if requested
    let userRank:
      | { rank: number; totalPoints: number; user: Partial<User> }
      | undefined;
    if (userId) {
      const allParticipations = await this.participationRepository.find({
        where: { season: { id: seasonId }, isActive: true },
        relations: ['user'],
        order: { totalPoints: 'DESC' },
      });

      const userParticipationIndex = allParticipations.findIndex(
        (p) => p.user.id === userId,
      );
      if (userParticipationIndex >= 0) {
        const userParticipation = allParticipations[userParticipationIndex];
        userRank = {
          rank: userParticipationIndex + 1,
          totalPoints: userParticipation.totalPoints,
          user: {
            id: userParticipation.user.id,
            handle: userParticipation.user.handle,
            name: userParticipation.user.name,
            country: userParticipation.user.country,
          },
        };
      }
    }

    // Calculate stats
    const allPoints = topParticipations
      .map((p) => p.totalPoints)
      .filter((p) => p > 0);
    const stats: SeasonStats = {
      averagePoints:
        allPoints.length > 0
          ? Math.round(
              allPoints.reduce((sum, p) => sum + p, 0) / allPoints.length,
            )
          : 0,
      medianPoints:
        allPoints.length > 0
          ? allPoints.sort((a, b) => a - b)[Math.floor(allPoints.length / 2)]
          : 0,
      standardDeviation: this.calculateStandardDeviation(allPoints),
      totalQuizzesDelivered: await this.getTotalQuizzesForSeason(seasonId),
      averageParticipationRate: 0, // TODO: Calculate based on daily participation
      streakDistribution: {},
      perfectScoreDistribution: {},
      dailyParticipation: {},
    };

    return {
      season,
      topPlayers,
      userRank,
      stats,
      totalParticipants: topParticipations.length,
    };
  }

  /**
   * Create a leaderboard snapshot
   */
  async createLeaderboardSnapshot(
    seasonId: string,
  ): Promise<SeasonLeaderboardSnapshot> {
    const leaderboard = await this.getSeasonLeaderboard(seasonId, 1000); // Get top 1000 for snapshot
    const today = new Date().toISOString().split('T')[0];

    const snapshot = this.snapshotRepository.create({
      season: leaderboard.season,
      snapshotDate: today,
      topPlayersJSON: leaderboard.topPlayers,
      totalParticipants: leaderboard.totalParticipants,
      statsJSON: leaderboard.stats,
    });

    return this.snapshotRepository.save(snapshot);
  }

  // ===============================================
  // CRON JOBS
  // ===============================================

  /**
   * Daily job to update season statuses and create snapshots
   */
  @Cron('0 2 * * *') // Run at 2 AM daily
  async dailySeasonMaintenance(): Promise<void> {
    this.logger.log('Running daily season maintenance...');

    try {
      // Update season statuses
      await this.updateSeasonStatuses();

      // Create leaderboard snapshots for active seasons
      const activeSeasons = await this.seasonRepository.find({
        where: { status: SeasonStatus.ACTIVE },
      });

      for (const season of activeSeasons) {
        try {
          await this.createLeaderboardSnapshot(season.id);
          this.logger.log(
            `Created leaderboard snapshot for season ${season.name}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to create snapshot for season ${season.id}:`,
            error,
          );
        }
      }

      // Check if we need to create next season
      await this.checkAndCreateNextSeason();
    } catch (error) {
      this.logger.error('Daily season maintenance failed:', error);
    }
  }

  // ===============================================
  // PRIVATE HELPER METHODS
  // ===============================================

  private async updateSeasonStatuses(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Activate upcoming seasons that should start
    await this.seasonRepository.update(
      { status: SeasonStatus.UPCOMING, startDate: LessThanOrEqual(today) },
      { status: SeasonStatus.ACTIVE },
    );

    // Complete active seasons that have ended
    await this.seasonRepository.update(
      { status: SeasonStatus.ACTIVE, endDate: LessThan(today) },
      { status: SeasonStatus.COMPLETED },
    );
  }

  private async checkAndCreateNextSeason(): Promise<void> {
    const upcomingSeasons = await this.seasonRepository.count({
      where: { status: SeasonStatus.UPCOMING },
    });

    if (upcomingSeasons === 0) {
      this.logger.log('No upcoming seasons found, creating next season...');
      const newSeason = await this.createNextSeason();
      this.logger.log(`Created new season: ${newSeason.name}`);
    }
  }

  private async getTotalQuizzesForSeason(seasonId: string): Promise<number> {
    const season = await this.getSeasonById(seasonId);

    return this.dailyQuizRepository.count({
      where: {
        dropAtUTC: Between(
          new Date(season.startDate + 'T00:00:00Z'),
          new Date(season.endDate + 'T23:59:59Z'),
        ),
      },
    });
  }

  /**
   * Get user's participation in a season
   */
  async getUserParticipation(seasonId: string, userId: string) {
    return await this.participationRepository.findOne({
      where: { season: { id: seasonId }, user: { id: userId } },
      relations: ['user', 'season'],
    });
  }

  /**
   * Update user's participation with new score and recalculate rankings
   */
  async updateUserParticipation(
    seasonId: string,
    userId: string,
    newScore: number,
  ) {
    // Get or create participation
    const participation = await this.getOrCreateParticipation(seasonId, userId);

    // Add the new score to total points
    participation.totalPoints += newScore;
    participation.totalQuizzesCompleted += 1;
    participation.lastActivityAt = new Date();

    // Update streak logic would go here if needed
    // For now, just save the participation
    await this.participationRepository.save(participation);

    // Recalculate rankings for the season
    await this.recalculateSeasonRankings(seasonId);

    return participation;
  }

  /**
   * Get ranking context around a specific user (X positions above and below)
   */
  async getRankingContext(
    seasonId: string,
    userId: string,
    positionsAbove: number = 5,
    positionsBelow: number = 5,
  ) {
    // Get all participants sorted by points
    const allParticipations = await this.participationRepository.find({
      where: { season: { id: seasonId }, isActive: true },
      relations: ['user'],
      order: { totalPoints: 'DESC' },
    });

    // Find user's position
    const userIndex = allParticipations.findIndex((p) => p.user.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found in season participants');
    }

    const userParticipation = allParticipations[userIndex];
    const userRank = userIndex + 1;

    // Calculate range to show
    const startIndex = Math.max(0, userIndex - positionsAbove);
    const endIndex = Math.min(
      allParticipations.length,
      userIndex + positionsBelow + 1,
    );

    // Get participants in range
    const contextParticipations = allParticipations.slice(startIndex, endIndex);

    // Format the response
    const players = contextParticipations.map((p, idx) => ({
      userId: p.user.id,
      handle: p.user.handle || 'Anonymous',
      name: p.user.name,
      country: p.user.country,
      totalPoints: p.totalPoints,
      rank: startIndex + idx + 1,
      isCurrentUser: p.user.id === userId,
    }));

    return {
      userRank,
      userTotalPoints: userParticipation.totalPoints,
      players,
    };
  }

  /**
   * Get total number of participants in a season
   */
  async getTotalParticipants(seasonId: string): Promise<number> {
    return this.participationRepository.count({
      where: { season: { id: seasonId }, isActive: true },
    });
  }

  /**
   * Get paginated leaderboard for a season
   */
  async getPaginatedLeaderboard(
    seasonId: string,
    offset: number = 0,
    limit: number = 50,
  ): Promise<{
    players: TopPlayer[];
    totalParticipants: number;
    hasMore: boolean;
  }> {
    const totalParticipants = await this.getTotalParticipants(seasonId);

    const participations = await this.participationRepository.find({
      where: { season: { id: seasonId }, isActive: true },
      relations: ['user'],
      order: { totalPoints: 'DESC' },
      skip: offset,
      take: limit,
    });

    const players: TopPlayer[] = participations.map((p, index) => ({
      userId: p.user.id,
      handle: p.user.handle || 'Anonymous',
      name: p.user.name,
      country: p.user.country,
      totalPoints: p.totalPoints,
      rank: offset + index + 1,
      totalQuizzesCompleted: p.totalQuizzesCompleted,
      currentStreak: p.currentStreak,
      longestStreak: p.longestStreak,
      perfectScores: p.perfectScores,
      averagePointsPerQuiz: p.averagePointsPerQuiz,
      perfectScoreRate: p.perfectScoreRate,
      lastActivityAt: p.lastActivityAt?.toISOString() || '',
      daysActive: p.participationDays,
    }));

    const hasMore = offset + limit < totalParticipants;

    return {
      players,
      totalParticipants,
      hasMore,
    };
  }

  /**
   * Recalculate rankings for all participants in a season
   */
  private async recalculateSeasonRankings(seasonId: string) {
    const participations = await this.participationRepository.find({
      where: { season: { id: seasonId }, isActive: true },
      relations: ['user'],
      order: { totalPoints: 'DESC' },
    });

    // Update ranks
    for (let i = 0; i < participations.length; i++) {
      const participation = participations[i];
      const newRank = i + 1;

      // Track best rank
      if (!participation.bestRank || newRank < participation.bestRank) {
        participation.bestRank = newRank;
      }

      participation.currentRank = newRank;
      participation.lastRankUpdate = new Date();
    }

    await this.participationRepository.save(participations);
  }

  private calculateStandardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;

    return Math.round(Math.sqrt(variance) * 100) / 100;
  }
}
