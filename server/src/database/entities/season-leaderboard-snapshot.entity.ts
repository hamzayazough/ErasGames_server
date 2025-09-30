import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Season } from './season.entity';

/**
 * SeasonLeaderboardSnapshot entity
 *
 * Stores periodic snapshots of season leaderboards for historical tracking.
 * Captures top players, statistics, and participation data at specific points in time.
 */
@Entity('season_leaderboard_snapshots')
@Index('idx_season_leaderboard_season', ['season'])
@Index('idx_season_leaderboard_date', ['snapshotDate'])
@Index('uniq_season_leaderboard_snapshot', ['season', 'snapshotDate'], {
  unique: true,
})
export class SeasonLeaderboardSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relationships
  @ManyToOne(() => Season, (season) => season.leaderboardSnapshots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'season_id' })
  season!: Season;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string; // Date when snapshot was taken (YYYY-MM-DD)

  // Leaderboard data
  @Column({ name: 'top_players_json', type: 'jsonb' })
  topPlayersJSON!: TopPlayer[]; // Top N players with stats

  @Column({ name: 'total_participants', type: 'integer', default: 0 })
  totalParticipants!: number;

  // Statistics
  @Column({ name: 'stats_json', type: 'jsonb', default: () => "'{}'" })
  statsJSON!: SeasonStats; // Aggregated season stats

  // Audit
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // Computed properties
  get averagePoints(): number {
    return this.statsJSON?.averagePoints || 0;
  }

  get medianPoints(): number {
    return this.statsJSON?.medianPoints || 0;
  }

  get topScore(): number {
    if (!this.topPlayersJSON || this.topPlayersJSON.length === 0) return 0;
    return this.topPlayersJSON[0]?.totalPoints || 0;
  }

  get competitivenessFactor(): number {
    // Measure how close the competition is (lower = more competitive)
    if (!this.topPlayersJSON || this.topPlayersJSON.length < 2) return 0;

    const top = this.topPlayersJSON[0].totalPoints;
    const second = this.topPlayersJSON[1].totalPoints;

    return top > 0 ? ((top - second) / top) * 100 : 0;
  }
}

// Interface for top player data in snapshots
export interface TopPlayer {
  userId: string;
  handle: string;
  country?: string | null;
  totalPoints: number;
  rank: number;
  totalQuizzesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  perfectScores: number;
  averagePointsPerQuiz: number;
  perfectScoreRate: number;
  lastActivityAt: string;
  daysActive: number;
}

// Interface for season statistics
export interface SeasonStats {
  averagePoints: number;
  medianPoints: number;
  standardDeviation: number;
  totalQuizzesDelivered: number;
  averageParticipationRate: number;
  streakDistribution: Record<string, number>; // "1-3": 45, "4-7": 23, etc.
  perfectScoreDistribution: Record<string, number>; // "0": 12, "1-2": 34, etc.
  dailyParticipation: Record<string, number>; // "2024-11-01": 1234, etc.
  countryDistribution?: Record<string, number>; // "US": 45%, "CA": 25%, etc.
}
