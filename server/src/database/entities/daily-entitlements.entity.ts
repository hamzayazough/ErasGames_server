import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * DailyEntitlements entity
 *
 * Stores per-user daily entitlements for subscriptions, one-offs, and jitter fairness.
 * Created at drop time (or T-few minutes) for O(1) gameplay reads.
 *
 * KEY FEATURES:
 * - Composite PK (userId, localDate): exactly one row per user per local calendar day
 * - Jitter fairness: assignedJitterSec neutralizes push timing differences
 * - Subscription benefits: extra time, retries, practice mode
 * - One-off consumables: restarts, hints
 * - TZ snapshot: handles DST transitions and user travel
 *
 * CONSUMPTION PATTERNS:
 * - Atomic updates for thread-safe consumption during gameplay
 * - Retained for audit/analytics after day ends
 */
@Entity('daily_entitlements')
@Index('idx_entitlements_user_date', ['userId', 'localDate'], { unique: true })
@Index('idx_entitlements_date', ['localDate'])
@Index('idx_entitlements_tz_date', ['tz', 'localDate'])
export class DailyEntitlements {
  /** Composite PK: one row per user per local calendar day (YYYY-MM-DD). */
  @PrimaryColumn('uuid')
  userId!: string;

  @PrimaryColumn({ type: 'date' })
  localDate!: string; // user's local calendar date for the drop (e.g., '2025-09-01')

  @ManyToOne(() => User, (u) => u.entitlements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /** Snapshot of the TZ used for fairness (DST-safe IANA). */
  @Column({ type: 'varchar', length: 64 })
  tz!: string; // e.g., 'America/Toronto'

  /**
   * Deterministic per-user jitter (0–90 s) used in early-bonus fairness:
   * effective_start_delay = (startAt - tzDropAt) - assignedJitterSec
   */
  @Column({ type: 'int', default: 0 })
  assignedJitterSec!: number;

  /** Time bonus (in seconds). MVP=0, later: +120 (Basic), +240 (Premium). */
  @Column({ type: 'int', default: 0 })
  extraTimeSec!: number;

  /** Daily retry quota (granted/used). MVP can stay 0. */
  @Column({ type: 'int', default: 0 })
  retriesGranted!: number;

  @Column({ type: 'int', default: 0 })
  retriesUsed!: number;

  /** Practice mode access flag (Premium). */
  @Column({ type: 'boolean', default: false })
  practiceGranted!: boolean;

  @Column({ type: 'boolean', default: false })
  practiceUsed!: boolean;

  /** Restart quota (if you sell restarts as one-offs). */
  @Column({ type: 'int', default: 0 })
  restartsGranted!: number;

  @Column({ type: 'int', default: 0 })
  restartsUsed!: number;

  /** Hint quota (if you add hints). */
  @Column({ type: 'int', default: 0 })
  hintsGranted!: number;

  @Column({ type: 'int', default: 0 })
  hintsUsed!: number;

  /** Bookkeeping */
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
