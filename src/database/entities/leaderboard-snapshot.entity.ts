import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { LeaderboardScope } from '../enums/leaderboard-scope.enum';
import type { LbTopJSON } from './leaderboard/top-player.interface';

/**
 * LeaderboardSnapshot entity
 *
 * Stores periodic leaderboard snapshots for global, daily, season, theme, and regional leaderboards.
 *
 * SCOPE DEFINITIONS:
 * - DAILY: date = local calendar date of that board (e.g., 2025-09-01)
 * - SEASON/THEME/GLOBAL: we still set `date` to the snapshot day (UTC),
 *   while periodStart/periodEnd capture the season window if provided.
 *
 * KEY CONVENTIONS:
 * - DAILY (regional):    "America/Toronto"
 * - DAILY (global):      "global"
 * - SEASON:              "season:S25"
 * - THEME+SEASON:        "theme:lyrics:season:S25"
 * - GLOBAL (overall):    "global"
 *
 * This entity is append-only; old snapshots are retained for audit/history.
 * Handle and country are frozen at snapshot time for historical accuracy.
 */
@Entity('leaderboard_snapshots')
@Index('idx_lbscope_key_date', ['scope', 'key', 'date'], { unique: true })
@Index('idx_lbs_created', ['createdAt'])
export class LeaderboardSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * DAILY | SEASON | THEME | GLOBAL
   * - DAILY: date = local calendar date of that board (e.g., 2025-09-01)
   * - SEASON/THEME/GLOBAL: we still set `date` to the snapshot day (UTC),
   *   while periodStart/periodEnd capture the season window if provided.
   */
  @Column({ type: 'enum', enum: LeaderboardScope })
  scope!: LeaderboardScope;

  /**
   * Board key:
   * - DAILY (regional):    "America/Toronto"
   * - DAILY (global):      "global"
   * - SEASON:              "season:S25"
   * - THEME+SEASON:        "theme:lyrics:season:S25"
   * - GLOBAL (overall):    "global"
   */
  @Column({ type: 'text' })
  key!: string;

  /**
   * For DAILY: the local calendar date (YYYY-MM-DD) that board represents.
   * For others: store the snapshot date (UTC day).
   */
  @Column({ type: 'date' })
  date!: string;

  /**
   * Optional period window for season/theme boards.
   */
  @Column({ type: 'date', nullable: true })
  periodStart!: string | null;

  @Column({ type: 'date', nullable: true })
  periodEnd!: string | null;

  /**
   * Serialized top N, plus optional aggregates.
   * Keep it compact; avoid storing thousands of rows per snapshot.
   */
  @Column({ type: 'jsonb' })
  topJSON!: LbTopJSON;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
