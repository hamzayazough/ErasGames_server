import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Season } from './season.entity';
import { User } from './user.entity';

/**
 * SeasonParticipation entity
 *
 * Tracks a user's overall participation and performance in a specific season.
 * Maintains aggregate statistics, rankings, and streaks across the entire season.
 */
@Entity('season_participation')
@Index('idx_season_participation_season', ['season'])
@Index('idx_season_participation_user', ['user'])
@Index('idx_season_participation_active', ['season', 'isActive'])
@Index('idx_season_participation_points', ['season', 'totalPoints'])
@Index('uniq_season_participation', ['season', 'user'], { unique: true })
export class SeasonParticipation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Relationships
  @ManyToOne(() => Season, (season) => season.participations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'season_id' })
  season!: Season;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Participation metadata
  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'NOW()' })
  joinedAt!: Date;

  // Performance statistics
  @Column({ name: 'total_points', type: 'integer', default: 0 })
  totalPoints!: number;

  @Column({ name: 'total_quizzes_completed', type: 'integer', default: 0 })
  totalQuizzesCompleted!: number;

  @Column({ name: 'perfect_scores', type: 'integer', default: 0 })
  perfectScores!: number;

  @Column({ name: 'current_streak', type: 'integer', default: 0 })
  currentStreak!: number;

  @Column({ name: 'longest_streak', type: 'integer', default: 0 })
  longestStreak!: number;

  // Ranking information (updated periodically)
  @Column({ name: 'current_rank', type: 'integer', nullable: true })
  currentRank!: number | null;

  @Column({ name: 'best_rank', type: 'integer', nullable: true })
  bestRank!: number | null;

  @Column({ name: 'last_rank_update', type: 'timestamptz', nullable: true })
  lastRankUpdate!: Date | null;

  // Status and activity
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_activity_at', type: 'timestamptz', nullable: true })
  lastActivityAt!: Date | null;

  // Audit timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Computed properties
  get averagePointsPerQuiz(): number {
    if (this.totalQuizzesCompleted === 0) return 0;
    return (
      Math.round((this.totalPoints / this.totalQuizzesCompleted) * 100) / 100
    );
  }

  get perfectScoreRate(): number {
    if (this.totalQuizzesCompleted === 0) return 0;
    return (
      Math.round((this.perfectScores / this.totalQuizzesCompleted) * 10000) /
      100
    ); // Percentage with 2 decimal places
  }

  get isStreakActive(): boolean {
    return this.currentStreak > 0;
  }

  get rankImprovement(): number | null {
    if (!this.currentRank || !this.bestRank) return null;
    return this.bestRank - this.currentRank; // Positive means improvement
  }

  get participationDays(): number {
    const today = new Date();
    const joinDate = new Date(this.joinedAt);
    return Math.ceil(
      (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
}
