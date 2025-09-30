import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Check,
} from 'typeorm';
import { SeasonStatus } from '../enums/season-status.enum';
import { SeasonParticipation } from './season-participation.entity';
import { DailySeasonProgress } from './daily-season-progress.entity';
import { SeasonLeaderboardSnapshot } from './season-leaderboard-snapshot.entity';

/**
 * Season entity
 *
 * Represents a 4-month competitive season in the quiz game.
 * Seasons start on the 1st of the month (first one November 1st).
 *
 * Features:
 * - 4-month duration per season
 * - Daily quiz drops throughout the season
 * - Points accumulation and leaderboards
 * - Streak tracking and achievements
 */
@Entity('seasons')
@Index('idx_seasons_status', ['status'])
@Index('idx_seasons_dates', ['startDate', 'endDate'])
@Index('idx_seasons_number', ['seasonNumber'], { unique: true })
@Check('ck_season_dates', '"start_date" < "end_date"')
@Check('ck_season_number_positive', '"season_number" > 0')
export class Season {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  name!: string; // e.g., "Season 1", "Winter 2024-25"

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string; // e.g., "The Eras Begin - Season 1"

  @Column({ name: 'season_number', type: 'integer', unique: true })
  seasonNumber!: number; // 1, 2, 3, etc.

  // Date range (4 months per season)
  @Column({ name: 'start_date', type: 'date' })
  startDate!: string; // YYYY-MM-DD format

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string; // YYYY-MM-DD format

  // Status and metadata
  @Column({ type: 'enum', enum: SeasonStatus, default: SeasonStatus.UPCOMING })
  status!: SeasonStatus;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'theme_json', type: 'jsonb', default: () => "'{}'" })
  themeJSON!: Record<string, any>; // Season-specific theming data

  // Relationships
  @OneToMany(() => SeasonParticipation, (participation) => participation.season)
  participations!: SeasonParticipation[];

  @OneToMany(() => DailySeasonProgress, (progress) => progress.season)
  dailyProgress!: DailySeasonProgress[];

  @OneToMany(() => SeasonLeaderboardSnapshot, (snapshot) => snapshot.season)
  leaderboardSnapshots!: SeasonLeaderboardSnapshot[];

  // Audit timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Computed properties
  get isActive(): boolean {
    return this.status === SeasonStatus.ACTIVE;
  }

  get isUpcoming(): boolean {
    return this.status === SeasonStatus.UPCOMING;
  }

  get isCompleted(): boolean {
    return this.status === SeasonStatus.COMPLETED;
  }

  get durationInDays(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }

  get daysRemaining(): number | null {
    if (this.status !== SeasonStatus.ACTIVE) return null;

    const today = new Date();
    const end = new Date(this.endDate);
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }

  get progress(): number {
    const today = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (today < start) return 0;
    if (today > end) return 100;

    const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays =
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  }
}
